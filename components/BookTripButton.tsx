import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

interface BookTripButtonProps {
  trip: any;
  user: any;
  purchTrip: any;
  onBookTrip?: () => Promise<void>;
  disabled?: boolean;
}

const BookTripButton = ({
  trip,
  user,
  purchTrip,
  onBookTrip,
  disabled = false,
}: BookTripButtonProps) => {
  const [loading, setLoading] = useState(false);
  const createPayment = useMutation(api.payments.createPayment);

  const handleBookTrip = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // 1. Create booking in database & check inforamtion validity
      if (onBookTrip) {
        await onBookTrip();
      }

      // 2. Generate unique reference
      const reference = `trip-${trip._id}-${Date.now()}`;

      // 3. Create payment record
      await createPayment({
        userId: user._id,
        transporterId: trip.transporterId,
        tripId: trip._id,
        purchaseTripId: purchTrip._id,
        totalAmount: trip.price,
        paystackReference: reference,
      });

      // 4. Redirect to Paystack
      const paystackUrl = `https://checkout.paystack.com/v2/checkout?key=${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}&email=${user.email}&amount=${trip.price * 100}&currency=ZAR&ref=${reference}&callback_url=${window.location.origin}/payment/success`;

      window.location.href = paystackUrl;
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Failed to initiate booking. Please try again.");
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
