import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch("https://api.paystack.co/bank?currency=ZAR", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status) {
      return NextResponse.json(data.data); // Return South African banks
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json(
      { error: "Failed to fetch banks" },
      { status: 500 }
    );
  }
}
