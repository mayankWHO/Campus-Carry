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

// Get details of a single chat room
export const getChat = query({
  args: { chatId: v.string() },
  handler: async (ctx, { chatId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .first();

    if (!chat) {
      return null;
    }

    // Access control: only Goer or Requester in this chat can view it
    if (chat.goerId !== userId && chat.requesterId !== userId) {
      throw new Error("Not authorized to access this chat");
    }

    const goer = await ctx.db.get(chat.goerId);
    const requester = await ctx.db.get(chat.requesterId);
    const trip = await ctx.db.get(chat.tripId);

    // If chat is linked to a comment or request, fetch details
    let itemDetails = "";
    const activePrice = chat.estimatedAmount !== undefined ? chat.estimatedAmount : null;
    if (chat.commentId) {
      const comment = await ctx.db.get(chat.commentId);
      if (comment) {
        const price = activePrice !== null ? activePrice : (comment.estimatedAmount || "N/A");
        itemDetails = `${comment.quantity || "1"}x ${comment.itemDescription} (Estimated: ₹${price})`;
      }
    } else if (chat.itemRequestId) {
      const req = await ctx.db.get(chat.itemRequestId);
      if (req) {
        const price = activePrice !== null ? activePrice : (req.maxBudget || "N/A");
        itemDetails = `${req.itemName} - ${req.itemDescription} (Budget: ₹${price})`;
      }
    }

    return {
      ...chat,
      goer: goer ? { name: goer.name, upiId: goer.upiId, averageRating: goer.averageRating } : null,
      requester: requester ? { name: requester.name, averageRating: requester.averageRating } : null,
      trip,
      itemDetails,
    };
  },
});

// Requester marks the 50% advance as paid
export const markAdvancePaid = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, { chatId }) => {
    const user = await getVerifiedUser(ctx);

    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }
    if (chat.requesterId !== user._id) {
      throw new Error("Only the Requester can mark the advance as paid");
    }

    await ctx.db.patch(chat._id, {
      paymentStatus: "advance_paid",
    });
  },
});

// Goer marks the items as delivered
export const markDelivered = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, { chatId }) => {
    const user = await getVerifiedUser(ctx);

    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }
    if (chat.goerId !== user._id) {
      throw new Error("Only the Goer can mark items as delivered");
    }

    await ctx.db.patch(chat._id, {
      deliveryStatus: "delivered",
    });
  },
});

// Requester confirms delivery and pays the remaining amount
export const confirmDelivery = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, { chatId }) => {
    const user = await getVerifiedUser(ctx);

    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }
    if (chat.requesterId !== user._id) {
      throw new Error("Only the Requester can confirm delivery");
    }

    await ctx.db.patch(chat._id, {
      deliveryStatus: "confirmed",
      paymentStatus: "fully_paid",
    });

    // Mark the trip as completed if all slots are done or trip is completed
    const trip = await ctx.db.get(chat.tripId);
    if (trip && trip.status !== "completed") {
      // Check if all other chats for this trip are confirmed/completed
      const relatedChats = await ctx.db
        .query("chats")
        .filter((q) => q.eq(q.field("tripId"), chat.tripId))
        .collect();

      const allConfirmed = relatedChats.every((c) => c.deliveryStatus === "confirmed");
      if (allConfirmed && trip.slotsRemaining === 0) {
        await ctx.db.patch(trip._id, {
          status: "completed",
        });
      }
    }
  },
});

// Get all chats for the currently authenticated user
export const getMyChats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Fetch all chats where user is goer OR requester
    const goerChats = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("goerId"), userId))
      .collect();

    const requesterChats = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("requesterId"), userId))
      .collect();

    const allChats = [...goerChats, ...requesterChats].sort(
      (a, b) => b.createdAt - a.createdAt
    );

    // Resolve other party details and item details
    return await Promise.all(
      allChats.map(async (chat) => {
        const isGoer = chat.goerId === userId;
        const otherUserId = isGoer ? chat.requesterId : chat.goerId;
        const otherUser = await ctx.db.get(otherUserId);
        const trip = await ctx.db.get(chat.tripId);

        let itemDetails = "";
        if (chat.commentId) {
          const comment = await ctx.db.get(chat.commentId);
          if (comment) {
            itemDetails = `${comment.quantity || "1"}x ${comment.itemDescription}`;
          }
        } else if (chat.itemRequestId) {
          const req = await ctx.db.get(chat.itemRequestId);
          if (req) {
            itemDetails = `${req.itemName}`;
          }
        }

        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat.chatId))
          .order("desc")
          .first();

        return {
          ...chat,
          otherUser: otherUser ? { name: otherUser.name, averageRating: otherUser.averageRating } : null,
          role: isGoer ? "goer" : "requester",
          trip,
          itemDetails,
          lastMessage: lastMessage
            ? {
                senderId: lastMessage.senderId,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
              }
            : null,
        };
      })
    );
  },
});

// Update the estimated amount inside the chat coordination room
export const updateEstimatedAmount = mutation({
  args: { 
    chatId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, { chatId, amount }) => {
    const user = await getVerifiedUser(ctx);

    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.goerId !== user._id && chat.requesterId !== user._id) {
      throw new Error("Not authorized to update amount");
    }

    if (chat.paymentStatus !== "pending") {
      throw new Error("Cannot update price after advance has been paid");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    await ctx.db.patch(chat._id, {
      estimatedAmount: amount,
    });
  },
});
