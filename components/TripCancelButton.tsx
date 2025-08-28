"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/router";
import React from "react";

interface TripCancelButtonProps {
  purchaseTripId: Id<"purchaseTrip">;
  tripId: Id<"trip">;
  currentStatus: string;
}

// Set trip to cancelled and no payment has been made so no refund is needed
const TripCancelButton = ({
  purchaseTripId,
  tripId,
  currentStatus,
}: TripCancelButtonProps) => {
  const router = useRouter();

  // Mutations
  const cancellPurchaseTrip = useMutation(
    api.purchasetrip.updatePurchaseTripStatus
  );
  const setTripAvailable = useMutation(api.trip.setTripCancelled);
  const cancelNotification = useMutation(api.notifications.createNotification);
  // Queries
  const trip = useQuery(api.trip.getById, { tripId });
  const purchTrip = useQuery(api.purchasetrip.getPurchaseTripByTripId, {
    tripId,
  });
  const payment = useQuery(api.payments.getPaymentByTrip, {
    tripId,
  });

  const handleCancelBooking = async () => {
    try {
      // Cant cancel if: cancelled,refunded,dispatched,delivered,booked
      if (
        currentStatus === "Cancelled" ||
        currentStatus === "Refunded" ||
        currentStatus === "Dispatched" ||
        currentStatus === "Delivered" ||
        currentStatus === "Booked"
      ) {
        return;
      }

      // Update the purchase trip object
      await cancellPurchaseTrip({
        purchaseTripId: purchaseTripId,
        newStatus: "Cancelled",
      });

      // Make trip available again
      await setTripAvailable({
        tripId: tripId,
      });

      // Send Notifications to both Parties
      await cancelNotification({
        type: "booking",
        userId: purchTrip?.userId as Id<"users">,
        message: `Your booking from ${trip?.originCity} to ${trip?.destinationCity} has been cancelled.`,
        meta: { tripId: tripId, action: "cancel_booking" },
      });

      await cancelNotification({
        type: "trip",
        userId: trip?.userId as Id<"users">,
        message: `Your trip from ${trip?.originCity} to ${trip?.destinationCity} has been cancelled. This trip will be available for booking again.`,
        meta: { tripId: tripId, action: "cancel_booking" },
      });

      // success message
      alert("Booking cancelled successfully!");
      // Redirect to myTrips page
      router.back();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  // Only show button if trip is booked and not cancelled or refunded
  if (
    currentStatus == "Cancelled" ||
    currentStatus == "Refunded" ||
    currentStatus === "Dispatched" ||
    currentStatus === "Delivered" ||
    currentStatus === "Booked"
  ) {
    return null;
  }

  return (
    <button
      onClick={handleCancelBooking}
      className="btn btn-error btn-sm flex flex-col items-center gap-1 py-2 h-auto min-h-[3rem]"
    >
      <span className="font-medium">Cancel Trip</span>
    </button>
  );
};

export default TripCancelButton;
