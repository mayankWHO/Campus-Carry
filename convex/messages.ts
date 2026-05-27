import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all messages for a chat
export const getMessages = query({
  args: { chatId: v.string() },
  handler: async (ctx, { chatId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Access control check
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .first();

    if (!chat) {
      return [];
    }
    if (chat.goerId !== userId && chat.requesterId !== userId) {
      throw new Error("Unauthorized to access messages");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .order("asc")
      .collect();

    // Attach sender names for better UI display
    return await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return {
          ...msg,
          senderName: sender?.name || "User",
        };
      })
    );
  },
});

// Send a chat message
export const sendMessage = mutation({
  args: {
    chatId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Access control check
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }
    if (chat.goerId !== userId && chat.requesterId !== userId) {
      throw new Error("Unauthorized to send message");
    }

    await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: userId,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});
