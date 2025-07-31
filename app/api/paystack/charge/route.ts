import { NextRequest, NextResponse } from "next/server";

// app/api/paystack/charge/route.ts
export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch(
    "https://api.paystack.co/transaction/charge_authorization",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
