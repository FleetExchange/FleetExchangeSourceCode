"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const paymentId = searchParams.get("paymentId");

  const [status, setStatus] = useState("Verifying payment...");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!reference) {
      setStatus("Missing payment reference.");
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 6;

    const check = async () => {
      try {
        const res = await fetch(
          `/api/paystack/verify/${encodeURIComponent(reference)}`
        );
        const json = await res.json();

        // Accept multiple shapes returned by verify
        const isVerified =
          json?.ok === true ||
          json?.paystackStatus === "success" ||
          json?.data?.status === "success" ||
          json?.status === "success";

        if (isVerified) {
          setSuccess(true);
          setStatus("Payment successful — booking confirmed.");
          setLoading(false);
          return;
        }

        // still pending
        attempts += 1;
        if (attempts >= maxAttempts) {
          setStatus(
            "Payment pending. If you completed payment, wait a moment or contact support."
          );
          setLoading(false);
          return;
        }

        // wait and poll again (webhook may not have arrived yet)
        setStatus("Payment pending — checking again...");
        setTimeout(check, 2000);
      } catch (err) {
        console.error("Verify error", err);
        setAttemptsFailure();
      }
    };

    const setAttemptsFailure = () => {
      setStatus(
        "Error verifying payment. Please contact support if you were charged."
      );
      setLoading(false);
    };

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, paymentId]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-base-100 rounded-lg shadow p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Payment status</h1>

        {loading ? (
          <>
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <p className="text-sm text-muted">{status}</p>
          </>
        ) : success ? (
          <>
            <div className="text-success mb-4">✓</div>
            <p className="text-lg font-medium mb-2">{status}</p>
            <p className="text-sm text-muted mb-6">
              You will receive booking details shortly.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="btn btn-primary"
                onClick={() => router.push("/myBookings")}
              >
                View My Bookings
              </button>
              <button
                className="btn btn-outline"
                onClick={() => router.push("/discover")}
              >
                Find More Trips
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-error mb-4">✕</div>
            <p className="text-lg font-medium mb-2">Payment not confirmed</p>
            <p className="text-sm text-muted mb-6">{status}</p>
            <div className="flex gap-3 justify-center">
              <button
                className="btn btn-primary"
                onClick={() => router.push("/discover")}
              >
                Try Again
              </button>
              <button
                className="btn btn-outline"
                onClick={() => router.push("/")}
              >
                Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
