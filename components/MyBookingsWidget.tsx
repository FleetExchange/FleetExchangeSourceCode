"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, User, ChevronRight, Package } from "lucide-react";

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

  const formatDate = (date: string | number) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
        return { className: "badge-warning", text: "Pending Approval" };
      case "booked":
        return { className: "badge-info", text: "Confirmed" };
      case "dispatched":
        return { className: "badge-success", text: "In Transit" };
      default:
        return { className: "badge-neutral", text: status };
    }
  };

  return (
    <div className="lg:col-span-2 bg-base-100 rounded-lg shadow-lg p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-success">My Bookings</h2>
        <div className="badge badge-success">
          {filteredPurchaseTrips.length}
        </div>
      </div>

      {filteredPurchaseTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-base-content/40" />
          </div>
          <p className="text-base-content/60">No bookings yet</p>
          <p className="text-sm text-base-content/40 mt-1">
            Your booked trips will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredPurchaseTrips.map((purchasedTrip) => {
            const trip = getTripDetails(purchasedTrip);
            const transporterName = getTransporterName(trip?.userId || "");
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
                    <User className="w-3 h-3 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-base-content/60">Transporter</div>
                      <div className="font-medium text-base-content truncate">
                        {transporterName}
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
                    Click to view details
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredPurchaseTrips.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/myBookings")}
            className="btn btn-ghost btn-sm"
          >
            View All My Bookings
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBookingsWidget;
