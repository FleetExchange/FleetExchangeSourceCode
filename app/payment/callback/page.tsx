// app/payment/success/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const reference = searchParams.get("reference");
    console.log("Payment reference:", reference);

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

      // 🔍 DEBUG: Log everything
      console.log("Verification response:", data);

      // ✅ FIXED: Proper status checking
      if (data.status && data.data?.status === "success") {
        setStatus(
          "Payment successful! You'll be notified when the transporter confirms your trip."
        );

        setTimeout(() => {
          router.push("/discover");
        }, 3000);
      } else {
        console.log("Payment verification failed:", data);
        setStatus(
          `Payment verification failed: ${data.message || "Please contact support"}`
        );

        // Cleanup failed payment
        await cleanupFailedPayment(reference);

        // send user to discover page after cleanup
        setTimeout(() => {
          router.push("/discover");
        }, 3000);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("Error verifying payment. Please contact support.");
    }
  };

  const cleanupFailedPayment = async (reference: string) => {
    try {
      await fetch("/api/booking/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paystackReference: reference,
          reason: "payment_verification_failed",
        }),
      });
    } catch (error) {
      console.error("Failed to cleanup payment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="bg-base-100 rounded-2xl shadow-xl p-8 text-center max-w-md">
        {status.includes("successful") ? (
          <div className="text-success text-6xl mb-4">✓</div>
        ) : (
          <div className="loading loading-spinner loading-lg mb-4"></div>
        )}
        <h1 className="text-2xl font-bold mb-4">
          {status.includes("successful")
            ? "Payment Complete!"
            : "Processing Payment"}
        </h1>
        <p className="text-base-content/70">{status}</p>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
