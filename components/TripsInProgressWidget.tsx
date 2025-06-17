"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, User, ChevronRight, Truck } from "lucide-react";

const TripsInProgressWidget = () => {
  const { user } = useUser();
  const router = useRouter();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get all the trips that belongs to the user and that are booked
  const userTrips = useQuery(api.trip.getTripsByIssuerId, {
    issuerId: convexUser?._id ?? "skip",
  });

  //Only process booked trips if we have userTrips
  const bookedTrips = userTrips?.filter((trip) => trip.isBooked === true) ?? [];

  // Get all tripIds from the booked Trips
  const bookedTripIds = bookedTrips.map((booking) => booking._id as Id<"trip">);

  // Get all the purchaseTrips that have the bookedTripIds
  const purchasedTrips = useQuery(api.purchasetrip.getPurchaseTripByIdArray, {
    tripIds: bookedTripIds.length > 0 ? bookedTripIds : [],
  });

  // Filter for trips that are in progress (booked or dispatched)
  const tripsInProgress =
    purchasedTrips?.filter(
      (trip) => trip.status === "Booked" || trip.status === "Dispatched"
    ) ?? [];

  // Get all unique booker IDs from trips in progress
  const bookerIds = [...new Set(tripsInProgress.map((trip) => trip.userId))];

  // Get all booker user details
  const bookers = useQuery(api.users.getUsersByIds, {
    userIds: bookerIds.length > 0 ? bookerIds : [],
  });

  const handleTripClick = (tripId: string) => {
    router.push(`/tripOwner?tripId=${tripId}`);
  };

  const formatDate = (date: string | number) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to get booker name
  const getBookerName = (bookerId: string) => {
    const booker = bookers?.find((b) => b._id === bookerId);
    return booker?.name || "Unknown User";
  };

  // Helper function to get trip details
  const getTripDetails = (purchasedTrip: any) => {
    const trip = bookedTrips.find((t) => t._id === purchasedTrip.tripId);
    return trip;
  };

  // Helper function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
        return { className: "badge-info", text: "Booked" };
      case "dispatched":
        return { className: "badge-success", text: "Dispatched" };
      default:
        return { className: "badge-neutral", text: status };
    }
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-info">Trips in Progress</h2>
        <div className="badge badge-info">{tripsInProgress.length}</div>
      </div>

      {tripsInProgress.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-base-content/40" />
          </div>
          <p className="text-base-content/60">No active trips</p>
          <p className="text-sm text-base-content/40 mt-1">
            Active trips will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {tripsInProgress.map((purchasedTrip) => {
            const trip = getTripDetails(purchasedTrip);
            const bookerName = getBookerName(purchasedTrip.userId);
            const statusBadge = getStatusBadge(purchasedTrip.status);

            if (!trip) return null;

            return (
              <div
                key={purchasedTrip._id}
                onClick={() => handleTripClick(purchasedTrip.tripId)}
                className="border border-base-300 rounded-lg p-4 hover:bg-base-200 cursor-pointer transition-colors duration-200 group"
              >
                {/* Trip Route */}
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-base-content truncate">
                      {trip.originCity}
                    </div>
                    <div className="text-xs text-base-content/60">to</div>
                    <div className="text-sm font-medium text-base-content truncate">
                      {trip.destinationCity}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-base-content/60 transition-colors" />
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-info flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-base-content/60">Client</div>
                      <div className="font-medium text-base-content truncate">
                        {bookerName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-success flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-base-content/60">Departure</div>
                      <div className="font-medium text-base-content">
                        {formatDate(trip.departureDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-3 flex justify-between items-center">
                  <div className={`badge badge-sm ${statusBadge.className}`}>
                    {statusBadge.text}
                  </div>
                  <div className="text-xs text-base-content/40">
                    Click to manage
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tripsInProgress.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/myTrips")}
            className="btn btn-ghost btn-sm"
          >
            View All Active Trips
          </button>
        </div>
      )}
    </div>
  );
};

export default TripsInProgressWidget;
