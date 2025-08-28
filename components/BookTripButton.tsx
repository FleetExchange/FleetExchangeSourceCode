import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { use, useState } from "react";
import toast from "react-hot-toast";
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

  const getPurchaseTripById = useMutation(
    api.purchasetrip.getPurchaseTripForBooking
  );
  const createPayment = useMutation(api.payments.createPayment);
  // create mutation
  const createNotification = useMutation(api.notifications.createNotification);

  const handleBookTrip = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // 1. Create booking and get the ID back
      let newPurchaseTripId: string | null = null;
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

      await createPayment({
        userId: user._id,
        transporterId: trip.transporterId,
        tripId: trip.tripId,
        purchaseTripId: newPurchaseTripId as Id<"purchaseTrip">,
        totalAmount: payableAmount,
        transporterAmount: transporterAmount,
        commissionAmount: comsmissionAmount,
      });

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

      window.location.href = "/myBookings";
    } catch (error) {
      console.error("Booking failed:", error);

      // Cleanup Code
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
