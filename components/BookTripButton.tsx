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
  let paymentReference = null;
  let purchaseTripId: string | null = null;
  const [loading, setLoading] = useState(false);
  const createPayment = useMutation(api.payments.createPayment);

  const handleBookTrip = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // 1. Create booking and get the ID back
      if (onBookTrip) {
        purchaseTripId = await onBookTrip();
      }

      if (!purchaseTripId) {
        throw new Error("Failed to create booking");
      }

      // 2. Generate unique reference
      const reference = `trip-${trip.tripId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 3. Create payment record

      // Payable amount is the trip price plus the additional service fee of using platform
      const payableAmount = trip.price * 1.05; // Assuming a 5% service fee
      const comsmissionAmount = trip.price * 0.05; // 5% commission
      const transporterAmount = trip.price * 0.95; // Amount transporter receives

      await createPayment({
        userId: user._id,
        transporterId: trip.transporterId,
        tripId: trip.tripId,
        purchaseTripId: purchaseTripId as Id<"purchaseTrip">,
        totalAmount: payableAmount,
        transporterAmount: transporterAmount, // Amount transporter receives
        commissionAmount: comsmissionAmount, // Commission amount (5% of
        paystackReference: reference,
      });

      // 4. Initialize transaction with Paystack API
      const initResponse = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amount: payableAmount * 100, // Convert to kobo
          reference: reference,
          callback_url: `${window.location.origin}/payment/callback`,
          tripId: trip.tripId,
          transporterId: trip.transporterId,
          purchaseTripId: purchaseTripId,
          userId: user._id,
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

      if (purchaseTripId || paymentReference) {
        try {
          const cleanupResponse = await fetch("/api/booking/cleanup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paystackReference: paymentReference,
              purchaseTripId: purchaseTripId,
              reason: "booking_initialization_failed",
            }),
          });

          const cleanupResult = await cleanupResponse.json();
          console.log("Cleanup result:", cleanupResult);
        } catch (cleanupError) {
          console.error("Cleanup API failed:", cleanupError);
        }
      }
      toast.error(`Booking failed: Please try again`);

      // Redirect user
      window.location.href = "/discover";

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
      {loading ? "Processing..." : `Book Trip`}
    </button>
  );
};

export default BookTripButton;
