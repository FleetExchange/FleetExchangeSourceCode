import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPurchaseTrip = mutation({
  args: {
    tripId: v.id("trip"),
    userId: v.id("users"),
    amount: v.number(),
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
      amount,
      freightNotes,
      pickupInstructions,
      deliveryInstructions,
      cargoWeight,
    }
  ) => {
    const newPurchaseTripId = await ctx.db.insert("purchaseTrip", {
      tripId,
      userId,
      purchasedAt: Date.now(),
      status: "Awaiting Confirmation",
      amount,
      freightNotes,
      pickupInstructions,
      deliveryInstructions,
      cargoWeight,
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
    const purchaseTrips = await ctx.db
      .query("purchaseTrip")
      .filter((q) => q.and(...tripIds.map((id) => q.eq(q.field("tripId"), id))))
      .collect();

    return purchaseTrips;
  },
});

export const updatePurchaseTripStatus = mutation({
  args: {
    purchaseTripId: v.id("purchaseTrip"),
    newStatus: v.union(
      v.literal("Awaiting Confirmation"),
      v.literal("Booked"),
      v.literal("Dispatched"),
      v.literal("Delivered")
    ),
  },
  handler: async (ctx, { purchaseTripId, newStatus }) => {
    const existing = await ctx.db.get(purchaseTripId);

    if (!existing) {
      throw new Error("Purchase trip not found");
    }

    await ctx.db.patch(purchaseTripId, {
      status: newStatus,
    });
  },
});
