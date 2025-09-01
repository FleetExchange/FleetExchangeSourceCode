"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import {
  MapPin,
  Search,
  Filter,
  Calendar,
  Truck,
  ArrowRight,
  Eye,
  Edit,
  X,
  Package,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  formatDateTimeInSAST,
  formatDateInSAST,
  formatTimeInSAST,
} from "@/utils/dateUtils";

const MyTripsCardList = () => {
  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const clerkUserId = user?.id ?? "";
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkUserId,
  })?._id;

  // Get all the trips that belong to the user - ONLY call if userId exists
  const allUserTrips = useQuery(
    api.trip.getTripsByIssuerId,
    userId ? { issuerId: userId as Id<"users"> } : "skip"
  );

  // Get all the truck Id's from trips
  const userTrucksIds = allUserTrips?.map((trip) => trip.truckId) || [];
  const userTrucks = useQuery(api.truck.getTruckByIdArray, {
    truckIds: userTrucksIds as Id<"truck">[],
  });

  // From all the trips, get the booked trips and their purchase trip objects
  const bookedTrips = allUserTrips?.filter((trip) => trip.isBooked === true);
  const purchaseTripIds = bookedTrips?.map((trip) => trip._id) || [];

  //Only call the query if there are actually trip IDs
  const purchaseTrips = useQuery(
    api.purchasetrip.getPurchaseTripByIdArray,
    purchaseTripIds.length > 0
      ? { tripIds: purchaseTripIds as Id<"trip">[] }
      : "skip"
  );

  // define all states for filtering and sorting
  const [originSearchTerm, setOriginSearchTerm] = useState("");
  const [destSearchTerm, setDestSearchTerm] = useState("");

  const [statusSelection, setStatusSelection] = useState<
    | "Any Status"
    | "Not Booked"
    | "Awaiting Confirmation"
    | "Booked"
    | "Dispatched"
    | "Delivered"
    | "Cancelled"
    | "Refunded"
  >("Any Status");

  //Filter the bookings based on search terms
  const routeFilteredTrips = allUserTrips?.filter((trip) => {
    const matchesOrigin =
      originSearchTerm === "" ||
      trip.originCity.toLowerCase().includes(originSearchTerm.toLowerCase());
    const matchesDest =
      destSearchTerm === "" ||
      trip.destinationCity.toLowerCase().includes(destSearchTerm.toLowerCase());
    return matchesOrigin && matchesDest;
  });

  // Filter the bookings based on status selection
  const statusFilteredTrips = routeFilteredTrips?.filter((trip) => {
    if (statusSelection === "Any Status") return true;
    else if (statusSelection === "Not Booked") return !trip.isBooked;
    else {
      const purchaseTrip = purchaseTrips?.find((pt) => pt.tripId === trip._id);
      if (!purchaseTrip) return false; // No purchase trip found
      if (purchaseTrip.status === statusSelection) return trip;
    }
  });

  // Sort trips by most recent
  const sortedTrips = statusFilteredTrips?.sort((a, b) => {
    const aDate = a.departureDate ? new Date(a.departureDate).getTime() : 0;
    const bDate = b.departureDate ? new Date(b.departureDate).getTime() : 0;
    return aDate - bDate; // Sort descending
  });

  // Get status for a trip
  const getTripStatus = (trip: any) => {
    if (!trip.isBooked) return "Not Booked";
    const purchaseTrip = purchaseTrips?.find((pt) => pt.tripId === trip._id);
    return purchaseTrip?.status || "Unknown";
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Not Booked":
        return "badge badge-ghost";
      case "Awaiting Confirmation":
        return "badge badge-warning";
      case "Booked":
        return "badge badge-info";
      case "Dispatched":
        return "badge badge-primary";
      case "Delivered":
        return "badge badge-success";
      case "Cancelled":
      case "Refunded":
        return "badge badge-error";
      default:
        return "badge badge-ghost";
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setOriginSearchTerm("");
    setDestSearchTerm("");
    setStatusSelection("Any Status");
  };

  if (!allUserTrips) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-base-content mb-2">
          My Trips
        </h1>
        <p className="text-base-content/60">
          All times shown in South African Standard Time (SAST)
        </p>
      </div>

      {/* Filter Header */}
      <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base-content">Filter Trips</h3>
            <p className="text-xs text-base-content/60">
              {sortedTrips?.length || 0} trips found
            </p>
          </div>
        </div>

        {/* Search Inputs */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/60" />
            <input
              type="text"
              placeholder="Search origin city..."
              className="input input-bordered input-sm w-full pl-10 focus:outline-none focus:border-primary"
              value={originSearchTerm}
              onChange={(e) => setOriginSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/60" />
            <input
              type="text"
              placeholder="Search destination city..."
              className="input input-bordered input-sm w-full pl-10 focus:outline-none focus:border-primary"
              value={destSearchTerm}
              onChange={(e) => setDestSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="select select-bordered select-sm w-full focus:outline-none focus:border-primary"
            value={statusSelection}
            onChange={(e) => setStatusSelection(e.target.value as any)}
          >
            <option value="Any Status">Any Status</option>
            <option value="Not Booked">Not Booked</option>
            <option value="Awaiting Confirmation">Awaiting Confirmation</option>
            <option value="Booked">Booked</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>

          {/* Clear Filters Button */}
          {(originSearchTerm ||
            destSearchTerm ||
            statusSelection !== "Any Status") && (
            <button
              onClick={clearFilters}
              className="btn btn-ghost btn-sm gap-2 w-full"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Trip Cards */}
      <div className="space-y-4">
        {sortedTrips && sortedTrips.length > 0 ? (
          sortedTrips.map((trip) => {
            const status = getTripStatus(trip);
            const purchaseTrip = purchaseTrips?.find(
              (pt) => pt.tripId === trip._id
            );
            const truck = userTrucks?.find((t) => t._id === trip.truckId);

            return (
              <div
                key={trip._id}
                className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-4"
              >
                {/* Route Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1 bg-primary/10 rounded-lg border border-primary/20">
                      <MapPin className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 min-w-0 text-sm font-medium">
                      <span className="truncate">{trip.originCity}</span>
                      <ArrowRight className="w-3 h-3 text-base-content/60 shrink-0" />
                      <span className="truncate">{trip.destinationCity}</span>
                    </div>
                  </div>
                  <div className={getStatusBadge(status)}>
                    <span className="text-xs">{status}</span>
                  </div>
                </div>

                {/* Enhanced Trip Schedule with SAST formatting */}
                <div className="bg-base-200/30 border border-base-300 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-base-content">
                      Schedule (SAST)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Departure */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-info rounded-full"></div>
                        <span className="text-xs text-base-content/60">
                          Departure
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">
                          {trip.departureDate
                            ? formatDateInSAST(trip.departureDate)
                            : "N/A"}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {trip.departureDate
                            ? formatTimeInSAST(trip.departureDate)
                            : ""}
                        </p>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-xs text-base-content/60">
                          Arrival
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">
                          {trip.arrivalDate
                            ? formatDateInSAST(trip.arrivalDate)
                            : "N/A"}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {trip.arrivalDate
                            ? formatTimeInSAST(trip.arrivalDate)
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Truck Information */}
                {truck && (
                  <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-3 h-3 text-warning" />
                      <span className="text-xs font-medium text-base-content">
                        Vehicle Details
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-base-content/60">
                          Registration:
                        </span>
                        <span className="font-medium">
                          {truck.registration}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Type:</span>
                        <span className="font-medium">{truck.truckType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Capacity:</span>
                        <span className="font-medium">
                          {truck.maxLoadCapacity}kg
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Section */}
                <div className="bg-success/5 border border-success/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-3 h-3 text-success" />
                    <span className="text-xs font-medium text-base-content">
                      Pricing & Trip Details
                    </span>
                  </div>

                  {/* Pricing Breakdown */}
                  {(trip.basePrice > 0 ||
                    trip.KGPrice > 0 ||
                    trip.KMPrice > 0) && (
                    <div className="text-xs space-y-1 mb-3">
                      <p className="text-base-content/60 font-medium">
                        Rate Structure:
                      </p>
                      {trip.basePrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-base-content/60">
                            Base Price:
                          </span>
                          <span className="font-medium">
                            R{trip.basePrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {trip.KGPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Per KG:</span>
                          <span className="font-medium">
                            R{trip.KGPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {trip.KMPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Per KM:</span>
                          <span className="font-medium">
                            R{trip.KMPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trip Specifics (if booked) */}
                  {trip.isBooked && purchaseTrip && (
                    <div className="border-t border-success/20 pt-2">
                      <p className="text-base-content/60 font-medium mb-1 text-xs">
                        This Trip:
                      </p>
                      <div className="text-xs space-y-1">
                        {purchaseTrip.cargoWeight && (
                          <div className="flex justify-between">
                            <span className="text-base-content/60">
                              Cargo Weight:
                            </span>
                            <span className="font-medium">
                              {purchaseTrip.cargoWeight}kg
                            </span>
                          </div>
                        )}
                        {purchaseTrip.freightNotes && (
                          <div className="flex justify-between">
                            <span className="text-base-content/60">
                              Cargo Type:
                            </span>
                            <span className="font-medium text-xs truncate max-w-[120px]">
                              {purchaseTrip.freightNotes}
                            </span>
                          </div>
                        )}
                        {purchaseTrip.tripTotal && (
                          <div className="flex justify-between border-t border-success/20 pt-2 mt-2">
                            <span className="text-base-content font-medium">
                              Total Earned:
                            </span>
                            <span className="font-bold text-success">
                              R{purchaseTrip.tripTotal.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Estimated Earnings (if not booked) */}
                  {!trip.isBooked &&
                    (trip.basePrice > 0 ||
                      trip.KGPrice > 0 ||
                      trip.KMPrice > 0) && (
                      <div className="border-t border-success/20 pt-2">
                        <div className="flex justify-between">
                          <span className="text-base-content/60 text-xs">
                            Min. Earnings:
                          </span>
                          <span className="font-medium text-success text-xs">
                            R{(trip.basePrice || 0).toFixed(2)}+
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={{
                      pathname: "/tripOwner",
                      query: { tripId: trip._id as string },
                    }}
                  >
                    <button className="btn btn-primary btn-sm gap-2 flex-1">
                      <Eye className="w-3 h-3" />
                      {trip.isBooked ? "Manage" : "View"}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          // Empty State
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8 text-center">
            <div className="p-4 bg-base-200/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-base-content/60" />
            </div>
            <h3 className="text-lg font-semibold text-base-content mb-2">
              No trips found
            </h3>
            <p className="text-base-content/60 text-sm mb-4">
              {statusSelection !== "Any Status" ||
              originSearchTerm ||
              destSearchTerm
                ? "Try adjusting your filters to see more trips."
                : "You haven't created any trips yet."}
            </p>
            {(statusSelection !== "Any Status" ||
              originSearchTerm ||
              destSearchTerm) && (
              <button
                onClick={clearFilters}
                className="btn btn-ghost btn-sm gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTripsCardList;
