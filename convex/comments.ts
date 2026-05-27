import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Helper to assert that user is authenticated and verified
async function getVerifiedUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  const user = await ctx.db.get(userId);
  if (!user || user.verificationStatus !== "verified") {
    throw new Error("Action restricted to verified students only");
  }
  return user;
}

// Create a comment (request) on a trip
export const createComment = mutation({
  args: {
    tripId: v.id("trips"),
    itemDescription: v.string(),
    quantity: v.optional(v.string()),
    estimatedAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getVerifiedUser(ctx);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }
    if (trip.status !== "open") {
      throw new Error("Trip is no longer accepting requests");
    }
    if (trip.goerId === user._id) {
      throw new Error("You cannot request items on your own trip");
    }

    const commentId = await ctx.db.insert("comments", {
      tripId: args.tripId,
      requesterId: user._id,
      itemDescription: args.itemDescription,
      quantity: args.quantity,
      estimatedAmount: args.estimatedAmount,
      status: "pending",
      createdAt: Date.now(),
    });

    // Notify Goer via email action
    const goer = await ctx.db.get(trip.goerId);
    if (goer && goer.email) {
      await ctx.scheduler.runAfter(0, internal.notifications.sendNotificationEmail, {
        to: goer.email,
        subject: `Someone wants to join your trip to ${trip.destination}`,
        body: `<p>Hi ${goer.name || "there"},</p><p><strong>${user.name}</strong> requested an item on your trip to ${trip.destination}: "${args.itemDescription}".</p><p>Please open CampusCarry to accept their request and coordinate.</p>`,
      });
    }

    return commentId;
  },
});

// Get comments for a trip with requester profiles
export const getComments = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_tripId", (q) => q.eq("tripId", tripId))
      .order("desc")
      .collect();

    const commentsWithRequester = await Promise.all(
      comments.map(async (comment) => {
        const requester = await ctx.db.get(comment.requesterId);
        return {
          ...comment,
          requester: requester
            ? {
                name: requester.name,
                averageRating: requester.averageRating,
                college: requester.college,
              }
            : null,
        };
      })
    );

    return commentsWithRequester;
  },
});

// Goer accepts a comment
export const acceptComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const user = await getVerifiedUser(ctx);

    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new Error("Request not found");
    }

    const trip = await ctx.db.get(comment.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.goerId !== user._id) {
      throw new Error("Only the Goer who posted this trip can accept requests");
    }

    if (comment.status !== "pending") {
      throw new Error("This request is already processed");
    }

    if (trip.slotsRemaining <= 0) {
      throw new Error("No slots remaining on this trip");
    }

    // Update slots
    const newSlotsRemaining = trip.slotsRemaining - 1;
    await ctx.db.patch(trip._id, {
      slotsRemaining: newSlotsRemaining,
      status: newSlotsRemaining === 0 ? "full" : "open",
    });

    // Update comment status
    await ctx.db.patch(commentId, {
      status: "accepted",
    });

    // Generate deterministic chatId: `${tripId}_${requesterId}`
    const chatId = `${trip._id}_${comment.requesterId}`;

    // Check if chat already exists
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .first();

    if (!existingChat) {
      await ctx.db.insert("chats", {
        chatId,
        tripId: trip._id,
        commentId,
        goerId: trip.goerId,
        requesterId: comment.requesterId,
        paymentStatus: "pending",
        deliveryStatus: "pending",
        estimatedAmount: comment.estimatedAmount,
        createdAt: Date.now(),
      });
    }

    // Update requester's stats
    const requester = await ctx.db.get(comment.requesterId);
    if (requester) {
      await ctx.db.patch(comment.requesterId, {
        totalTripsAsRequester: (requester.totalTripsAsRequester || 0) + 1,
      });

      // Notify Requester via email
      if (requester.email) {
        await ctx.scheduler.runAfter(0, internal.notifications.sendNotificationEmail, {
          to: requester.email,
          subject: `Your request was accepted — pay advance to confirm`,
          body: `<p>Hi ${requester.name || "there"},</p><p>Your request for "${comment.itemDescription}" on the trip to ${trip.destination} was accepted by <strong>${user.name}</strong>.</p><p>Open your chat page to pay the 50% advance via UPI and finalize details.</p>`,
        });
      }
    }

    return chatId;
  },
});

// Goer rejects a comment
export const rejectComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const user = await getVerifiedUser(ctx);

    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new Error("Request not found");
    }

    const trip = await ctx.db.get(comment.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.goerId !== user._id) {
      throw new Error("Only the Goer who posted this trip can reject requests");
    }

    if (comment.status !== "pending") {
      throw new Error("This request is already processed");
    }

    // Update comment status
    await ctx.db.patch(commentId, {
      status: "rejected",
    });

    // Notify requester via email
    const requester = await ctx.db.get(comment.requesterId);
    if (requester && requester.email) {
      await ctx.scheduler.runAfter(0, internal.notifications.sendNotificationEmail, {
        to: requester.email,
        subject: `Your request was declined`,
        body: `<p>Hi ${requester.name || "there"},</p><p>Your request for "${comment.itemDescription}" on the trip to ${trip.destination} was declined by <strong>${user.name}</strong>.</p><p>You can check the board for other trips!</p>`,
      });
    }
  },
});

// Get all pending comments/requests on the trips posted by the current user
export const getMyPendingComments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // 1. Get all active/open trips posted by this user
    const trips = await ctx.db
      .query("trips")
      .filter((q) => q.eq(q.field("goerId"), userId))
      .collect();

    const tripIds = trips.map((t) => t._id);

    // 2. Fetch all comments for these trips
    const allComments = [];
    for (const tripId of tripIds) {
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_tripId", (q) => q.eq("tripId", tripId))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();
      allComments.push(...comments);
    }

    // 3. Attach requester profile and trip details
    return await Promise.all(
      allComments.map(async (comment) => {
        const requester = await ctx.db.get(comment.requesterId);
        const trip = await ctx.db.get(comment.tripId);
        return {
          ...comment,
          requester: requester
            ? {
                name: requester.name,
                averageRating: requester.averageRating,
                college: requester.college,
              }
            : null,
          trip,
        };
      })
    );
  },
});
