// app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";

const PAYSTACK = process.env.PAYSTACK_SECRET!;
if (!PAYSTACK) {
  console.warn("PAYSTACK_SECRET not configured for /api/paystack/initialize");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, email, amountZar, amountKobo, metadata } = body;

    // Accept either a ZAR amount (float) or a smallest-unit amount (cents/kobo)
    let amountInSmallestUnit: number | null = null;
    if (typeof amountZar === "number") {
      amountInSmallestUnit = Math.round(amountZar * 100); // ZAR -> cents
    } else if (typeof amountKobo === "number") {
      amountInSmallestUnit = Math.round(amountKobo); // already in smallest unit
    }

    if (!email || !paymentId || amountInSmallestUnit === null) {
      return NextResponse.json(
        { error: "missing parameters" },
        { status: 400 }
      );
    }

    const reference = `payment_${paymentId}_${Date.now()}`;

    // build callback URL that Paystack will redirect the customer to after payment
    const appBase = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appBase}/payment/callback?paymentId=${encodeURIComponent(paymentId)}&reference=${encodeURIComponent(reference)}`;

    const resp = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInSmallestUnit,
        reference,
        currency: "ZAR", // ensure Paystack treats this as South African Rand
        metadata,
        callback_url: callbackUrl,
      }),
    });

    const data = await resp.json();

    if (!data || !data.status) {
      return NextResponse.json(
        { error: data?.message || "paystack initialize failed", details: data },
        { status: 502 }
      );
    }

    // Return only what Convex needs
    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference,
      raw: data.data,
    });
  } catch (err: any) {
    console.error("Paystack initialize error:", err);
    return NextResponse.json(
      { error: err?.message || "unknown error" },
      { status: 500 }
    );
  }
}
