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
  // Mutations
  const cancelTrip = useMutation(api.trip.setTripCancelled);
  const deletePurchaseTrip = useMutation(
    api.purchasetrip.deletePurchaseTripByPurchaseTripId
  );
  const createNotification = useMutation(api.notifications.createNotification);
  const deletePayment = useMutation(api.payments.deletePayment);

  // Queries
  const trip = useQuery(api.trip.getById, { tripId });
  const purchTrip = useQuery(api.purchasetrip.getPurchaseTripByTripId, {
    tripId,
  });
  const payment = useQuery(api.payments.getPaymentByTrip, {
    tripId,
  });

  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleRejectBooking = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Make local copies of related records
      const paymentId = payment?._id ?? null;
      const purchaseId = purchTrip?._id ?? null;
      const purchaserUserId = purchTrip?.userId ?? null;

      // Capture display strings before mutating
      const originCity = trip?.originCity ?? "";
      const destinationCity = trip?.destinationCity ?? "";

      // Only proceed if status is "Awaiting Confirmation"
      if (currentStatus !== "Awaiting Confirmation") {
        setIsProcessing(false);
        return;
      }

      // Confirm action with user
      const confirmCancel = window.confirm(
        "Are you sure you want to reject this booking request?"
      );
      if (!confirmCancel) {
        setIsProcessing(false);
        return;
      }

      // 1. Handle DB changes
      // Delete payment object if it exists
      if (paymentId) await deletePayment({ paymentId });
      // Delete purchTrip object if it exists
      if (purchaseId) await deletePurchaseTrip({ purchaseTripId: purchaseId });
      // Set the trip to available again
      await cancelTrip({ tripId: tripId });

      // Notify client using captured strings
      if (purchaserUserId) {
        await createNotification({
          type: "booking",
          userId: purchaserUserId,
          message: `Your booking from ${originCity} to ${destinationCity} has been rejected by the transporter.`,
          meta: { tripId: tripId, action: "reject_booking" },
        });
      }

      // Optionally: Add a success message or redirect
      alert(
        "Booking rejected successfully, trip will be made available for others."
      );

      // Redirect to myTrips page
      window.location.href = "/myTrips";
    } catch (error) {
      console.error("Failed to reject booking:", error);
      alert("Failed to reject booking. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleRejectBooking}
      disabled={isProcessing}
      className="btn btn-error btn-sm flex flex-col items-center gap-1 py-2 h-auto min-h-[3rem] disabled:opacity-60"
    >
      <span className="text-xs opacity-80">Awaiting Confirmation</span>
      <span className="font-medium">Reject Booking</span>
    </button>
  );
};

export default TripRejectButton;
