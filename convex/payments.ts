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
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      userId: args.userId,
      transporterId: args.transporterId,
      tripId: args.tripId,
      purchaseTripId: args.purchaseTripId,
      paystackReference: args.paystackReference,
      totalAmount: args.totalAmount,
      commissionAmount: args.commissionAmount,
      transporterAmount: args.transporterAmount,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Authorize payment (webhook calls this)
export const authorizePayment = mutation({
  args: {
    paystackReference: v.string(),
    paystackAuthCode: v.string(),
    paystackCustomerCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find payment by reference
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) =>
        q.eq("paystackReference", args.paystackReference)
      )
      .first();

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Update payment with authorization details
    await ctx.db.patch(payment._id, {
      paystackAuthCode: args.paystackAuthCode,
      paystackCustomerCode: args.paystackCustomerCode,
      status: "authorized",
      authorizedAt: Date.now(),
    });

    // Notify transporter
    await ctx.runMutation(api.notifications.createNotification, {
      userId: payment.transporterId,
      type: "trip",
      message: `New trip booking authorized. Please confirm if you can take this trip.`,
      meta: {
        tripId: payment.tripId,
        action: "trip_awaiting_confirmation",
      },
    });

    return payment._id;
  },
});

// Charge authorized payment
export const chargePayment = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment || payment.status !== "authorized") {
      throw new Error("Payment not found or not authorized");
    }

    // Update status to charged (actual charging happens via API)
    await ctx.db.patch(args.paymentId, {
      status: "charged",
      chargedAt: Date.now(),
    });

    // Return auth code for API call
    return {
      authCode: payment.paystackAuthCode,
      amount: payment.totalAmount,
    };
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

// Get payment by reference
export const getPaymentByReference = query({
  args: { paystackReference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) =>
        q.eq("paystackReference", args.paystackReference)
      )
      .first();
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("pending"),
      v.literal("authorized"),
      v.literal("charged"),
      v.literal("released"),
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("refund_failed")
    ),
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
