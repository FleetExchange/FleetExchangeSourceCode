"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { CiMenuKebab, CiSearch } from "react-icons/ci";

import Link from "next/link";
import { useState } from "react";

type SortOption = "Price Asc" | "Price Desc" | "Date Asc" | "Date Desc";

const MyBookingsTable = () => {
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
  const trips = useQuery(api.trip.getTripByIdArray, {
    tripIds: tripIds,
  });

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

  // Add this filtering function before the return statement
  const filteredBookings = userBookings?.filter((booking) => {
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
      (trip.originAddress?.toLowerCase().includes(searchString) ||
        trip.destinationAddress?.toLowerCase().includes(searchString)) &&
      (statusSelection === "Any Status" || booking.status === statusSelection)
    );
  });
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

  return (
    <>
      <div className="fixed top-[50px] flex w-full max-w-8xl flex-col p-8">
        {/** Action bar */}
        <div className="felx-row flex justify-between gap-2 bg-base-100 border-1 border-base-300 rounded-t-xl items-center px-5 py-2">
          <div className="flex flex-row justify-start gap-4 items-center">
            {/* Search Bar */}
            <div>
              <label className="input">
                <CiSearch />
                <input
                  className="input focus:ring-0 focus:outline-none"
                  type="search"
                  placeholder="Search Address"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>

            {/** Status Selection */}
            <select
              className="select focus:ring-none focus:outline-none"
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
              <option value="Awaiting Confirmation">
                Awaiting Confirmation
              </option>
              <option value="Booked">Booked</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
            </select>
            {/** Past/Upcomming */}
            <select
              className="select focus:ring-none focus:outline-none"
              value={pastOrUpcoming}
              onChange={(e) =>
                setPastOrFuture(
                  e.target.value as
                    | "Upcomming Trips"
                    | "Past Trips"
                    | "All Trips"
                )
              }
            >
              <option value="All Trips">All Trips</option>
              <option value="Upcomming Trips">Upcomming Trips</option>
              <option value="Past Trips">Past Trips</option>
            </select>
            {/** Sort By - Price, Date */}
            <select
              className="select focus:ring-none focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="Date Asc">Date Ascending</option>
              <option value="Date Desc">Date Descending</option>
              <option value="Price Asc">Price Ascending</option>
              <option value="Price Desc">Price Descending</option>
            </select>
          </div>
        </div>

        {/** Table */}
        <div>
          <div className="overflow-x-auto border-1 border-base-300 border-t-0">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Origin Address</th>
                  <th>Destination Address</th>
                  <th>Departure Date</th>
                  <th>Arrival Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {sortedAndFilteredBookings?.map((booking, index) => {
                  const trip = trips?.find((t) => t._id === booking.tripId);

                  return (
                    <tr key={booking._id} className="bg-base-100">
                      <th>{index + 1}</th>
                      <td>{trip?.originAddress || "Loading..."}</td>
                      <td>{trip?.destinationAddress || "Loading..."}</td>
                      <td>{formatDate(trip?.departureDate)}</td>
                      <td>{formatDate(trip?.arrivalDate)}</td>
                      <td>{booking.amount}</td>
                      <td>{booking.status}</td>
                      <td>
                        <Link
                          href={{
                            pathname: "/tripClient",
                            query: { tripId: booking.tripId as string },
                          }}
                        >
                          <button className="btn btn-square bg-base-100 border-none">
                            <CiMenuKebab />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyBookingsTable;
