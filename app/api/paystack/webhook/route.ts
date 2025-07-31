// app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;

      case "transfer.success":
        await handleTransferSuccess(event.data);
        break;

      case "transfer.failed":
        await handleTransferFailed(event.data);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function handleChargeSuccess(data: any) {
  const { reference, metadata } = data;

  if (metadata?.tripId) {
    const purchaseTrip = useQuery(api.purchasetrip.getPurchaseTripByTripId, {
      tripId: metadata.tripId as Id<"trip">,
    })?._id;

    if (purchaseTrip) {
      // Authorize payment in database
      await convex.mutation(api.payments.authorizePayment, {
        userId: metadata.userId,
        transporterId: metadata.transporterId,
        tripId: metadata.tripId,
        amount: data.amount / 100, // Convert from cents
        paystackAuthCode: data.authorization.authorization_code,
        paystackTransactionRef: reference,
        purchaseTripId: purchaseTrip,
      });
    }
  }
}

async function handleTransferSuccess(data: any) {
  // Mark payment as released
  const paymentId = data.reason.match(/payment-(\w+)/)?.[1];
  if (paymentId) {
    await convex.mutation(api.payments.releasePayment, {
      paymentId,
      paystackTransferRef: data.reference,
    });
  }
}

async function handleTransferFailed(data: any) {
  // Handle failed transfer
  console.error("Transfer failed:", data);
  // You might want to retry or notify admin
}
