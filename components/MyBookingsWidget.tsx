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
  Package,
  Clock,
} from "lucide-react";
import { formatDateTimeInSAST, formatDateInSAST } from "@/utils/dateUtils";

const MyBookingsWidget = () => {
  const { user } = useUser();
  const router = useRouter();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get all the purchaseTrips that belong to the user
  const userPurchaseTrips = useQuery(
    api.purchasetrip.getPurchaseTripByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Filter trips for those that are in progress
  const filteredPurchaseTrips =
    userPurchaseTrips?.filter(
      (trip) =>
        trip.status === "Awaiting Confirmation" ||
        trip.status === "Booked" ||
        trip.status === "Dispatched"
    ) ?? [];

  // Get the tripIds from the filtered purchase trips
  const tripIds = filteredPurchaseTrips.map(
    (trip) => trip.tripId as Id<"trip">
  );

  // Get all the trips that match the tripIds
  const trips = useQuery(api.trip.getTripByIdArray, {
    tripIds: tripIds.length > 0 ? tripIds : [],
  });

  // Get all unique issuer IDs (transporters) from trips
  const transporterIds = [...new Set(trips?.map((trip) => trip.userId) || [])];

  // Get all transporter user details
  const transporters = useQuery(api.users.getUsersByIds, {
    userIds: transporterIds.length > 0 ? transporterIds : [],
  });

  const handleTripClick = (tripId: string) => {
    router.push(`/tripClient?tripId=${tripId}`);
  };

  // Helper function to get transporter name
  const getTransporterName = (transporterId: string) => {
    const transporter = transporters?.find((t) => t._id === transporterId);
    return transporter?.name || "Unknown Transporter";
  };

  // Helper function to get trip details
  const getTripDetails = (purchasedTrip: any) => {
    const trip = trips?.find((t) => t._id === purchasedTrip.tripId);
    return trip;
  };

  // Helper function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "awaiting confirmation":
        return {
          className: "badge-warning",
          text: "Pending Approval",
          icon: Clock,
        };
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
          icon: MapPin,
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
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-base-content">
              My Bookings
            </h2>
            <p className="text-sm text-base-content/60">
              Active and pending bookings (SAST)
            </p>
          </div>
        </div>
        <div className="badge badge-primary font-medium">
          {filteredPurchaseTrips.length}
        </div>
      </div>

      {filteredPurchaseTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-6 bg-primary/10 rounded-full mb-4 border border-primary/20">
            <Package className="w-12 h-12 text-primary" />
          </div>
          <h3 className="font-semibold text-base-content mb-2">
            No active bookings
          </h3>
          <p className="text-sm text-base-content/60">
            Trips you booked will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {filteredPurchaseTrips.map((purchasedTrip) => {
            const trip = getTripDetails(purchasedTrip);
            const transporterName = getTransporterName(trip?.userId || "");
            const statusBadge = getStatusBadge(purchasedTrip.status);
            const StatusIcon = statusBadge.icon;

            // Format departure date and time in SAST
            const departureSAST = trip?.departureDate
              ? formatDateTimeInSAST(trip.departureDate)
              : null;

            if (!trip) return null;

            return (
              <div
                key={purchasedTrip._id}
                onClick={() => handleTripClick(purchasedTrip.tripId)}
                className="bg-base-200/50 border border-base-300 rounded-xl p-4 hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all duration-200 group"
              >
                {/* Trip Route Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-info/10 rounded-lg border border-info/20">
                      <MapPin className="w-4 h-4 text-info flex-shrink-0" />
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
                  <ChevronRight className="w-5 h-5 text-base-content/40 group-hover:text-primary transition-colors flex-shrink-0" />
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Transporter Info */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg border border-secondary/20">
                      <User className="w-4 h-4 text-secondary flex-shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-base-content/60 mb-1">
                        Transporter
                      </div>
                      <div className="font-medium text-sm text-base-content truncate">
                        {transporterName}
                      </div>
                    </div>
                  </div>

                  {/* Departure Date - Enhanced with SAST formatting */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                      <Calendar className="w-4 h-4 text-success flex-shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-base-content/60 mb-1">
                        Departure (SAST)
                      </div>
                      <div className="font-medium text-sm text-base-content">
                        {departureSAST ? departureSAST.date : "N/A"}
                      </div>
                      {departureSAST && (
                        <div className="text-xs text-base-content/60">
                          at {departureSAST.time}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Status and Action with timing info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-base-300">
                  <div className="flex items-center gap-3">
                    <div className={`badge ${statusBadge.className} gap-2`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.text}
                    </div>
                    {/* Show total amount if available */}
                    {purchasedTrip.tripTotal && (
                      <div className="text-xs text-success font-medium">
                        R{purchasedTrip.tripTotal.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-base-content/60 group-hover:text-primary transition-colors">
                    Click to view details →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Button */}
      {filteredPurchaseTrips.length > 3 && (
        <div className="mt-6 pt-4 border-t border-base-300">
          <button
            onClick={() => router.push("/myBookings")}
            className="btn btn-primary btn-outline w-full sm:w-auto gap-2 hover:bg-primary hover:text-primary-content"
          >
            <ChevronRight className="w-4 h-4" />
            View All My Bookings
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBookingsWidget;
