import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Submit a rating for a user after transaction completion
export const submitRating = mutation({
  args: {
    chatId: v.string(),
    toUserId: v.id("users"),
    stars: v.number(),
    comment: v.optional(v.string()),
    role: v.union(v.literal("goer"), v.literal("requester")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify chat exists and user is part of it
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }
    if (chat.goerId !== userId && chat.requesterId !== userId) {
      throw new Error("Unauthorized to submit rating");
    }

    // Verify rating hasn't been submitted already by this user for this chat
    const existingRating = await ctx.db
      .query("ratings")
      .filter((q) =>
        q.and(
          q.eq(q.field("chatId"), args.chatId),
          q.eq(q.field("fromUserId"), userId)
        )
      )
      .first();

    if (existingRating) {
      throw new Error("You have already rated this transaction");
    }

    // Insert new rating
    await ctx.db.insert("ratings", {
      fromUserId: userId,
      toUserId: args.toUserId,
      chatId: args.chatId,
      stars: args.stars,
      comment: args.comment,
      role: args.role,
      createdAt: Date.now(),
    });

    // Recalculate average rating for the target user
    const ratings = await ctx.db
      .query("ratings")
      .filter((q) => q.eq(q.field("toUserId"), args.toUserId))
      .collect();

    const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
    const avg = parseFloat((sum / ratings.length).toFixed(1));

    await ctx.db.patch(args.toUserId, {
      averageRating: avg,
    });

    return avg;
  },
});
