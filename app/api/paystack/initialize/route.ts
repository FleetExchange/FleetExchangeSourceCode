// app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";

// Generate simple reference: FC-<timestamp>-<4chars>
function generateReference() {
  const timestamp = Date.now().toString().slice(-8); // last 8 digits
  const random = Math.random().toString(36).slice(2, 6).toUpperCase(); // 4 chars
  return `FE-${timestamp}-${random}`; // e.g., FC-12345678-A3B9
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, email, amountZar, amountKobo, metadata } = body;

    // Convert to cents
    let amountInCents: number | null = null;
    if (typeof amountZar === "number") {
      amountInCents = Math.round(amountZar * 100);
    } else if (typeof amountKobo === "number") {
      amountInCents = Math.round(amountKobo);
    }

    if (!email || !paymentId || amountInCents === null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const reference = generateReference();
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?paymentId=${paymentId}&reference=${reference}`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInCents,
          reference,
          currency: "ZAR",
          metadata: { ...metadata, paymentId },
          callback_url: callbackUrl,
        }),
      }
    );

    const data = await response.json();

    if (!data?.status) {
      return NextResponse.json(
        { error: data?.message || "Payment initialization failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}
