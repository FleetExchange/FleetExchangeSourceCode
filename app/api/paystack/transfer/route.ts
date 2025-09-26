// app/api/paystack/transfer/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, recipientCode, reason, reference, metadata } = body;

    console.log("Creating transfer:", {
      amount,
      recipientCode,
      reason,
      reference,
    });

    const response = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance", // Transfer from your Paystack balance
        amount: amount * 100, // Convert to ZAR to cents
        recipient: recipientCode,
        reason: reason,
        reference: reference,
        currency: "ZAR", // Or whatever currency you're using
        metadata: metadata,
      }),
    });

    const data = await response.json();

    console.log("Paystack transfer response:", data);

    // Notify Transporter

    return NextResponse.json(data);
  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Transfer failed",
      },
      { status: 500 }
    );
  }
}
