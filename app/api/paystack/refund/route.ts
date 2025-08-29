// app/api/paystack/refund/route.ts
import { NextRequest, NextResponse } from "next/server";
// @ts-ignore: missing type declarations for 'convex/http'
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Require server secret to prevent public abuse of refund endpoint
    const serverSecret = process.env.REFUND_ENDPOINT_SECRET;
    const provided = req.headers.get("x-server-secret") || "";
    if (!serverSecret || provided !== serverSecret) {
      console.warn("Unauthorized refund attempt");
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { paymentId, reference, amount } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "missing paymentId" }, { status: 400 });
    }

    // Validate payment exists
    const payment = await convex
      .query(api.payments.getPaymentById, { paymentId })
      .catch(() => null);
    if (!payment) {
      return NextResponse.json({ error: "payment not found" }, { status: 404 });
    }

    // Amount should be in smallest unit (cents/kobo) — validate it's not larger than paid amount
    const paidCents =
      typeof payment.totalAmount === "number"
        ? Math.round(payment.totalAmount * 100)
        : typeof payment.totalAmount === "number"
          ? Math.round(payment.totalAmount)
          : null;

    if (
      typeof amount === "number" &&
      paidCents !== null &&
      amount > paidCents
    ) {
      return NextResponse.json(
        { error: "refund amount exceeds paid amount" },
        { status: 400 }
      );
    }

    // Validate reference matches known transaction reference if available
    const knownRef =
      payment.paystackReference || payment.paystackInitReference || null;
    if (reference && knownRef && reference !== knownRef) {
      return NextResponse.json(
        { error: "reference does not match payment record" },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY not set");
      return NextResponse.json(
        { error: "server misconfiguration" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: reference || knownRef,
        amount: typeof amount === "number" ? amount : undefined,
        currency: "ZAR",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // record refund failure
      try {
        await convex.mutation(api.payments.updatePaymentStatus, {
          paymentId,
          status: "refund_failed",
        });
      } catch (e) {
        console.error("Failed to mark refund_failed in DB:", e);
      }
      console.error("Paystack refund failed:", data);
      return NextResponse.json(
        { error: "Refund failed", details: data },
        { status: 502 }
      );
    }

    // Record refund in DB via idempotent server mutation (processRefund)
    try {
      if (api.payments.processRefund) {
        await convex.mutation(api.payments.processRefund, {
          paymentId,
          refundedAmount: amount / 100, // store as ZAR if your mutation expects that
          paystackReference: reference || knownRef,
        });
      } else {
        // Fallback: patch payment record directly (use carefully)
        await convex.mutation(api.payments.updatePaymentStatus, {
          paymentId,
          status: "refunded",
          refundedAmount: typeof amount === "number" ? amount / 100 : undefined,
          refundProcessedAt: Date.now(),
        });
      }
    } catch (e) {
      console.error("Failed to record refund in DB:", e);
      return NextResponse.json({
        ok: true,
        refund: data,
        dbUpdate: false,
        dbError: String(e),
      });
    }

    return NextResponse.json({ ok: true, refund: data });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
