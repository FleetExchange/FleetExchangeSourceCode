import { initializePaystackPayment } from "@/utils/paystack";

interface BookTripButtonProps {
  trip: any;
  user: any;
  onBookTrip?: () => Promise<void>;
}

const BookTripButton = ({ trip, user, onBookTrip }: BookTripButtonProps) => {
  const handleBookTrip = async () => {
    try {
      // Run the handler for database changes
      if (onBookTrip) {
        await onBookTrip();
      }

      // 1. Initialize Paystack payment
      const paymentData = await initializePaystackPayment(
        user.email,
        trip.price * 100, // Convert to cents
        trip._id,
        trip.transporterId
      );

      // 2. Redirect to Paystack
      if (paymentData?.data?.authorization_url) {
        window.location.href = paymentData.data.authorization_url;
      } else {
        throw new Error("Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment initialization failed:", error);
      // You might want to show a toast notification here
    }
  };

  return (
    <button onClick={handleBookTrip} className="btn btn-primary btn-wide">
      Book Trip - R{trip.price} {/* Changed $ to R for ZAR */}
    </button>
  );
};

export default BookTripButton;
