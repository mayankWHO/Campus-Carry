import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Override / extend users table from authTables
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    
    // Custom properties for CampusCarry
    college: v.optional(v.string()),
    upiId: v.optional(v.string()),
    verificationStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("verified")
      )
    ),
    sheerIdVerificationId: v.optional(v.string()),
    averageRating: v.optional(v.number()),
    totalTripsAsGoer: v.optional(v.number()),
    totalTripsAsRequester: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  }).index("email", ["email"]),

  trips: defineTable({
    goerId: v.id("users"),
    destination: v.string(),
    destinationCategory: v.union(
      v.literal("grocery"),
      v.literal("pharmacy"),
      v.literal("electronics"),
      v.literal("food"),
      v.literal("other")
    ),
    tripDate: v.string(),                    // ISO date string
    departureTime: v.string(),               // e.g. "10:00 AM"
    slotsAvailable: v.number(),              // 1, 2, or 3
    slotsRemaining: v.number(),              // decrements on match
    maxItemSize: v.union(
      v.literal("small"),
      v.literal("medium"),
      v.literal("large")
    ),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("full"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
  }),

  comments: defineTable({
    tripId: v.id("trips"),
    requesterId: v.id("users"),
    itemDescription: v.string(),
    quantity: v.optional(v.string()),
    estimatedAmount: v.optional(v.number()),  // in INR
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
  }).index("by_tripId", ["tripId"]),

  itemRequests: defineTable({               // reverse request board
    requesterId: v.id("users"),
    itemName: v.string(),
    itemDescription: v.string(),
    preferredDestination: v.optional(v.string()),
    urgency: v.union(
      v.literal("flexible"),
      v.literal("this_week"),
      v.literal("urgent")
    ),
    maxBudget: v.optional(v.number()),
    status: v.union(
      v.literal("open"),
      v.literal("matched"),
      v.literal("fulfilled"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
  }),

  chats: defineTable({
    chatId: v.string(),                      // `${tripId}_${requesterId}`
    tripId: v.id("trips"),
    commentId: v.optional(v.id("comments")), // optional if matched from reverse board
    itemRequestId: v.optional(v.id("itemRequests")), // optional if matched from reverse board
    goerId: v.id("users"),
    requesterId: v.id("users"),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("advance_paid"),
      v.literal("fully_paid")
    ),
    deliveryStatus: v.union(
      v.literal("pending"),
      v.literal("delivered"),
      v.literal("confirmed")
    ),
    estimatedAmount: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_chatId", ["chatId"]),

  messages: defineTable({
    chatId: v.string(),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_chatId", ["chatId"]),         // index for efficient querying

  ratings: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    chatId: v.string(),
    stars: v.number(),                       // 1-5
    comment: v.optional(v.string()),
    role: v.union(
      v.literal("goer"),                     // rating given to the goer
      v.literal("requester")                 // rating given to the requester
    ),
    createdAt: v.number(),
  }),
});
