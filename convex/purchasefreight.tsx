import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserPurchaseForFreight = query({
  args: {
    freightId: v.id("freight"),
    userId: v.string(),
  },
  handler: async (ctx, { freightId, userId }) => {
    const purchaseFreight = await ctx.db
      .query("purchaseFreight")
      .withIndex("by_user_freight", (q) =>
        q.eq("userId", userId).eq("freightId", freightId)
      )
      .first();

    return purchaseFreight;
  },
});
