// app/api/paystack/verify/[reference]/route.ts
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;

  try {
    if (!reference) {
      return NextResponse.json({ error: "missing reference" }, { status: 400 });
    }

    const PAYSTACK =
      process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK) {
      console.error("PAYSTACK secret not configured");
      return NextResponse.json(
        { error: "server config error" },
        { status: 500 }
      );
    }

    const resp = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await resp.json();

    if (!resp.ok || !data) {
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
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
