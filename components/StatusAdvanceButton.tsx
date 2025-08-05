"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { release } from "os";
import React from "react";
import { useState } from "react";

export type TripStatus =
  | "Awaiting Confirmation"
  | "Booked"
  | "Dispatched"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

interface StatusAdvanceButtonProps {
  currentStatus: TripStatus;
  purchaseTripId: Id<"purchaseTrip">;
}

const StatusAdvanceButton = ({
  currentStatus,
  purchaseTripId,
}: StatusAdvanceButtonProps) => {
  const [status, setStatus] = useState<TripStatus>(currentStatus);
  const updateStatus = useMutation(api.purchasetrip.updatePurchaseTripStatus);

  // Add query to keep status in sync
  const purchaseTrip = useQuery(api.purchasetrip.getPurchaseTrip, {
    purchaseTripId,
  });

  // Get the user
  const client = useQuery(
    api.users.getUserById,
    purchaseTrip?.userId
      ? {
          userId: purchaseTrip?.userId as Id<"users">,
        }
      : "skip"
  );

  // get trip oject
  const trip = useQuery(
    api.trip.getById,
    purchaseTrip?.tripId
      ? {
          tripId: purchaseTrip?.tripId as Id<"trip">,
        }
      : "skip"
  );

  // create mutation
  const createNotification = useMutation(api.notifications.createNotification);
  const getPaymentByTrip = useQuery(
    api.payments.getPaymentByTrip,
    trip?._id ? { tripId: trip._id } : "skip"
  );
  const chargePayment = useMutation(api.payments.chargePayment);

  // Add these new queries/mutations
  const getPayoutAccount = useQuery(
    api.payoutAccount.getByUser,
    trip?.userId ? { userId: trip.userId } : "skip"
  );

  const updatePaymentStatus = useMutation(api.payments.updatePaymentStatus);

  // Update local state when database changes
  React.useEffect(() => {
    if (purchaseTrip?.status) {
      setStatus(purchaseTrip.status as TripStatus);
    }
  }, [purchaseTrip?.status]);

  const getNextStatus = (current: TripStatus): TripStatus => {
    switch (current) {
      case "Awaiting Confirmation":
        return "Booked";
      case "Booked":
        return "Dispatched";
      case "Dispatched":
        return "Delivered";
      case "Delivered":
      default:
        return current;
    }
  };

  const handleAdvanceStatus = async () => {
    try {
      const nextStatus = getNextStatus(status);

      // 1. Update status in database
      await updateStatus({
        purchaseTripId,
        newStatus: nextStatus,
      });

      // 2. Handle payment charging for "Booked" status
      if (nextStatus === "Booked") {
        try {
          // 2. Get payment (Database Query)
          const payment = getPaymentByTrip;

          if (payment && payment.status === "authorized") {
            // 3. Charge the payment in DB
            const chargeData = await chargePayment({ paymentId: payment._id });
          }
        } catch (error) {
          console.error("Failed to confirm trip:", error);
        }
      }

      // 3. Handle payment release for "Delivered" status
      if (nextStatus === "Delivered") {
        await releasePaymentToTransporter();
        await createNotification({
          userId: purchaseTrip?.userId as Id<"users">,
          type: "booking",
          message: `Please rate your experience for your booking from ${trip?.originCity} to ${trip?.destinationCity}.`,
          meta: {
            tripId: trip?._id as Id<"trip">,
            action: "rating_request",
          },
        });
      }

      setStatus(nextStatus); // Update local state immediately

      // Get date and format it
      const tripdepartureDate = new Date(trip?.departureDate || 0);
      const formattedDate = tripdepartureDate
        ? tripdepartureDate.toLocaleDateString("en-ZA", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "TBD";

      // Send the notification of status change
      await createNotification({
        userId: purchaseTrip?.userId as Id<"users">,
        type: "booking",
        message: `Booking Status Update: ${formattedDate} ${trip?.originCity} - ${trip?.destinationCity}: ${nextStatus}.`,
        meta: {
          tripId: trip?._id as Id<"trip">,
          action: "status_update",
        },
      });
    } catch (error) {
      console.error("Failed to advance status:", error);
    }
  };

  const releasePaymentToTransporter = async () => {
    try {
      console.log("Starting payment release process...");

      // 1. Get payment details
      const payment = getPaymentByTrip;
      if (!payment) {
        throw new Error("Payment not found");
      }

      // 2. Get transporter's payout account
      const payoutAccount = getPayoutAccount;
      if (!payoutAccount?.paystackRecipientCode) {
        throw new Error(
          "Transporter bank details not found. Please ask transporter to add bank details."
        );
      }

      // 4. Create transfer via API
      const transferResponse = await fetch("/api/paystack/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payment.transporterAmount * 100, // Convert to kobo
          recipientCode: payoutAccount.paystackRecipientCode,
          reason: `Payment for trip from ${trip?.originCity} to ${trip?.destinationCity}`,
          reference: `transfer-${payment._id}-${Date.now()}`,
          metadata: {
            tripId: trip?._id,
            purchaseTripId: purchaseTripId,
            paymentId: payment._id,
          },
        }),
      });

      const transferData = await transferResponse.json();

      if (transferData.status) {
        // 5. Update payment status in database
        await updatePaymentStatus({
          paymentId: payment._id,
          status: "released",
          transferReference: transferData.data.reference,
        });

        // 6. Notify transporter
        await createNotification({
          userId: trip?.userId as Id<"users">,
          type: "payment",
          message: `Payment of R${payment.transporterAmount} has been released to your bank account for the completed trip.`,
          meta: {
            tripId: trip?._id as Id<"trip">,
            action: "payment_released",
            amount: payment.transporterAmount,
          },
        });

        console.log("Payment released successfully!");
      } else {
        throw new Error(transferData.message || "Transfer failed");
      }
    } catch (error) {
      console.error("Payment release failed:", error);

      // Notify about the error
      await createNotification({
        userId: trip?.userId as Id<"users">,
        type: "payment",
        message: `Payment release failed: ${error instanceof Error ? error.message : "Unknown error"}. Please contact support.`,
        meta: {
          tripId: trip?._id as Id<"trip">,
          action: "payment_release_failed",
        },
      });
    }
  };

  // Don't show button if status is already Delivered
  if (status === "Delivered") {
    return null;
  }

  if (status === "Cancelled") {
    return (
      <div className="py-2 px-4 rounded bg-red-100 text-red-700 text-center font-semibold">
        This trip has been <span className="font-bold">Cancelled</span>.
      </div>
    );
  }
  if (status === "Refunded") {
    return (
      <div className="py-2 px-4 rounded bg-yellow-100 text-yellow-700 text-center font-semibold">
        This trip has been <span className="font-bold">Refunded</span>.
      </div>
    );
  }
  return (
    <button
      onClick={handleAdvanceStatus}
      className="btn btn-primary btn-sm flex flex-col items-center gap-1 py-2 h-auto min-h-[3rem]"
    >
      <span className="text-xs opacity-80">Current Status: {status}</span>
      <span className="font-medium">Advance to {getNextStatus(status)}</span>
    </button>
  );
};

export default StatusAdvanceButton;
