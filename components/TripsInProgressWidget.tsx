"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  User,
  ChevronRight,
  Truck,
  Package,
} from "lucide-react";

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
        return {
          className: "badge-info",
          text: "Confirmed",
          icon: Package,
        };
      case "dispatched":
        return {
          className: "badge-success",
          text: "In Transit",
          icon: Truck,
        };
      default:
        return {
          className: "badge-neutral",
          text: status,
          icon: Package,
        };
    }
  };

  return (
    <div className="lg:col-span-2 bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-info/10 rounded-lg border border-info/20">
            <Truck className="w-5 h-5 text-info" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-base-content">
              Trips in Progress
            </h2>
            <p className="text-sm text-base-content/60">
              Active and dispatched trips
            </p>
          </div>
        </div>
        <div className="badge badge-info font-medium">
          {tripsInProgress.length}
        </div>
      </div>

      {tripsInProgress.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-6 bg-info/10 rounded-full mb-4 border border-info/20">
            <Truck className="w-12 h-12 text-info" />
          </div>
          <h3 className="font-semibold text-base-content mb-2">
            No active trips
          </h3>
          <p className="text-sm text-base-content/60">
            Active trips will appear here when they are booked
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {tripsInProgress.map((purchasedTrip) => {
            const trip = getTripDetails(purchasedTrip);
            const bookerName = getBookerName(purchasedTrip.userId);
            const statusBadge = getStatusBadge(purchasedTrip.status);
            const StatusIcon = statusBadge.icon;

            if (!trip) return null;

            return (
              <div
                key={purchasedTrip._id}
                onClick={() => handleTripClick(purchasedTrip.tripId)}
                className="bg-base-200/50 border border-base-300 rounded-xl p-4 hover:bg-info/5 hover:border-info/30 cursor-pointer transition-all duration-200 group"
              >
                {/* Trip Route Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-base-content truncate">
                          {trip.originCity}
                        </span>
                        <span className="text-xs text-base-content/60">→</span>
                        <span className="text-sm font-medium text-base-content truncate">
                          {trip.destinationCity}
                        </span>
                      </div>
                      <div className="text-xs text-base-content/60 mt-1">
                        Trip Route
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-base-content/40 group-hover:text-info transition-colors flex-shrink-0" />
                </div>

                {/* Trip Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Client Info */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg border border-secondary/20">
                      <User className="w-4 h-4 text-secondary flex-shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-base-content/60 mb-1">
                        Client
                      </div>
                      <div className="font-medium text-sm text-base-content truncate">
                        {bookerName}
                      </div>
                    </div>
                  </div>

                  {/* Departure Date */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                      <Calendar className="w-4 h-4 text-success flex-shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-base-content/60 mb-1">
                        Departure
                      </div>
                      <div className="font-medium text-sm text-base-content">
                        {formatDate(trip.departureDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-base-300">
                  <div className={`badge ${statusBadge.className} gap-2`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusBadge.text}
                  </div>
                  <div className="text-xs text-base-content/60 group-hover:text-info transition-colors">
                    Click to manage trip →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Button */}
      {tripsInProgress.length > 3 && (
        <div className="mt-6 pt-4 border-t border-base-300">
          <button
            onClick={() => router.push("/myTrips")}
            className="btn btn-info btn-outline w-full sm:w-auto gap-2 hover:bg-info hover:text-info-content"
          >
            <ChevronRight className="w-4 h-4" />
            View All Active Trips
          </button>
        </div>
      )}
    </div>
  );
};

export default TripsInProgressWidget;
