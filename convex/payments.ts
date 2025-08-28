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
    return await ctx.db.insert("payments", {
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
export const processRefund = action({
  args: {
    paystackReference: v.string(),
    paymentId: v.id("payments"),
    userId: v.id("users"),
    tripId: v.id("trip"),
  },
  handler: async (ctx, args) => {
    try {
      // Check if API key exists
      const apiKey = process.env.PAYSTACK_SECRET_KEY;
      if (!apiKey) {
        throw new Error("Paystack API key not configured");
      }

      console.log(
        `🔄 Processing refund for transaction: ${args.paystackReference}`
      );

      // Call Paystack refund API
      const response = await fetch("https://api.paystack.co/refund", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction: args.paystackReference,
        }),
      });

      const refundData = await response.json();

      console.log(`📊 Paystack refund response:`, {
        status: response.status,
        ok: response.ok,
        data: refundData,
      });

      if (response.ok && refundData.status) {
        // Update payment status in database
        await ctx.runMutation(api.payments.updatePaymentStatus, {
          paymentId: args.paymentId,
          status: "refunded",
        });

        // Send notification
        await ctx.runMutation(api.notifications.createNotification, {
          userId: args.userId,
          type: "payment",
          message:
            "Your payment has been refunded as the trip was not confirmed.",
          meta: { tripId: args.tripId, action: "payment_refunded" },
        });

        console.log(
          `✅ Refund processed successfully for ${args.paystackReference}`
        );
        return { success: true, message: "Refund processed successfully" };
      } else {
        // Log the full error details
        console.error(`❌ Paystack refund failed:`, {
          status: response.status,
          statusText: response.statusText,
          data: refundData,
        });

        throw new Error(
          `Refund failed: ${refundData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("🚨 Refund processing failed:", error);

      // Still mark as refund attempted in case of API issues
      try {
        await ctx.runMutation(api.payments.updatePaymentStatus, {
          paymentId: args.paymentId,
          status: "refund_failed",
        });
      } catch (dbError) {
        console.error("Failed to update payment status:", dbError);
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});
