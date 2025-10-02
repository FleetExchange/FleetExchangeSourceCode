// app/api/paystack/verify/[reference]/route.ts
import { NextResponse } from "next/server";

interface RouteContext {
  params: { reference: string };
}

export async function GET(_req: Request, context: RouteContext) {
  const { reference } = context.params; // no await

  if (!reference) {
    return NextResponse.json({ error: "missing reference" }, { status: 400 });
  }

  try {
    const PAYSTACK =
      process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK) {
      return NextResponse.json(
        { error: "server config error: PAYSTACK secret missing" },
        { status: 500 }
      );
    }

    const resp = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json(
        { error: "verification failed", details: data },
        { status: 502 }
      );
    }

    const paystackStatus = data?.data?.status;
    const verified = data.status === true && paystackStatus === "success";

    return NextResponse.json({
      ok: verified,
      paystackStatus,
      reference: data?.data?.reference,
      amount: data?.data?.amount,
      currency: data?.data?.currency,
      customerEmail: data?.data?.customer?.email,
      raw: data,
    });
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
