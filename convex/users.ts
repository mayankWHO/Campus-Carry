import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get currently authenticated user details
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

// Get user profile details by ID + their ratings
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const ratings = await ctx.db
      .query("ratings")
      .filter((q) => q.eq(q.field("toUserId"), userId))
      .collect();

    return {
      ...user,
      ratings,
    };
  },
});

// Update current user's profile (like UPI ID or name)
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    upiId: v.optional(v.string()),
    college: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<typeof user> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.upiId !== undefined) updates.upiId = args.upiId;
    if (args.college !== undefined) updates.college = args.college;

    await ctx.db.patch(userId, updates);
  },
});

// Webhook endpoint helper to verify user
export const verifyUserByWebhook = mutation({
  args: {
    userId: v.string(),
    verificationId: v.optional(v.string()),
    college: v.string(),
  },
  handler: async (ctx, args) => {
    // SheerID webhook will pass the userId as string (or Id)
    const normalizedUserId = ctx.db.normalizeId("users", args.userId);
    if (!normalizedUserId) {
      throw new Error("Invalid user ID format");
    }

    const user = await ctx.db.get(normalizedUserId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(normalizedUserId, {
      verificationStatus: "verified",
      college: args.college,
      sheerIdVerificationId: args.verificationId,
    });
  },
});

// Simulate verification for demo purposes
export const simulateVerification = mutation({
  args: {
    college: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(userId, {
      verificationStatus: "verified",
      college: args.college,
      sheerIdVerificationId: "MOCK_SHEERID_" + Math.random().toString(36).substr(2, 9),
    });
  },
});
