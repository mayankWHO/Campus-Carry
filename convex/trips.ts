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

// Create a new trip
export const createTrip = mutation({
  args: {
    destination: v.string(),
    destinationCategory: v.union(
      v.literal("grocery"),
      v.literal("pharmacy"),
      v.literal("electronics"),
      v.literal("food"),
      v.literal("other")
    ),
    tripDate: v.string(),
    departureTime: v.string(),
    slotsAvailable: v.number(),
    maxItemSize: v.union(
      v.literal("small"),
      v.literal("medium"),
      v.literal("large")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getVerifiedUser(ctx);

    const tripId = await ctx.db.insert("trips", {
      goerId: user._id,
      destination: args.destination,
      destinationCategory: args.destinationCategory,
      tripDate: args.tripDate,
      departureTime: args.departureTime,
      slotsAvailable: args.slotsAvailable,
      slotsRemaining: args.slotsAvailable,
      maxItemSize: args.maxItemSize,
      notes: args.notes,
      status: "open",
      createdAt: Date.now(),
    });

    // Increment user's total trips as goer
    await ctx.db.patch(user._id, {
      totalTripsAsGoer: (user.totalTripsAsGoer || 0) + 1,
    });

    return tripId;
  },
});

// Get all trips with filters
export const getTrips = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tripsQuery = ctx.db.query("trips");

    let trips = await tripsQuery.order("desc").collect();

    // Perform manual filters
    if (args.category) {
      trips = trips.filter((t) => t.destinationCategory === args.category);
    }
    if (args.status) {
      trips = trips.filter((t) => t.status === args.status);
    } else {
      // By default show open and full trips
      trips = trips.filter((t) => t.status === "open" || t.status === "full");
    }

    // Attach user profile for each trip
    const tripsWithGoer = await Promise.all(
      trips.map(async (trip) => {
        const goer = await ctx.db.get(trip.goerId);
        return {
          ...trip,
          goer: goer
            ? {
                name: goer.name,
                averageRating: goer.averageRating,
                college: goer.college,
              }
            : null,
        };
      })
    );

    return tripsWithGoer;
  },
});

// Get single trip details with Goer details
export const getTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const trip = await ctx.db.get(tripId);
    if (!trip) {
      return null;
    }

    const goer = await ctx.db.get(trip.goerId);
    return {
      ...trip,
      goer,
    };
  },
});

// Cancel a trip
export const cancelTrip = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const user = await getVerifiedUser(ctx);
    const trip = await ctx.db.get(tripId);

    if (!trip) {
      throw new Error("Trip not found");
    }
    if (trip.goerId !== user._id) {
      throw new Error("Not authorized to cancel this trip");
    }

    await ctx.db.patch(tripId, {
      status: "cancelled",
    });

    // Also cancel all associated comments/requests or chats if they were open
    // For MVP, we can keep them or leave them
  },
});

