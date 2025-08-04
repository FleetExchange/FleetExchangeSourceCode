// app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

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

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;

      case "charge.failed":
        // LAYER 2: Payment failed - cleanup booking
        console.log("Payment failed, cleaning up:", event.data.reference);
        await cleanupFailedBooking(event.data.reference, "payment_failed");
        break;
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function handleChargeSuccess(data: any) {
  try {
    const { reference, authorization, customer } = data;

    // Authorize payment in database
    await convex.mutation(api.payments.authorizePayment, {
      paystackReference: reference,
      paystackAuthCode: authorization.authorization_code,
      paystackCustomerCode: customer.customer_code,
    });

    console.log(`Payment authorized: ${reference}`);
  } catch (error) {
    console.error("Error handling charge success:", error);
  }
}

async function cleanupFailedBooking(reference: string, reason: string) {
  try {
    await fetch("/api/booking/cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paystackReference: reference,
        reason,
      }),
    });
  } catch (error) {
    console.error("Webhook cleanup failed:", error);
  }
}
