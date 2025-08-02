// app/api/paystack/verify-account/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountNumber, bankCode } = body;

    // Build URL with query parameters
    const url = new URL("https://api.paystack.co/bank/resolve");
    url.searchParams.append("account_number", accountNumber);
    url.searchParams.append("bank_code", bankCode);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
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
