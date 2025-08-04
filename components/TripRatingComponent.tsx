import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import React from "react";
import { FaStar } from "react-icons/fa";

const TripRatingComponent = ({
  purchaseTripId,
  readOnly = false,
}: {
  purchaseTripId: Id<"purchaseTrip">;
  readOnly?: boolean;
}) => {
  // consts for rating and comment
  const [rating, setRating] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState<string>("");
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // fetch the purchase trip object
  const purchaseTrip = useQuery(api.purchasetrip.getPurchaseTrip, {
    purchaseTripId,
  });

  // get trip object
  const trip = useQuery(
    api.trip.getById,
    purchaseTrip?.tripId
      ? { tripId: purchaseTrip.tripId as Id<"trip"> }
      : "skip"
  );

  // Mutation to submit rating
  const submitRating = useMutation(api.purchasetrip.addTripRating);
  const updateUserRating = useMutation(api.users.updateUserRating);

  //Check if rating exists using the actual field structure
  const hasRating =
    purchaseTrip &&
    purchaseTrip.tripRating !== undefined &&
    purchaseTrip.tripRating !== null;

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (!rating || !purchaseTrip?.userId) return;

    setIsSubmitting(true);
    try {
      await submitRating({
        purchaseTripId,
        rating,
        comment: comment.trim(),
      });
      await updateUserRating({
        userId: trip?.userId as Id<"users">,
        rating,
      });
      // Reset form after successful submission
      setRating(null);
      setComment("");
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Star rating component
  const StarRating = ({
    currentRating,
    onRatingChange,
    readOnly = false,
  }: {
    currentRating: number | null;
    onRatingChange?: (rating: number) => void;
    readOnly?: boolean;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-6 h-6 transition-colors ${
              star <= (hoverRating || currentRating || 0)
                ? "text-yellow-400"
                : "text-gray-300"
            } ${readOnly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"}`}
            onClick={() => !readOnly && onRatingChange?.(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(null)}
          />
        ))}
      </div>
    );
  };

  // Loading state
  if (!purchaseTrip) {
    return <div className="p-4">Loading rating...</div>;
  }

  return (
    <div className="bg-base-100 rounded-lg p-4 border border-base-300">
      {hasRating ? (
        // Display existing rating
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            {readOnly ? "Customer Rating" : "Your Rating"}
          </h3>
          <div className="flex items-center gap-3">
            <StarRating
              currentRating={purchaseTrip.tripRating ?? null}
              readOnly={true}
            />
            <span className="text-sm text-base-content/70">
              {purchaseTrip.tripRating}/5
            </span>
          </div>
          {purchaseTrip.tripRatingComment && (
            <div className="mt-3">
              <p className="text-sm font-medium text-base-content/80">
                {readOnly ? "Customer Review:" : "Your Review:"}
              </p>
              <p className="text-sm text-base-content/70 mt-1 p-3 bg-base-200 rounded-lg">
                {purchaseTrip.tripRatingComment}
              </p>
            </div>
          )}
        </div>
      ) : // Show different messages based on readOnly prop
      readOnly ? (
        <div className="text-center py-4">
          <p className="text-base-content/60">No customer rating yet</p>
        </div>
      ) : (
        // Show rating input form for customers
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Rate Your Trip</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex items-center gap-3">
              <StarRating currentRating={rating} onRatingChange={setRating} />
              {rating && (
                <span className="text-sm text-base-content/70">{rating}/5</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comment (Optional)</label>
            <textarea
              className="textarea textarea-bordered w-full h-20 resize-none"
              placeholder="Share your experience with this trip..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
            <div className="text-xs text-base-content/50 text-right">
              {comment.length}/500
            </div>
          </div>

          <button
            className="btn btn-primary w-full"
            onClick={handleSubmitRating}
            disabled={!rating || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TripRatingComponent;
