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
  Truck,
  Eye,
  MoreHorizontal,
  Package,
} from "lucide-react";
import {
  formatDateTimeInSAST,
  formatDateInSAST,
  formatTimeInSAST,
} from "@/utils/dateUtils";

type SortOption = "Price Asc" | "Price Desc" | "Date Asc" | "Date Desc";

const MyBookedTripsTable = () => {
  // Pagination constant
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

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

  // Get the logged in user identity
  const { user } = useUser();

  // Get user's Convex ID with skip pattern
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "skip",
  })?._id;

  // Get all the trips that belongs to the user and that are booked
  const userTrips = useQuery(api.trip.getTripsByIssuerId, {
    issuerId: userId ?? "skip",
  });

  // Only process booked trips if we have userTrips
  const bookedTrips = userTrips?.filter((trip) => trip.isBooked === true) ?? [];

  // Get all tripIds from the booked Trips
  const bookedTripIds = bookedTrips.map((booking) => booking._id as Id<"trip">);

  // Get all the purchaseTrips that have the bookedTripIds
  const purchasedTrips = useQuery(api.purchasetrip.getPurchaseTripByIdArray, {
    tripIds: bookedTripIds.length > 0 ? bookedTripIds : [],
  });

  // Get all the trucks from the booked trips
  const bookedTrucks = bookedTrips.map((trip) => trip.truckId);
  // Get all the trucks by a array of truck IDs
  const trucks = useQuery(api.truck.getTruckByIdArray, {
    truckIds: bookedTrucks.length > 0 ? bookedTrucks : [],
  });

  if (!userTrips || !purchasedTrips) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Add this filtering function before the return statement
  const filteredBookings = bookedTrips?.filter((trip) => {
    const purchase = purchasedTrips?.find((t) => t.tripId === trip._id);

    if (!purchase) return false;

    // Filter by past or upcoming trips - using current SAST time
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
      (statusSelection === "Any Status" || purchase.status === statusSelection)
    );
  });

  // Sort the filtered bookings based on the selected sort option
  const sortedAndFilteredBookings = filteredBookings?.sort((a, b) => {
    const tripA = purchasedTrips.find((t) => t.tripId === a._id);
    const tripB = purchasedTrips?.find((t) => t.tripId === b._id);

    if (!tripA || !tripB) return 0;

    switch (sortBy) {
      case "Price Asc":
        return tripA.tripTotal - tripB.tripTotal;
      case "Price Desc":
        return tripB.tripTotal - tripA.tripTotal;
      case "Date Asc":
        return (a.departureDate || 0) - (b.departureDate || 0);
      case "Date Desc":
        return (b.departureDate || 0) - (a.departureDate || 0);
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-base-content mb-2">
          My Booked Trips
        </h1>
        <p className="text-base-content/60">
          All times shown in South African Standard Time (SAST)
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-base-200/50 border border-base-300 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base-content">Filter & Sort</h3>
            <p className="text-sm text-base-content/60">
              {totalItems} trips found
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
                    Schedule (SAST)
                  </div>
                </th>
                <th className="font-semibold text-base-content">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Vehicle
                  </div>
                </th>
                <th className="font-semibold text-base-content">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
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
                  const purchase = purchasedTrips?.find(
                    (t) => t.tripId === booking._id
                  );
                  const truck = trucks?.find((t) => t._id === booking.truckId);

                  return (
                    <tr key={booking._id} className="hover:bg-base-200/50">
                      <td className="font-medium text-base-content/60">
                        {startIndex + index + 1}
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-base-content">
                            {booking.originCity}
                          </div>
                          <div className="text-sm text-base-content/60">
                            → {booking.destinationCity}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-base-content/60">Dep:</span>{" "}
                            <span className="font-medium">
                              {booking.departureDate
                                ? `${formatDateInSAST(booking.departureDate)} at ${formatTimeInSAST(booking.departureDate)}`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-base-content/60">Arr:</span>{" "}
                            <span className="font-medium">
                              {booking.arrivalDate
                                ? `${formatDateInSAST(booking.arrivalDate)} at ${formatTimeInSAST(booking.arrivalDate)}`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-base-content">
                          {truck?.registration || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold text-success">
                          R{purchase?.tripTotal?.toFixed(2) || "0.00"}
                        </div>
                      </td>
                      <td>{getStatusBadge(purchase?.status || "")}</td>
                      <td>
                        <Link
                          href={{
                            pathname: "/tripOwner",
                            query: { tripId: booking._id as string },
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
                          No trips found
                        </h3>
                        <p className="text-base-content/60 text-sm">
                          {searchTerm ||
                          statusSelection !== "Any Status" ||
                          pastOrUpcoming !== "All Trips"
                            ? "Try adjusting your filters to see more trips."
                            : "No booked trips available."}
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

export default MyBookedTripsTable;
