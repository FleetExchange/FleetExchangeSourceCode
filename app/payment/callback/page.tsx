"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

const PaymentCallback = () => {
  const { user } = useUser();
  const clerkUser = useQuery(
    api.users.getUserByClerkId,
    user?.id
      ? {
          clerkId: user.id,
        }
      : "skip"
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying payment...");

  const authorizePaymentMutation = useMutation(api.payments.authorizePayment);

  useEffect(() => {
    const reference = searchParams.get("reference");
    const tripId = searchParams.get("tripId"); // You'll need to pass this in the callback URL

    if (reference && tripId && user) {
      verifyPayment(reference, tripId);
    }
  }, [user, searchParams]);

  const verifyPayment = async (reference: string, tripId: string) => {
    try {
      setStatus("Verifying payment...");

      // Call your verification API
      const result = await fetch(`/api/paystack/verify/${reference}`);
      const data = await result.json();

      if (data.status === "success" && data.authorization) {
        setStatus("Payment verified! Setting up your booking...");

        // Save authorized payment to database
        await authorizePaymentMutation({
          userId: clerkUser?._id as Id<"users">, // Use Clerk user ID
          transporterId: data.metadata?.transporterId, // From trip data
          tripId: tripId as Id<"trip">,
          purchaseTripId: data.metadata?.purchaseTripId, // If created earlier
          amount: data.amount / 100, // Convert back from cents
          paystackAuthCode: data.authorization.authorization_code,
          paystackTransactionRef: reference,
        });

        setStatus("Booking confirmed! Redirecting...");

        // Redirect to trip page or dashboard
        setTimeout(() => {
          router.push(`/trip/${tripId}`);
        }, 2000);
      } else {
        setStatus("Payment verification failed. Please try again.");
        setTimeout(() => {
          router.push(`/trip/${tripId}`);
        }, 3000);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("An error occurred. Please contact support.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="bg-base-100 rounded-2xl shadow-xl p-8 text-center max-w-md">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <h1 className="text-2xl font-bold mb-4">Processing Payment</h1>
        <p className="text-base-content/70">{status}</p>
      </div>
    </div>
  );
};

export default PaymentCallback;
