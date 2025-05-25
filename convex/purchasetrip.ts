import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPurchaseTrip = mutation({
  args: {
    tripId: v.id("trip"),
    userId: v.id("users"),
    amount: v.number(),
    freightNotes: v.string(),
    logisticNotes: v.string(),
  },
  handler: async (
    ctx,
    { tripId, userId, amount, freightNotes, logisticNotes }
  ) => {
    const newPurchaseTripId = await ctx.db.insert("purchaseTrip", {
      tripId,
      userId,
      purchasedAt: Date.now(),
      status: "Awaiting Confirmation",
      amount,
      freightNotes,
      logisticNotes,
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
