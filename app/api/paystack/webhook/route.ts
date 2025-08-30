// app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Use WEBHOOK secret when available, fall back to PAYSTACK secret
const PAYSTACK_WEBHOOK_SECRET =
  process.env.PAYSTACK_WEBHOOK_SECRET ||
  process.env.PAYSTACK_SECRET ||
  process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    if (!PAYSTACK_WEBHOOK_SECRET) {
      console.warn("No Paystack webhook secret configured; refusing webhook");
      return NextResponse.json(
        { error: "webhook secret not configured" },
        { status: 500 }
      );
    }

    const expected = crypto
      .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
      .update(raw)
      .digest("hex");

    if (signature !== expected) {
      console.warn("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(raw);

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;
      case "charge.failed":
        console.log(
          "Payment failed, cleaning for retry:",
          event.data.reference
        );
        await handleChargeFailed(event.data);
        break;
      default:
        // ignore other events for now
        console.log("Unhandled Paystack event:", event.event);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function handleChargeSuccess(data: any) {
  try {
    const reference: string = data.reference;
    const fees: number | undefined = data.fees ?? data.fee ?? undefined;
    const metadata = data.metadata ?? {};
    const paymentId = metadata.paymentId ?? metadata.payment_id ?? null;

    // Convert fee to ZAR
    let feesInRand: number | undefined = undefined;
    if (fees) {
      const feesInRand = fees / 100;
    }
    if (paymentId) {
      // Update known payment by id
      await convex.mutation(api.payments.updatePaymentStatus, {
        paymentId,
        status: "charged",
        gatewayFee: feesInRand ?? undefined,
        chargedAt: Date.now(),
      });
      console.log(
        `Payment ${paymentId} marked charged (reference ${reference})`
      );
      return;
    }

    // Fallback: find payment by init reference (stored earlier as paystackInitReference)
    try {
      const found = await convex.query(api.payments.getPaymentByReference, {
        paystackReference: reference,
      });

      if (found?._id) {
        await convex.mutation(api.payments.updatePaymentStatus, {
          paymentId: found?._id,
          status: "charged",
          gatewayFee: feesInRand ?? undefined,
          chargedAt: Date.now(),
        });
        console.log(
          `Payment ${found?._id} marked charged via init reference ${reference}`
        );
        return;
      }
    } catch (err) {
      // If generated query name differs, log and continue
      console.warn(
        "Fallback query by init reference failed or not available:",
        err
      );
    }

    console.warn(
      "Charge.success received but no matching payment found for reference:",
      reference
    );
  } catch (error) {
    console.error("Error handling charge success:", error);
  }
}

async function handleChargeFailed(data: any) {
  console.warn("Charge failed!");
}
