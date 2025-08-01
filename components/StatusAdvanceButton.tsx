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
  const client = useQuery(api.users.getUserById, {
    userId: purchaseTrip?.userId as Id<"users">,
  });

  // get trip oject
  const trip = useQuery(api.trip.getById, {
    tripId: purchaseTrip?.tripId as Id<"trip">,
  });

  // create mutation
  const createNotification = useMutation(api.notifications.createNotification);
  const getPaymentByTrip = useQuery(
    api.payments.getPaymentByTrip,
    trip?._id ? { tripId: trip._id } : "skip"
  );
  const chargePayment = useMutation(api.payments.chargePayment);

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

      // If the trip goes from awaiting confirmation to booked, run the authorised payment
      if (nextStatus == "Booked") {
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

      // If the status is Delivered, create rating notification
      if (nextStatus === "Delivered") {
        await createNotification({
          userId: purchaseTrip?.userId as Id<"users">,
          type: "booking",
          message: `Your trip from ${trip?.originCity} to ${trip?.destinationCity} has been delivered. Please rate your experience.`,
          meta: {
            tripId: trip?._id as Id<"trip">,
            action: "rating_request",
          },
        });
        //await releasePayementToTransporter();
      }
    } catch (error) {
      console.error("Failed to advance status:", error);
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
