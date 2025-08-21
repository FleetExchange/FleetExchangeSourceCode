import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPurchaseTrip = mutation({
  args: {
    tripId: v.id("trip"),
    userId: v.id("users"),

    clientPayable: v.number(), // Final amount of the sale to be paid by the client
    tripTotal: v.number(), // Total cost of the trip as specified by the transporter
    transporterAmount: v.number(), // Amount the transporter will receive after commission
    commissionAmount: v.number(), // Amount the platform will take as commission
    commissionPercentage: v.number(), // Percentage of the commission
    distance: v.number(), // Distance of the trip in km after specific addresses has been set
    freightNotes: v.string(),
    pickupInstructions: v.string(),
    deliveryInstructions: v.string(),
    cargoWeight: v.number(), // Total weight of the items to be shipped
  },
  handler: async (
    ctx,
    {
      tripId,
      userId,
      clientPayable,
      tripTotal,
      transporterAmount,
      commissionAmount,
      commissionPercentage,
      freightNotes,
      pickupInstructions,
      deliveryInstructions,
      cargoWeight,
      distance,
    }
  ) => {
    const newPurchaseTripId = await ctx.db.insert("purchaseTrip", {
      tripId,
      userId,
      purchasedAt: Date.now(),
      status: "Awaiting Confirmation",
      clientPayable,
      tripTotal,
      transporterAmount,
      commissionAmount,
      commissionPercentage,
      freightNotes,
      pickupInstructions,
      deliveryInstructions,
      cargoWeight,
      distance,
    });

    return newPurchaseTripId;
  },
});

export const deletePurchaseTrip = mutation({
  args: { tripId: v.id("trip") },
  handler: async (ctx, { tripId }) => {
    const existingPurchase = await ctx.db
      .query("purchaseTrip")
      .filter((q) => q.eq(q.field("tripId"), tripId))
      .first();
    if (!existingPurchase) {
      throw new Error("Purchase trip not found");
    }

    // Delete the purchase trip
    await ctx.db.delete(existingPurchase._id);

    return true;
  },
});

export const deletePurchaseTripByPurchaseTripId = mutation({
  args: { purchaseTripId: v.id("purchaseTrip") },
  handler: async (ctx, { purchaseTripId }) => {
    const existingPurchase = await ctx.db.get(purchaseTripId);
    if (!existingPurchase) {
      throw new Error("Purchase trip not found");
    }

    // Delete the purchase trip
    await ctx.db.delete(existingPurchase._id);

    return true;
  },
});

export const getPurchaseTripById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const purchaseTrips = await ctx.db
      .query("purchaseTrip")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return purchaseTrips;
  },
});

export const getPurchaseTripByTripId = query({
  args: { tripId: v.id("trip") },
  handler: async (ctx, { tripId }) => {
    const purchaseTrip = await ctx.db
      .query("purchaseTrip")
      .filter((q) => q.eq(q.field("tripId"), tripId))
      .first();

    // Explicitly return null if no purchase trip is found
    if (!purchaseTrip) {
      return null;
    }

    return purchaseTrip;
  },
});

// Get purchase by Id array of tripIds
export const getPurchaseTripByIdArray = query({
  args: {
    tripIds: v.array(v.id("trip")),
  },
  handler: async (ctx, { tripIds }) => {
    // Handle edge case of empty array
    if (tripIds.length === 0) {
      return [];
    }

    // More efficient approach - get all purchase trips first, then filter
    const allPurchaseTrips = await ctx.db.query("purchaseTrip").collect();

    // Filter in memory (more reliable than complex DB filters)
    const filteredTrips = allPurchaseTrips.filter((trip) =>
      tripIds.includes(trip.tripId)
    );

    return filteredTrips;
  },
});

export const getPurchaseTrip = query({
  args: { purchaseTripId: v.id("purchaseTrip") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.purchaseTripId);
  },
});

export const updatePurchaseTripStatus = mutation({
  args: {
    purchaseTripId: v.id("purchaseTrip"),
    newStatus: v.union(
      v.literal("Awaiting Confirmation"),
      v.literal("Booked"),
      v.literal("Dispatched"),
      v.literal("Delivered"),
      v.literal("Cancelled"),
      v.literal("Refunded")
    ),
  },
  handler: async (ctx, args) => {
    const { purchaseTripId, newStatus } = args;

    const existingTrip = await ctx.db.get(purchaseTripId);
    if (!existingTrip) throw new Error("Purchase trip not found");

    return await ctx.db.patch(purchaseTripId, {
      status: newStatus,
    });
  },
});

// Get purchase trip by userId
export const getPurchaseTripByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const purchaseTrips = await ctx.db
      .query("purchaseTrip")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return purchaseTrips;
  },
});

// Add trip rating
export const addTripRating = mutation({
  args: {
    purchaseTripId: v.id("purchaseTrip"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate rating is between 1-5
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Update the purchase trip with the rating
    await ctx.db.patch(args.purchaseTripId, {
      tripRating: args.rating,
      tripRatingComment: args.comment || "",
    });
  },
});

// Get the purchase trip via a mutation specifically for the BookTripButton
export const getPurchaseTripForBooking = mutation({
  args: { purchaseTripId: v.id("purchaseTrip") },
  handler: async (ctx, { purchaseTripId }) => {
    const purchaseTrip = await ctx.db.get(purchaseTripId);
    if (!purchaseTrip) {
      throw new Error("Purchase trip not found");
    }

    return purchaseTrip;
  },
});
