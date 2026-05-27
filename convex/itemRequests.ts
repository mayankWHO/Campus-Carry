import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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

// Create a reverse item request
export const createItemRequest = mutation({
  args: {
    itemName: v.string(),
    itemDescription: v.string(),
    preferredDestination: v.optional(v.string()),
    urgency: v.union(
      v.literal("flexible"),
      v.literal("this_week"),
      v.literal("urgent")
    ),
    maxBudget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getVerifiedUser(ctx);

    const requestId = await ctx.db.insert("itemRequests", {
      requesterId: user._id,
      itemName: args.itemName,
      itemDescription: args.itemDescription,
      preferredDestination: args.preferredDestination,
      urgency: args.urgency,
      maxBudget: args.maxBudget,
      status: "open",
      createdAt: Date.now(),
    });

    return requestId;
  },
});

// Get open reverse requests
export const getItemRequests = query({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db
      .query("itemRequests")
      .filter((q) => q.eq(q.field("status"), "open"))
      .order("desc")
      .collect();

    // Attach requester profile
    return await Promise.all(
      requests.map(async (req) => {
        const requester = await ctx.db.get(req.requesterId);
        return {
          ...req,
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
  },
});

// Goer matches an item request
export const matchItemRequest = mutation({
  args: { requestId: v.id("itemRequests") },
  handler: async (ctx, { requestId }) => {
    const user = await getVerifiedUser(ctx);

    const req = await ctx.db.get(requestId);
    if (!req) {
      throw new Error("Item request not found");
    }
    if (req.status !== "open") {
      throw new Error("This request is already matched or closed");
    }
    if (req.requesterId === user._id) {
      throw new Error("You cannot fulfill your own request");
    }

    // 1. Create an implicit trip for this Goer to satisfy the schema
    const tripId = await ctx.db.insert("trips", {
      goerId: user._id,
      destination: req.preferredDestination || "Requested Store",
      destinationCategory: "other",
      tripDate: new Date().toISOString().split("T")[0],
      departureTime: "Immediate",
      slotsAvailable: 1,
      slotsRemaining: 0,
      maxItemSize: "medium",
      status: "full",
      createdAt: Date.now(),
    });

    // Increment user's total trips as goer
    await ctx.db.patch(user._id, {
      totalTripsAsGoer: (user.totalTripsAsGoer || 0) + 1,
    });

    // 2. Update request status to matched
    await ctx.db.patch(requestId, {
      status: "matched",
    });

    // 3. Create chat: chatId is `${tripId}_${requesterId}`
    const chatId = `${tripId}_${req.requesterId}`;
    await ctx.db.insert("chats", {
      chatId,
      tripId,
      itemRequestId: requestId,
      goerId: user._id,
      requesterId: req.requesterId,
      paymentStatus: "pending",
      deliveryStatus: "pending",
      estimatedAmount: req.maxBudget,
      createdAt: Date.now(),
    });

    // Increment requester's stats
    const requester = await ctx.db.get(req.requesterId);
    if (requester) {
      await ctx.db.patch(req.requesterId, {
        totalTripsAsRequester: (requester.totalTripsAsRequester || 0) + 1,
      });
    }

    return chatId;
  },
});

