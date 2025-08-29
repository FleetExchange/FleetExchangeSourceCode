import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const secret = process.env.REFUND_ENDPOINT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "server misconfiguration" },
      { status: 500 }
    );
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/paystack/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-server-secret": secret,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? { error: "no response" }, {
    status: res.ok ? 200 : 502,
  });
}
