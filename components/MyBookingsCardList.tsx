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
  Package,
  ArrowRight,
  Eye,
  X,
  DollarSign,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  formatDateTimeInSAST,
  formatDateInSAST,
  formatTimeInSAST,
} from "@/utils/dateUtils";

const MyBookingsCardList = () => {
  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const clerkUserId = user?.id ?? "";
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkUserId,
  })?._id;

  // Get all user bookings - ONLY call if userId exists
  const userBookings = useQuery(
    api.purchasetrip.getPurchaseTripById,
    userId ? { userId } : "skip"
  );

  // Get all tripIds from bookings
  const tripIds =
    userBookings?.map((booking) => booking.tripId as Id<"trip">) || [];

  // Fetch all trips in one query
  const trips = useQuery(
    api.trip.getTripByIdArray,
    tripIds.length > 0 ? { tripIds: tripIds } : "skip"
  );

  // define all states for filtering and sorting
  const [originSearchTerm, setOriginSearchTerm] = useState("");
  const [destSearchTerm, setDestSearchTerm] = useState("");

  const [statusSelection, setStatusSelection] = useState<
    | "Any Status"
    | "Awaiting Confirmation"
    | "Booked"
    | "Dispatched"
    | "Delivered"
    | "Cancelled"
    | "Refunded"
  >("Any Status");

  //Filter the bookings based on search terms
  const routeFilteredBookings = userBookings?.filter((booking) => {
    const trip = trips?.find((t) => t._id === booking.tripId);
    if (!trip) return false;

    const matchesOrigin =
      originSearchTerm === "" ||
      trip.originCity.toLowerCase().includes(originSearchTerm.toLowerCase());
    const matchesDest =
      destSearchTerm === "" ||
      trip.destinationCity.toLowerCase().includes(destSearchTerm.toLowerCase());
    return matchesOrigin && matchesDest;
  });

  // Filter the bookings based on status selection
  const statusFilteredBookings = routeFilteredBookings?.filter((booking) => {
    if (statusSelection === "Any Status") return true;
    return booking.status === statusSelection;
  });

  // Sort bookings by most recent
  const sortedBookings = statusFilteredBookings?.sort((a, b) => {
    const tripA = trips?.find((t) => t._id === a.tripId);
    const tripB = trips?.find((t) => t._id === b.tripId);

    const aDate = tripA?.departureDate
      ? new Date(tripA.departureDate).getTime()
      : 0;
    const bDate = tripB?.departureDate
      ? new Date(tripB.departureDate).getTime()
      : 0;
    return bDate - aDate; // Sort descending (most recent first)
  });

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
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

  if (!userBookings) {
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
          My Bookings
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
            <h3 className="font-semibold text-base-content">Filter Bookings</h3>
            <p className="text-xs text-base-content/60">
              {sortedBookings?.length || 0} bookings found
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

      {/* Booking Cards */}
      <div className="space-y-4">
        {sortedBookings && sortedBookings.length > 0 ? (
          sortedBookings.map((booking) => {
            const trip = trips?.find((t) => t._id === booking.tripId);

            return (
              <div
                key={booking._id}
                className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-4"
              >
                {/* Route Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1 bg-primary/10 rounded-lg border border-primary/20">
                      <MapPin className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 min-w-0 text-sm font-medium">
                      <span className="truncate">
                        {trip?.originCity || "Loading..."}
                      </span>
                      <ArrowRight className="w-3 h-3 text-base-content/60 shrink-0" />
                      <span className="truncate">
                        {trip?.destinationCity || "Loading..."}
                      </span>
                    </div>
                  </div>
                  <div className={getStatusBadge(booking.status)}>
                    <span className="text-xs">{booking.status}</span>
                  </div>
                </div>

                {/* Trip Details Grid - Enhanced with SAST formatting */}
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
                          {formatDateInSAST(trip?.departureDate)}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {formatTimeInSAST(trip?.departureDate)}
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
                          {formatDateInSAST(trip?.arrivalDate)}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {formatTimeInSAST(trip?.arrivalDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cargo & Payment Section */}
                <div className="bg-info/5 border border-info/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-3 h-3 text-info" />
                    <span className="text-xs font-medium text-base-content">
                      Booking Details
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    {/* Cargo Information */}
                    {booking.cargoWeight && (
                      <div className="flex justify-between">
                        <span className="text-base-content/60">
                          Cargo Weight:
                        </span>
                        <span className="font-medium">
                          {booking.cargoWeight}kg
                        </span>
                      </div>
                    )}

                    {booking.freightNotes && (
                      <div className="flex justify-between">
                        <span className="text-base-content/60">
                          Cargo Type:
                        </span>
                        <span className="font-medium text-xs truncate max-w-[120px]">
                          {booking.freightNotes}
                        </span>
                      </div>
                    )}

                    {/* Payment Information */}
                    {booking.tripTotal && (
                      <div className="flex justify-between border-t border-info/20 pt-2 mt-2">
                        <span className="text-base-content font-medium">
                          Total Paid:
                        </span>
                        <span className="font-bold text-success">
                          R{booking.tripTotal.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pickup & Delivery Information */}
                {(trip?.originAddress || trip?.destinationAddress) && (
                  <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-3 h-3 text-warning" />
                      <span className="text-xs font-medium text-base-content">
                        Address Details
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      {trip.originAddress && (
                        <div>
                          <span className="text-base-content/60">Pickup:</span>
                          <p className="font-medium">{trip.originAddress}</p>
                        </div>
                      )}
                      {trip.destinationAddress && (
                        <div>
                          <span className="text-base-content/60">
                            Delivery:
                          </span>
                          <p className="font-medium">
                            {trip.destinationAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={{
                      pathname: "/tripClient",
                      query: { tripId: booking.tripId as string },
                    }}
                  >
                    <button className="btn btn-primary btn-sm gap-2 flex-1">
                      <Eye className="w-3 h-3" />
                      View Trip
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
              No bookings found
            </h3>
            <p className="text-base-content/60 text-sm mb-4">
              {statusSelection !== "Any Status" ||
              originSearchTerm ||
              destSearchTerm
                ? "Try adjusting your filters to see more bookings."
                : "You haven't made any bookings yet."}
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

export default MyBookingsCardList;
