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
      case "transfer.success":
        await handleTransferSuccess(event.data);
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

async function handleTransferSuccess(data: any) {
  try {
    // Extract payment ID from transfer reason
    const paymentId = data.reason.match(/payment-(\w+)/)?.[1];

    if (paymentId) {
      await convex.mutation(api.payments.releasePayment, {
        paymentId: paymentId as any, // Cast to ID type
      });
    }
  } catch (error) {
    console.error("Error handling transfer success:", error);
  }
}
