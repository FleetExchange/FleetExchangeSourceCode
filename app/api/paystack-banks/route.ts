import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      { error: "Missing Paystack secret key" },
      { status: 500 }
    );
  }
  try {
    const response = await axios.get("https://api.paystack.co/bank", {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    return NextResponse.json(response.data.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
