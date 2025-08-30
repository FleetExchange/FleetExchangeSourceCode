// Trip Cancellation Button Component
// Available for Transporter of a trip and Client booking the trip
// Use cases:
// 1. Trip is awaiting confirmation and client cancels trip
// 2. Trip is booked but no payment has been made and transporter or client cancels trip
// 3. Trip is booked but AND payment has been made and transporter or client cancels trip
// 3.1 If client cancels they do not get thier service fee back
// 3.2 If transporter cancels, client will recieve thier serivice fee back

"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React from "react";

interface TripCancelButtonProps {
  tripId: Id<"trip">;
  currentStatus: string;
  userId: Id<"users">; // To see if its the transporter or client cancelling
}

const TripCancelButton = ({
  tripId,
  currentStatus,
  userId,
}: TripCancelButtonProps) => {
  // Add processing state to prevent duplicates
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Mutations
  const deletePurchTrip = useMutation(
    api.purchasetrip.deletePurchaseTripByPurchaseTripId
  );
  const setTripCancelled = useMutation(api.trip.setTripCancelled);
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
  const user = useQuery(api.users.getUserById, { userId });

  // true if the current user is the transporter (owner) of the trip, false otherwise
  const isTransporter: boolean = user?._id === trip?.userId;

  const handleCancelBooking = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // capture related ids/values up-front to avoid race conditions if we delete records later
      const paymentId = payment?._id ?? null;
      const purchaseId = purchTrip?._id ?? null;
      const purchaserUserId = purchTrip?.userId ?? null;
      const transporterUserId = trip?.userId ?? null;

      // Capture display strings before mutating
      const originCity = trip?.originCity ?? "";
      const destinationCity = trip?.destinationCity ?? "";

      // Show Button if trip us not cancelled,refunded,dispatched,delivered
      // Only show awaiting confirmation and booked status
      if (
        currentStatus == "Cancelled" ||
        currentStatus == "Refunded" ||
        currentStatus === "Dispatched" ||
        currentStatus === "Delivered"
      ) {
        return;
      }

      // Ask if the user is sure they want to cancel, explain the terms
      if (isTransporter) {
        const confirmCancel = window.confirm(
          "Are you sure you want to cancel this booking?"
        );
        if (!confirmCancel) {
          return;
        }
      } else {
        const confirmCancel = window.confirm(
          "Are you sure you want to cancel this booking? If you are the client and payment has been made, you will not receive your service fee back."
        );
        if (!confirmCancel) {
          return;
        }
      }

      // 1. Trip is awaiting confirmation and client cancels trip
      if (currentStatus === "Awaiting Confirmation") {
        // Delete payment object if it exists
        if (paymentId) await deletePayment({ paymentId });
        // Delete purchTrip object if it exists
        if (purchaseId) await deletePurchTrip({ purchaseTripId: purchaseId });
        // Set the trip to available again
        await setTripCancelled({ tripId: tripId });
        // Notify both parties
        await notifyClient(purchaserUserId, originCity, destinationCity);
        await notifyTransporter(transporterUserId, originCity, destinationCity);
      }
      // 2. Trip is booked but no payment has been made and transporter or client cancels trip
      if (
        currentStatus === "Booked" &&
        (payment?.status === "pending" ||
          payment?.status === "payment_requested")
      ) {
        // Delete payment object if it exists
        if (paymentId) await deletePayment({ paymentId });
        // Delete purchTrip object if it exists
        if (purchaseId) await deletePurchTrip({ purchaseTripId: purchaseId });
        // Set the trip to available again
        await setTripCancelled({ tripId: tripId });
        // Notify both parties
        await notifyClient(purchaserUserId, originCity, destinationCity);
        await notifyTransporter(transporterUserId, originCity, destinationCity);
      }
      // 3. Trip is booked but AND payment has been made and transporter or client cancels trip
      if (currentStatus === "Booked" && payment?.status === "charged") {
        // 3.1 If transporter cancels, client will recieve thier serivice fee back
        // 3.2 If client cancels they do not get thier service fee back

        if (payment && purchTrip && trip && user) {
          // Determine refund amount
          let refundAmount = 0;
          if (isTransporter) {
            // Full amount to client
            refundAmount = payment.totalAmount; // in ZAR
          } else {
            // Price before service fee was added
            refundAmount = purchTrip?.tripTotal; // in ZAR
          }

          // Refund client with api call to paystack refund endpoint
          const response = await fetch("/api/paystack/refund-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: payment.paystackInitReference,
              amount: Math.round(refundAmount * 100), // ZAR to cents
              paymentId: payment._id,
            }),
          });

          const respJson = await response.json().catch(() => null);
          if (response.ok && respJson?.ok) {
            // Notify both parties
            await notifyClient(purchaserUserId, originCity, destinationCity);
            await notifyTransporterNoRelist(
              transporterUserId,
              originCity,
              destinationCity
            );
          } else {
            console.error("Refund API failed", respJson);
            alert(
              "Refund failed. Booking not cancelled. Please try again or contact support."
            );
            return;
          }
        }
      }

      // success message
      alert("Booking cancelled successfully!");
      // Redirect back to previous page
      if (typeof window !== "undefined") {
        window.history.back();
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Notify both parties of the cancellation
  const notifyClient = async (
    userId: Id<"users"> | null,
    origin: string,
    dest: string
  ) => {
    try {
      if (!userId) return;
      await createNotification({
        type: "booking",
        userId: userId,
        message: `Your booking from ${origin} to ${dest} has been cancelled. If you made a payment a refund will be processed shortly.`,
        meta: { tripId: tripId, action: "cancel_booking" },
      });
    } catch (error) {
      console.error("Failed to send cancellation notifications:", error);
    }
  };
  const notifyTransporter = async (
    userId: Id<"users"> | null,
    origin: string,
    dest: string
  ) => {
    try {
      if (!userId) return;
      await createNotification({
        type: "trip",
        userId: userId,
        message: `Your trip from ${origin} to ${dest} has been cancelled. You trip will be made available for booking again.`,
        meta: { tripId: tripId, action: "cancel_booking" },
      });
    } catch (error) {
      console.error("Failed to send cancellation notifications:", error);
    }
  };
  const notifyTransporterNoRelist = async (
    userId: Id<"users"> | null,
    origin: string,
    dest: string
  ) => {
    try {
      if (!userId) return;
      await createNotification({
        type: "trip",
        userId: userId,
        message: `Your trip from ${origin} to ${dest} has been cancelled. You trip will NOT be available for booking, please reslist it if you wish to.`,
        meta: { tripId: tripId, action: "cancel_booking" },
      });
    } catch (error) {
      console.error("Failed to send cancellation notifications:", error);
    }
  };

  return (
    <button
      onClick={handleCancelBooking}
      disabled={isProcessing}
      className="btn btn-error btn-sm flex flex-col items-center gap-1 py-2 h-auto min-h-[3rem] disabled:opacity-60"
    >
      <span className="font-medium">
        {isProcessing ? "Processing..." : "Cancel Trip"}
      </span>
    </button>
  );
};

export default TripCancelButton;
