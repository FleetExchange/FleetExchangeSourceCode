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
  const createPayment = useMutation(api.payments.createPayment);

  const handleBookTrip = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // 1. Create booking and get the ID back
      let purchaseTripId;
      if (onBookTrip) {
        purchaseTripId = await onBookTrip();
      }

      if (!purchaseTripId) {
        throw new Error("Failed to create booking");
      }

      // 2. Generate unique reference
      const reference = `trip-${trip.tripId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 3. Create payment record
      await createPayment({
        userId: user._id,
        transporterId: trip.transporterId,
        tripId: trip.tripId,
        purchaseTripId: purchaseTripId as Id<"purchaseTrip">,
        totalAmount: trip.price,
        paystackReference: reference,
      });

      // 4. Initialize transaction with Paystack API
      const initResponse = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amount: trip.price * 100, // Convert to kobo
          reference: reference,
          callback_url: `${window.location.origin}/payment/success`,
          tripId: trip.tripId,
          transporterId: trip.transporterId,
          purchaseTripId: purchaseTripId,
        }),
      });

      const initData = await initResponse.json();

      if (initData.status && initData.data?.authorization_url) {
        // 5. Redirect to Paystack
        window.location.href = initData.data.authorization_url;
      } else {
        throw new Error(initData.message || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Booking failed:", error);
      alert(
        `Failed to initiate booking: ${error instanceof Error ? error.message : "Unknown error"}`
      );
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
      {loading ? "Processing..." : `Book Trip - R${trip.price}`}
    </button>
  );
};

export default BookTripButton;
