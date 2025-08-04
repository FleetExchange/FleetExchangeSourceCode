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
  const updatePaymentStatus = useMutation(api.payments.updatePaymentStatus);

  const trip = useQuery(api.trip.getById, { tripId });
  const purchTrip = useQuery(api.purchasetrip.getPurchaseTripByTripId, {
    tripId,
  });

  const payment = useQuery(api.payments.getPaymentByTrip, {
    tripId,
  });

  const handleCancelBooking = async () => {
    try {
      // Cant cancel if: cancelled,refunded,dispatched,delivered
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

      // Refund the payment
      if (payment && payment.paystackReference) {
        // 3. Refund the payment
        const refundResponse = await fetch("/api/paystack/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: payment.paystackReference,
          }),
        });

        if (refundResponse.ok) {
          // 4. Update payment status
          await updatePaymentStatus({
            paymentId: payment._id,
            status: "refunded",
          });

          // 5. Notify client
          await cancelNotification({
            userId: payment.userId,
            type: "payment",
            message: "Your payment has been refunded for your cancelled trip.",
            meta: { tripId, action: "payment_refunded" },
          });

          console.log("Trip cancelled and payment refunded successfully");
        }
      }

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
        message: `Your trip from ${trip?.originCity} to ${trip?.destinationCity} has been cancelled. This trip will not be available for booking anymore.`,
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
