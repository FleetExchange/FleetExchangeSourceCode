// convex/payments.ts
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Step 1: Authorize payment when booking
export const authorizePayment = mutation({
  args: {
    userId: v.id("users"),
    transporterId: v.id("users"),
    tripId: v.id("trip"),
    purchaseTripId: v.id("purchaseTrip"),
    amount: v.number(),
    paystackAuthCode: v.string(),
    paystackTransactionRef: v.string(),
  },
  handler: async (ctx, args) => {
    const commissionRate = 0.02; // 2% commission
    const commissionAmount = args.amount * commissionRate;
    const transporterAmount = args.amount - commissionAmount;

    return await ctx.db.insert("payments", {
      userId: args.userId,
      transporterId: args.transporterId,
      tripId: args.tripId,
      purchaseTripId: args.purchaseTripId,
      paystackAuthCode: args.paystackAuthCode,
      paystackTransactionRef: args.paystackTransactionRef,
      totalAmount: args.amount,
      commissionAmount,
      transporterAmount,
      status: "authorized",
      authorizedAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

// Step 2: Charge payment when trip is confirmed
export const chargeAuthorizedPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    paystackChargeRef: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: "charged",
      chargedAt: Date.now(),
      paystackTransactionRef: args.paystackChargeRef,
    });

    // Create notification for client
    const payment = await ctx.db.get(args.paymentId);
    if (payment) {
      await ctx.runMutation(api.notifications.createNotification, {
        userId: payment.userId,
        type: "payment",
        message: `Payment of $${payment.totalAmount} has been charged for your trip booking.`,
        meta: { paymentId: args.paymentId, action: "payment_charged" },
      });
    }
  },
});

// Step 3: Release payment to transporter after delivery
export const releasePayment = mutation({
  args: {
    paymentId: v.id("payments"),
    paystackTransferRef: v.string(),
  },
  handler: async (ctx, args) => {
    // Release payment to transporter

    // Update payment status to released
    await ctx.db.patch(args.paymentId, {
      status: "released",
      releasedAt: Date.now(),
    });

    // Create notification for transporter
    const payment = await ctx.db.get(args.paymentId);
    if (payment) {
      await ctx.runMutation(api.notifications.createNotification, {
        userId: payment.transporterId,
        type: "payment",
        message: `Payment of $${payment.transporterAmount} has been released to your account.`,
        meta: { paymentId: args.paymentId, action: "payment_released" },
      });
    }
  },
});

// Get payment by trip ID
export const getPaymentByTrip = query({
  args: {
    tripId: v.id("trip"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("tripId"), args.tripId))
      .first();
  },
});
