"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { use, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

interface BookTripButtonProps {
  trip: any;
  user: any;
  onBookTrip?: () => Promise<string>;
  disabled?: boolean;
}

const BookTripButton = ({
  trip,
  user,
  onBookTrip,
  disabled = false,
}: BookTripButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [purchaseTripId, setPurchaseTripId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const getPurchaseTripById = useMutation(
    api.purchasetrip.getPurchaseTripForBooking
  );
  const createPayment = useMutation(api.payments.createPayment);
  const deletePayment = useMutation(api.payments.deletePayment);
  const deletePurchaseTrip = useMutation(
    api.purchasetrip.deletePurchaseTripByPurchaseTripId
  );
  const setTripCancelled = useMutation(api.trip.setTripCancelled);
  // create mutation
  const createNotification = useMutation(api.notifications.createNotification);

  const handleBookTrip = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // 1. Create booking and get the ID back
      let newPurchaseTripId: string | null = null;
      let createdPaymentId: string | null = null;
      if (onBookTrip) {
        newPurchaseTripId = await onBookTrip();
      }

      if (!newPurchaseTripId) {
        throw new Error("Failed to create booking");
      }

      // Set the ID to trigger the query
      setPurchaseTripId(newPurchaseTripId);

      // 2. Load the purchase trip data
      const purchaseTripData = await getPurchaseTripById({
        purchaseTripId: newPurchaseTripId as Id<"purchaseTrip">,
      });

      // 3. Use the loaded data to create payment DB object
      const payableAmount = purchaseTripData.clientPayable;
      const comsmissionAmount = purchaseTripData.commissionAmount;
      const transporterAmount = purchaseTripData.transporterAmount;

      const payment = await createPayment({
        userId: user._id,
        transporterId: trip.transporterId,
        tripId: trip.tripId,
        purchaseTripId: newPurchaseTripId as Id<"purchaseTrip">,
        totalAmount: payableAmount,
        transporterAmount: transporterAmount,
        commissionAmount: comsmissionAmount,
      });

      // createPayment returns the payment ID string, so assign it directly
      createdPaymentId = payment as string;

      setPaymentId(createdPaymentId);

      // Let the user know the trip is booked and the transporter will confirm or reject.
      // Tell them they will get an email with payment instructions if transporter confirms
      // Redirect to "my bookings" page

      await createNotification({
        userId: trip.transporterId,
        type: "trip",
        message:
          'You have a new booking request. Please review and confirm or reject the booking in "My Trips".',
        meta: { tripId: trip.tripId, purchaseTripId: newPurchaseTripId },
      });

      const bookingConfirm = window.confirm(
        "Your booking request has been sent. You will receive an email with payment instructions if the transporter confirms your booking. Click OK to go to My Bookings."
      );

      window.location.href = "/myBookings";
    } catch (error) {
      // Rollback: if payment was created but something failed later, delete it
      try {
        if (paymentId) {
          await deletePayment({ paymentId: paymentId as Id<"payments"> });
        }
      } catch (e) {
        console.error("Failed to rollback payment:", e);
      }
      // Rollback: delete the purchaseTrip if it was created
      try {
        if (purchaseTripId) {
          await deletePurchaseTrip({
            purchaseTripId: purchaseTripId as Id<"purchaseTrip">,
          });
        }
      } catch (e) {
        console.error("Failed to rollback purchaseTrip:", e);
      }
      // Set trip to not booked
      try {
        if (trip && trip.tripId) {
          await setTripCancelled({ tripId: trip.tripId as Id<"trip"> });
        }
      } catch (e) {
        console.error("Failed to set trip to not booked:", e);
      }
      console.error("Booking failed:", error);
      alert("Booking failed. Your request was not completed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookTrip}
      disabled={disabled || loading}
      className={`btn btn-primary btn-wide ${
        disabled || loading ? "btn-disabled opacity-50" : ""
      }`}
    >
      {loading ? "Processing..." : `Book Trip`}
    </button>
  );
};

export default BookTripButton;
