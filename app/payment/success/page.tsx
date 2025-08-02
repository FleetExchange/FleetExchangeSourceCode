// app/payment/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (reference) {
      verifyPayment(reference);
    } else {
      setStatus("Invalid payment reference");
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(`/api/paystack/verify/${reference}`);
      const data = await response.json();

      if (data.status === "success" && data.data?.status === "success") {
        setStatus(
          "Payment successful! You'll be notified when the transporter confirms your trip."
        );
        setTimeout(() => {
          router.push("/discover");
        }, 3000);
      } else {
        setStatus("Payment verification failed. Please contact support.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("Error verifying payment. Please contact support.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="bg-base-100 rounded-2xl shadow-xl p-8 text-center max-w-md">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <h1 className="text-2xl font-bold mb-4">Payment Processing</h1>
        <p className="text-base-content/70">{status}</p>
      </div>
    </div>
  );
}
