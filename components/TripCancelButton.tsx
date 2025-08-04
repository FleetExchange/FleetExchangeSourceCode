"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React from "react";

interface TripCancelButtonProps {
  purchaseTripId: Id<"purchaseTrip">;
  tripId: Id<"trip">;
  currentStatus: string;
}

// If the trip is cancelled and refunded, Keep the trip as booked and set the purchaseTrip status to Cancelled - upon refunded it will be set to refuneded
const TripCancelButton = ({
  purchaseTripId,
  tripId,
  currentStatus,
}: TripCancelButtonProps) => {
  const cancellPurchaseTrip = useMutation(
    api.purchasetrip.updatePurchaseTripStatus
  );
  const cancelNotification = useMutation(api.notifications.createNotification);

  const trip = useQuery(api.trip.getById, { tripId });
  const purchTrip = useQuery(api.purchasetrip.getPurchaseTripByTripId, {
    tripId,
  });

  const handleCancelBooking = async () => {
    try {
      // Cant cancel if already cancelled or refunded
      if (currentStatus === "Cancelled" || currentStatus === "Refunded") {
        return;
      }

      // Delete the purchase trip object
      await cancellPurchaseTrip({
        purchaseTripId: purchaseTripId,
        newStatus: "Cancelled",
      });

      // success message
      alert(
        "Booking cancelled successfully - Refund will be processed shortly."
      );

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
        message: `Your trip from ${trip?.originCity} to ${trip?.destinationCity} has been cancelled.`,
        meta: { tripId: tripId, action: "cancel_booking" },
      });

      // Redirect to myTrips page
      window.location.href = "/myTrips";
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  // Only show button if trip is booked and not cancelled or refunded
  if (currentStatus == "Cancelled" || currentStatus == "Refunded") {
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
