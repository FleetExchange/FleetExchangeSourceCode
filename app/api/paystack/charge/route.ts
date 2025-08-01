import { NextRequest, NextResponse } from "next/server";

// app/api/paystack/charge/route.ts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://api.paystack.co/transaction/charge_authorization",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorization_code: body.authorization_code,
          email: body.email,
          amount: body.amount,
          currency: "ZAR",
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Charge failed" }, { status: 500 });
  }
}
