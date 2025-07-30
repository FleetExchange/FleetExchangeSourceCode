"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React from "react";

interface TripRejectButtonProps {
  purchaseTripId: Id<"purchaseTrip">;
  tripId: Id<"trip">;
  currentStatus: string;
}

const TripRejectButton = ({ tripId, currentStatus }: TripRejectButtonProps) => {
  const cancelTrip = useMutation(api.trip.setTripCancelled);
  const deletePurchaseTrip = useMutation(api.purchasetrip.deletePurchaseTrip);
  const rejectionAlert = useMutation(api.notifications.createNotification);

  const trip = useQuery(api.trip.getById, { tripId });
  const purchTrip = useQuery(api.purchasetrip.getPurchaseTripByTripId, {
    tripId,
  });

  const handleRejectBooking = async () => {
    try {
      // Only proceed if status is "Awaiting Confirmation"
      if (currentStatus !== "Awaiting Confirmation") {
        return;
      }

      // Set trip to not booked
      await cancelTrip({ tripId });

      // Delete the purchase trip object
      await deletePurchaseTrip({ tripId });

      // Optionally: Add a success message or redirect
      alert("Booking rejected successfully");

      // Send notification to client
      await rejectionAlert({
        type: "booking",
        userId: purchTrip?.userId as Id<"users">,
        message: `Your booking for trip from ${trip?.originCity} to ${trip?.destinationCity} has been rejected.`,
        meta: { tripId: tripId, action: "reject_booking" },
      });

      // Redirect to myTrips page
      window.location.href = "/myTrips";
    } catch (error) {
      console.error("Failed to reject booking:", error);
      alert("Failed to reject booking. Please try again.");
    }
  };

  // Only show button if status is "Awaiting Confirmation"
  if (currentStatus !== "Awaiting Confirmation") {
    return null;
  }

  return (
    <button
      onClick={handleRejectBooking}
      className="btn btn-error btn-sm flex flex-col items-center gap-1 py-2 h-auto min-h-[3rem]"
    >
      <span className="text-xs opacity-80">Awaiting Confirmation</span>
      <span className="font-medium">Reject Booking</span>
    </button>
  );
};

export default TripRejectButton;
