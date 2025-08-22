import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import React from "react";
import { Star, MessageSquare, User, Award } from "lucide-react";

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
          <Star
            key={star}
            className={`w-5 h-5 transition-all duration-200 ${
              star <= (hoverRating || currentRating || 0)
                ? "text-warning fill-warning"
                : "text-base-content/30"
            } ${
              readOnly
                ? "cursor-default"
                : "cursor-pointer hover:text-warning hover:scale-110"
            }`}
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
    return (
      <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="loading loading-spinner loading-sm"></div>
          <span className="text-base-content/70">Loading rating...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
      {hasRating ? (
        // Display existing rating
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg border border-success/20">
              <Award className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-base-content">
                {readOnly ? "Customer Rating" : "Your Rating"}
              </h3>
              <p className="text-sm text-base-content/60">
                Trip experience feedback
              </p>
            </div>
          </div>

          {/* Rating Display */}
          <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <StarRating
                  currentRating={purchaseTrip.tripRating ?? null}
                  readOnly={true}
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-base-content">
                    {purchaseTrip.tripRating}
                  </span>
                  <span className="text-sm text-base-content/60">/5</span>
                </div>
              </div>

              {/* Rating Badge */}
              <div
                className={`badge gap-1 ${
                  (purchaseTrip.tripRating ?? 0) >= 4
                    ? "badge-success"
                    : (purchaseTrip.tripRating ?? 0) >= 3
                      ? "badge-warning"
                      : "badge-error"
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                {(purchaseTrip.tripRating ?? 0) >= 4
                  ? "Excellent"
                  : (purchaseTrip.tripRating ?? 0) >= 3
                    ? "Good"
                    : "Needs Improvement"}
              </div>
            </div>

            {purchaseTrip.tripRatingComment && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-base-content">
                    {readOnly ? "Customer Review:" : "Your Review:"}
                  </span>
                </div>
                <div className="bg-base-100 border border-base-300 rounded-lg p-3">
                  <p className="text-sm text-base-content leading-relaxed">
                    "{purchaseTrip.tripRatingComment}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : // Show different messages based on readOnly prop
      readOnly ? (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-base-200 rounded-full">
              <User className="w-8 h-8 text-base-content/40" />
            </div>
            <div>
              <p className="text-base-content/60 font-medium">
                No customer rating yet
              </p>
              <p className="text-base-content/40 text-sm">
                Rating will appear after trip completion
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Show rating input form for customers
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base-content">
                Rate Your Trip
              </h3>
              <p className="text-sm text-base-content/60">
                Share your experience with this trip
              </p>
            </div>
          </div>

          {/* Rating Input */}
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="label">
                <span className="label-text font-medium">Rating</span>
                <span className="label-text-alt text-error">Required</span>
              </label>
              <div className="flex items-center gap-4 p-4 bg-base-200/50 border border-base-300 rounded-xl">
                <StarRating currentRating={rating} onRatingChange={setRating} />
                {rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-base-content">
                      {rating}
                    </span>
                    <span className="text-sm text-base-content/60">/5</span>
                    <div
                      className={`badge badge-sm ${
                        rating >= 4
                          ? "badge-success"
                          : rating >= 3
                            ? "badge-warning"
                            : "badge-error"
                      }`}
                    >
                      {rating >= 4
                        ? "Excellent"
                        : rating >= 3
                          ? "Good"
                          : "Poor"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Comment (Optional)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24 resize-none focus:outline-none focus:border-primary"
                placeholder="Share your experience with this trip..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
              <div className="label">
                <span className="label-text-alt"></span>
                <span className="label-text-alt text-base-content/50">
                  {comment.length}/500 characters
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="btn btn-primary w-full gap-2"
            onClick={handleSubmitRating}
            disabled={!rating || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="loading loading-spinner loading-sm"></div>
                Submitting Rating...
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                Submit Rating
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TripRatingComponent;
