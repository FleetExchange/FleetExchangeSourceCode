// convex/payments.ts
import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Create initial payment record
export const createPayment = mutation({
  args: {
    userId: v.id("users"),
    transporterId: v.id("users"),
    tripId: v.id("trip"),
    purchaseTripId: v.id("purchaseTrip"),
    totalAmount: v.number(), // Total amount for the trip including service fees
    transporterAmount: v.number(), // Amount transporter receives
    commissionAmount: v.number(), // Your platform commission
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.insert("payments", {
      userId: args.userId,
      transporterId: args.transporterId,
      tripId: args.tripId,
      purchaseTripId: args.purchaseTripId,
      totalAmount: args.totalAmount,
      commissionAmount: args.commissionAmount,
      transporterAmount: args.transporterAmount,
      status: "pending",
      createdAt: Date.now(),
    });

    return payment;
  },
});

export const requestPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    authorizationUrl: v.string(),
    reference: v.string(),
    paymentRequestedAt: v.optional(v.number()),
    paymentDeadline: v.optional(v.number()),
  },
  handler: async (
    ctx,
    {
      paymentId,
      authorizationUrl,
      reference,
      paymentRequestedAt,
      paymentDeadline,
    }
  ) => {
    const payment = await ctx.db.get(paymentId);
    if (!payment) throw new Error("Payment not found");

    // idempotency guard
    if (
      payment.status === "payment_requested" ||
      payment.status === "charged"
    ) {
      return {
        alreadyRequested: true,
        paymentRequestUrl: payment.paymentRequestUrl,
      };
    }

    const requestedAt =
      typeof paymentRequestedAt === "number" ? paymentRequestedAt : Date.now();
    const deadline =
      typeof paymentDeadline === "number"
        ? paymentDeadline
        : requestedAt + 24 * 60 * 60 * 1000;

    // Use existing DB mutation to persist initialize data
    await ctx.runMutation(api.payments.updatePaymentRecord, {
      paymentId,
      paystackInitReference: reference,
      paymentRequestUrl: authorizationUrl,
      paymentRequestedAt: requestedAt,
      paymentDeadline: deadline,
      status: "payment_requested",
      paymentAttempts: (payment.paymentAttempts || 0) + 1,
    });

    return {
      success: true,
      authorization_url: authorizationUrl,
      reference,
    };
  },
});

export const getPaymentById = query({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});

// Release payment to transporter
export const releasePayment = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: "released",
      releasedAt: Date.now(),
    });

    const payment = await ctx.db.get(args.paymentId);
    if (payment) {
      await ctx.runMutation(api.notifications.createNotification, {
        userId: payment.transporterId,
        type: "payment",
        message: `Payment of R${payment.transporterAmount} has been released to your account.`,
        meta: {
          paymentId: args.paymentId,
          action: "payment_released",
        },
      });
    }
  },
});

// Get payment by trip
export const getPaymentByTrip = query({
  args: { tripId: v.id("trip") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .first();
  },
});

export const updatePaymentRecord = mutation({
  args: {
    paymentId: v.id("payments"),
    paystackInitReference: v.string(),
    paymentRequestUrl: v.string(),
    paymentRequestedAt: v.number(),
    paymentDeadline: v.number(),
    status: v.literal("payment_requested"),
    paymentAttempts: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      paystackInitReference: args.paystackInitReference,
      paymentRequestUrl: args.paymentRequestUrl,
      paymentRequestedAt: args.paymentRequestedAt,
      paymentDeadline: args.paymentDeadline,
      status: args.status,
      paymentAttempts: args.paymentAttempts,
    });
  },
});

// Get payment by reference
export const getPaymentByReference = query({
  args: { paystackReference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_init_reference", (q) =>
        q.eq("paystackInitReference", args.paystackReference)
      )
      .first();
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("pending"), // Payment record created but no request yet
      v.literal("payment_requested"), // initialize called, waiting for customer to pay
      v.literal("charged"), // Payment taken from client (capture success)
      v.literal("released"), // Payment sent to transporter
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("refund_failed"),
      v.literal("forfeited")
    ),
    gatewayFee: v.optional(v.number()), // Fee charged by payment gateway
    chargedAt: v.optional(v.number()), // Timestamp when charged
    transferReference: v.optional(v.string()),
    refundedAmount: v.optional(v.number()), // in ZAR
    refundProcessedAt: v.optional(v.number()), // timestamp
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Update payment status
    await ctx.db.patch(args.paymentId, {
      status: args.status,
      transferReference: args.transferReference,
      transferredAt: args.transferReference ? Date.now() : undefined,
      gatewayFee: args.gatewayFee ?? payment.gatewayFee,
      chargedAt: args.chargedAt ?? payment.chargedAt,
    });

    return payment;
  },
});

// Delete payment
export const deletePayment = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Delete the payment record
    await ctx.db.delete(args.paymentId);

    return true;
  },
});

// Process refund
export const processRefund = mutation({
  args: {
    paymentId: v.id("payments"),
    refundedAmount: v.number(), // in ZAR (server can convert if needed)
    paystackReference: v.optional(v.string()),
  },
  handler: async (ctx, { paymentId, refundedAmount, paystackReference }) => {
    const payment = await ctx.db.get(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Idempotency guard: if already refunded with at least this amount, skip
    const existingRefund =
      typeof payment.refundedAmount === "number" ? payment.refundedAmount : 0;
    if (existingRefund >= refundedAmount && payment.status === "refunded") {
      return { ok: true, alreadyProcessed: true };
    }

    // Only process refunds for payments that were charged (or allow for manual override)
    if (payment.status !== "charged" && payment.status !== "refund_failed") {
      // don't overwrite other terminal states
      return {
        ok: false,
        message: "Payment not in refundable state",
        status: payment.status,
      };
    }

    // Patch payment record to reflect refund
    await ctx.db.patch(paymentId, {
      status: "refunded",
      refundedAmount: refundedAmount,
      refundProcessedAt: Date.now(),
      paystackInitReference: paystackReference ?? payment.paystackInitReference,
    });

    // Cancel related purchaseTrip
    try {
      if (payment.purchaseTripId) {
        await ctx.db.patch(payment.purchaseTripId, { status: "Refunded" });
      }
    } catch (e) {
      console.warn(
        "Failed to update related purchaseTrip/trip during refund:",
        e
      );
    }

    // notify user(s)
    try {
      await ctx.runMutation(api.notifications.createNotification, {
        userId: payment.userId,
        type: "payment",
        message: `A refund of ${refundedAmount.toFixed(2)} ZAR has been processed for your payment.`,
        meta: { paymentId },
      });
    } catch (e) {
      // non-fatal
      console.error("Failed to send refund notification", e);
    }

    return { ok: true };
  },
});

export const getPaymentByPurchaseTrip = query({
  args: { purchaseTripId: v.id("purchaseTrip") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_purchase_trip", (q) =>
        q.eq("purchaseTripId", args.purchaseTripId)
      )
      .first();
  },
});
