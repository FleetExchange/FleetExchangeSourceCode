import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status) {
      // Return only South African banks or filter as needed
      const southAfricanBanks = data.data.filter(
        (bank: any) =>
          bank.country === "South Africa" || bank.currency === "ZAR"
      );
      return NextResponse.json(southAfricanBanks);
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
