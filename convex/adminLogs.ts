import { use } from "react";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAdminLog = mutation({
  args: {
    userEnvolved: v.id("users"), // note: matches schema field name
    action: v.string(),
    details: v.string(),
  },
  handler: async (ctx, { userEnvolved, action, details }) => {
    const _id = await ctx.db.insert("adminLogs", {
      createdAt: Date.now(),
      userEnvolved,
      action,
      details,
      resolved: false,
    });
    return _id;
  },
});

export const checkErrorForPaymentRelease = query({
  args: {
    paymentId: v.id("payments"),
    userId: v.id("users"),
    purchaseTripId: v.id("purchaseTrip"),
  },
  handler: async (ctx, { paymentId, userId, purchaseTripId }) => {
    const details = `Failed to release payment ${paymentId} for purchaseTrip ${purchaseTripId}`;

    const existingLog = await ctx.db
      .query("adminLogs")
      .filter((q) =>
        q.and(
          q.eq(q.field("action"), "Payment release failed"),
          q.eq(q.field("details"), details),
          q.eq(q.field("userEnvolved"), userId)
        )
      )
      .first();

    return !!existingLog; // true if found, false otherwise
  },
});
