"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { CiMenuKebab, CiSearch } from "react-icons/ci";

import Link from "next/link";
import { useState } from "react";

type SortOption = "Price Asc" | "Price Desc" | "Date Asc" | "Date Desc";

const MyBookedTripsTable = () => {
  // define all states for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusSelection, setStatusSelection] = useState<
    | "Awaiting Confirmation"
    | "Booked"
    | "Dispatched"
    | "Delivered"
    | "Cancelled"
    | "Refunded"
  >("Awaiting Confirmation");
  const [pastOrUpcoming, setPastOrFuture] = useState<
    "All Trips" | "Upcomming Trips" | "Past Trips"
  >("All Trips");
  const [sortBy, setSortBy] = useState<SortOption>("Date Asc");

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  };

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
    return <div className="p-4">Loading trips...</div>;
  }

  // Add this filtering function before the return statement
  const filteredBookings = bookedTrips?.filter((trip) => {
    const purchase = purchasedTrips?.find((t) => t.tripId === trip._id);

    if (!purchase) return false;

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
      purchase.status === statusSelection
    );
  });

  // Sort the filtered bookings based on the selected sort option
  const sortedAndFilteredBookings = filteredBookings?.sort((a, b) => {
    const tripA = purchasedTrips.find((t) => t.tripId === a._id);
    const tripB = purchasedTrips?.find((t) => t.tripId === b._id);

    if (!tripA || !tripB) return 0;

    switch (sortBy) {
      case "Price Asc":
        return tripA.amount - tripB.amount;
      case "Price Desc":
        return tripB.amount - tripA.amount;
      case "Date Asc":
        return (a.departureDate || 0) - (b.departureDate || 0);
      case "Date Desc":
        return (b.departureDate || 0) - (a.departureDate || 0);
      default:
        return 0;
    }
  });

  return (
    <>
      <div className="relative top-[50px] flex w-full max-w-8xl flex-col p-8">
        <p>My Trips that are booked</p>
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
                    | "Awaiting Confirmation"
                    | "Booked"
                    | "Dispatched"
                    | "Delivered"
                    | "Cancelled"
                    | "Refunded"
                )
              }
            >
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
                  <th>Origin City</th>
                  <th>Destination City</th>
                  <th>Departure Date</th>
                  <th>Arrival Date</th>
                  <th>Truck</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {sortedAndFilteredBookings?.map((booking, index) => {
                  const purchase = purchasedTrips?.find(
                    (t) => t.tripId === booking._id
                  );
                  const truck = trucks?.find((t) => t._id === booking.truckId);

                  return (
                    <tr key={booking._id} className="bg-base-100">
                      <th>{index + 1}</th>
                      <td>{booking.originCity}</td>
                      <td>{booking.destinationCity}</td>
                      <td>{formatDate(booking.departureDate)}</td>
                      <td>{formatDate(booking.arrivalDate)}</td>
                      <td>{truck?.registration}</td>
                      <td>{purchase?.amount}</td>
                      <td>{purchase?.status}</td>

                      <td>
                        <Link
                          href={{
                            pathname: "/tripOwner",
                            query: { tripId: booking._id as string },
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

export default MyBookedTripsTable;
