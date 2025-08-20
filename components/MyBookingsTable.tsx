"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import PaginationControls from "./PaginationControls";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Eye,
  Package,
  DollarSign,
} from "lucide-react";

type SortOption = "Price Asc" | "Price Desc" | "Date Asc" | "Date Desc";

const MyBookingsTable = () => {
  // Pagination constant
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const clerkUserId = user?.id ?? "";
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkUserId,
  })?._id;

  // Get all the purchaseTrips that belongs to the user
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

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  };

  // define all states for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusSelection, setStatusSelection] = useState<
    | "Any Status"
    | "Awaiting Confirmation"
    | "Booked"
    | "Dispatched"
    | "Delivered"
    | "Cancelled"
    | "Refunded"
  >("Any Status");
  const [pastOrUpcoming, setPastOrFuture] = useState<
    "All Trips" | "Upcomming Trips" | "Past Trips"
  >("All Trips");
  const [sortBy, setSortBy] = useState<SortOption>("Date Asc");

  if (!userBookings) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Add this filtering function before the return statement
  const filteredBookings =
    userBookings?.filter((booking) => {
      const trip = trips?.find((t) => t._id === booking.tripId);

      if (!trip) return false;

      // Filter by past or upcoming trips
      const currentDate = new Date();
      if (pastOrUpcoming === "Upcomming Trips") {
        if (trip.departureDate && new Date(trip.departureDate) < currentDate) {
          return false; // Exclude past trips
        }
      } else if (pastOrUpcoming === "Past Trips") {
        if (trip.departureDate && new Date(trip.departureDate) >= currentDate) {
          return false; // Exclude upcoming trips
        }
      }

      const searchString = searchTerm.toLowerCase();
      return (
        (trip.originCity?.toLowerCase().includes(searchString) ||
          trip.destinationCity?.toLowerCase().includes(searchString)) &&
        (statusSelection === "Any Status" || booking.status === statusSelection)
      );
    }) ?? [];

  // Sort the filtered bookings based on the selected sort option
  const sortedAndFilteredBookings = filteredBookings?.sort((a, b) => {
    const tripA = trips?.find((t) => t._id === a.tripId);
    const tripB = trips?.find((t) => t._id === b.tripId);

    if (!tripA || !tripB) return 0;

    switch (sortBy) {
      case "Price Asc":
        return a.amount - b.amount;
      case "Price Desc":
        return b.amount - a.amount;
      case "Date Asc":
        return (tripA.departureDate || 0) - (tripB.departureDate || 0);
      case "Date Desc":
        return (tripB.departureDate || 0) - (tripA.departureDate || 0);
      default:
        return 0;
    }
  });

  // Calculate pagination values
  const totalItems = sortedAndFilteredBookings.length;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Get current page items
  const currentItems = sortedAndFilteredBookings.slice(startIndex, endIndex);

  // Customise badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Booked":
        return <span className="badge badge-primary">{status}</span>;
      case "Dispatched":
        return <span className="badge badge-info">{status}</span>;
      case "Delivered":
        return <span className="badge badge-success">{status}</span>;
      case "Cancelled":
        return <span className="badge badge-error">{status}</span>;
      case "Refunded":
        return <span className="badge badge-warning">{status}</span>;
      case "Awaiting Confirmation":
        return <span className="badge badge-neutral">Awaiting</span>;
      default:
        return <span className="badge badge-ghost">{status}</span>;
    }
  };

  return (
    <div className="p-6">
      {/* Filter Controls */}
      <div className="bg-base-200/50 border border-base-300 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base-content">Filter & Sort</h3>
            <p className="text-sm text-base-content/60">
              {totalItems} bookings found
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/60" />
            <input
              type="search"
              placeholder="Search cities..."
              className="input input-bordered w-full pl-10 focus:outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Selection */}
          <select
            className="select select-bordered focus:outline-none focus:border-primary"
            value={statusSelection}
            onChange={(e) =>
              setStatusSelection(
                e.target.value as
                  | "Any Status"
                  | "Awaiting Confirmation"
                  | "Booked"
                  | "Dispatched"
                  | "Delivered"
                  | "Cancelled"
                  | "Refunded"
              )
            }
          >
            <option value="Any Status">Any Status</option>
            <option value="Awaiting Confirmation">Awaiting Confirmation</option>
            <option value="Booked">Booked</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>

          {/* Past/Upcoming */}
          <select
            className="select select-bordered focus:outline-none focus:border-primary"
            value={pastOrUpcoming}
            onChange={(e) =>
              setPastOrFuture(
                e.target.value as "Upcomming Trips" | "Past Trips" | "All Trips"
              )
            }
          >
            <option value="All Trips">All Trips</option>
            <option value="Upcomming Trips">Upcoming Trips</option>
            <option value="Past Trips">Past Trips</option>
          </select>

          {/* Sort By */}
          <select
            className="select select-bordered focus:outline-none focus:border-primary"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="Date Asc">Date Ascending</option>
            <option value="Date Desc">Date Descending</option>
            <option value="Price Asc">Price Ascending</option>
            <option value="Price Desc">Price Descending</option>
          </select>

          {/* Pagination */}
          <div className="flex items-center justify-center">
            <PaginationControls
              currentPage={totalPages === 0 ? 0 : currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead className="bg-base-200">
              <tr>
                <th className="font-semibold text-base-content">#</th>
                <th className="font-semibold text-base-content">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Route
                  </div>
                </th>
                <th className="font-semibold text-base-content">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </div>
                </th>
                <th className="font-semibold text-base-content">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Cargo Details
                  </div>
                </th>
                <th className="font-semibold text-base-content">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Amount
                  </div>
                </th>
                <th className="font-semibold text-base-content">Status</th>
                <th className="font-semibold text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((booking, index) => {
                  const trip = trips?.find((t) => t._id === booking.tripId);

                  return (
                    <tr key={booking._id} className="hover:bg-base-200/50">
                      <td className="font-medium text-base-content/60">
                        {startIndex + index + 1}
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-base-content">
                            {trip?.originCity || "Loading..."}
                          </div>
                          <div className="text-sm text-base-content/60">
                            → {trip?.destinationCity || "Loading..."}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-base-content/60">Dep:</span>{" "}
                            <span className="font-medium">
                              {formatDate(trip?.departureDate)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-base-content/60">Arr:</span>{" "}
                            <span className="font-medium">
                              {formatDate(trip?.arrivalDate)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          {booking.cargoWeight && (
                            <div className="text-sm">
                              <span className="text-base-content/60">
                                Weight:
                              </span>{" "}
                              <span className="font-medium">
                                {booking.cargoWeight}kg
                              </span>
                            </div>
                          )}
                          {booking.freightNotes && (
                            <div className="text-sm text-base-content/60 truncate max-w-[150px]">
                              {booking.freightNotes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold text-success">
                          R{booking.amount?.toFixed(2) || "0.00"}
                        </div>
                      </td>
                      <td>{getStatusBadge(booking?.status || "")}</td>
                      <td>
                        <Link
                          href={{
                            pathname: "/tripClient",
                            query: { tripId: booking.tripId as string },
                          }}
                        >
                          <button className="btn btn-ghost btn-sm gap-2 hover:bg-base-200">
                            <Eye className="w-4 h-4" />
                            <span className="hidden lg:inline">View</span>
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-base-200/50 rounded-full">
                        <Package className="w-8 h-8 text-base-content/60" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base-content mb-1">
                          No bookings found
                        </h3>
                        <p className="text-base-content/60 text-sm">
                          {searchTerm ||
                          statusSelection !== "Any Status" ||
                          pastOrUpcoming !== "All Trips"
                            ? "Try adjusting your filters to see more bookings."
                            : "No bookings available."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsTable;
