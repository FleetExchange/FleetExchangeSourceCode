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

      // 3. Generate unique reference
      const reference = `trip-${trip.tripId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 4. Use the loaded data
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
        paystackReference: reference,
      });

      // 5. Initialize transaction with Paystack API
      const initResponse = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amount: Math.round(payableAmount * 100),
          reference: reference,
          callback_url: `${window.location.origin}/payment/callback`,
          tripId: trip.tripId,
          transporterId: trip.transporterId,
          purchaseTripId: newPurchaseTripId,
          userId: user._id,
        }),
      });

      const initData = await initResponse.json();

      if (initData.status && initData.data?.authorization_url) {
        // 6. Redirect to Paystack
        window.location.href = initData.data.authorization_url;
      } else {
        throw new Error(initData.message || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Booking failed:", error);

      if (purchaseTripId) {
        try {
          const cleanupResponse = await fetch("/api/booking/cleanup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paystackReference: null,
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
