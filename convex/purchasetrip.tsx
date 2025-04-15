import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserPurchaseForTrip = query({
  args: {
    tripId: v.id("trip"),
    userId: v.string(),
  },
  handler: async (ctx, { tripId, userId }) => {
    const purchaseTrip = await ctx.db
      .query("purchaseTrip")
      .withIndex("by_user_trip", (q) =>
        q.eq("userId", userId).eq("tripId", tripId)
      )
      .first();

    return purchaseTrip;
  },
});
