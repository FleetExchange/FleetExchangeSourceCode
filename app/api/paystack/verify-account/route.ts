// app/api/paystack/verify-account/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountNumber, bankCode } = body;

    const response = await fetch("https://api.paystack.co/bank/resolve", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_number: accountNumber,
        bank_code: bankCode,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Account verification error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Verification failed",
      },
      { status: 500 }
    );
  }
}
