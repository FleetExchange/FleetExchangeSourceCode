// app/api/paystack/create-recipient/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, accountNumber, bankCode, email } = body;

    const response = await fetch(
      "https://api.paystack.co/za/transferrecipient",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "basa",
          name: name,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "ZAR",
          email: email,
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Recipient creation error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Failed to create recipient",
      },
      { status: 500 }
    );
  }
}
