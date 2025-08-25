// app/payment/success/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  BookOpen,
} from "lucide-react";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying payment...");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const reference = searchParams.get("reference");
    console.log("Payment reference:", reference);

    if (reference) {
      verifyPayment(reference);
    } else {
      setStatus("Invalid payment reference");
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(`/api/paystack/verify/${reference}`);
      const data = await response.json();

      console.log("Verification response:", data);

      if (data.status && data.data?.status === "success") {
        setIsSuccess(true);
        setStatus("Payment successful!");
      } else {
        console.log("Payment verification failed:", data);
        setStatus(
          `Payment verification failed: ${data.message || "Please contact support"}`
        );
        await cleanupFailedPayment(reference);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("Error verifying payment. Please contact support.");
    } finally {
      setIsLoading(false);
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

  const handleViewBookings = () => {
    router.push("/myBookings");
  };

  const handleBackToDiscover = () => {
    router.push("/discover");
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackToDiscover}
              className="btn btn-ghost gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Discover
            </button>

            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-base-content mb-2">
                Payment Status
              </h1>
              <p className="text-base-content/60">
                Your booking payment verification
              </p>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 sm:p-8">
            <div className="text-center">
              {isLoading ? (
                <>
                  <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                  <h2 className="text-xl font-semibold mb-2">
                    Processing Payment
                  </h2>
                  <p className="text-base-content/70">{status}</p>
                </>
              ) : isSuccess ? (
                <>
                  <div className="text-success mb-6">
                    <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                  </div>
                  <h2 className="text-2xl font-bold text-success mb-4">
                    Booking Confirmed!
                  </h2>
                  <div className="space-y-3 mb-8">
                    <p className="text-base-content/80 text-lg">
                      Your payment was successful and your trip has been booked.
                    </p>
                    <p className="text-base-content/60">
                      The transporter will be notified and you'll receive
                      confirmation details shortly.
                    </p>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-success mb-3 flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      What happens next?
                    </h4>
                    <ul className="text-sm text-base-content/70 space-y-2 text-left">
                      <li>
                        • The transporter will be notified of your booking
                      </li>
                      <li>• You'll receive confirmation via email or SMS</li>
                      <li>• Track your shipment progress in real-time</li>
                      <li>• Contact the transporter directly if needed</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleViewBookings}
                      className="btn btn-primary flex-1 gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      View My Bookings
                    </button>
                    <button
                      onClick={handleBackToDiscover}
                      className="btn btn-outline flex-1"
                    >
                      Find More Trips
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-error mb-6">
                    <XCircle className="w-20 h-20 mx-auto mb-4" />
                  </div>
                  <h2 className="text-2xl font-bold text-error mb-4">
                    Payment Failed
                  </h2>
                  <p className="text-base-content/70 mb-8">{status}</p>

                  {/* Failed Payment Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleBackToDiscover}
                      className="btn btn-primary flex-1"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => router.push("/discover")}
                      className="btn btn-outline flex-1"
                    >
                      Return
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-6 bg-base-100 rounded-xl border border-base-300 p-4 text-center">
            <p className="text-sm text-base-content/60 mb-2">
              Need help with your booking?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a
                href="mailto:support@fleetexchange.co.za"
                className="link link-primary"
              >
                support@fleetexchange.co.za
              </a>
              <a href="tel:+27837840895" className="link link-primary">
                +27 (0) 83 784 0895
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
