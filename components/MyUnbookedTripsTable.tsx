"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { CiMenuKebab, CiSearch } from "react-icons/ci";

import Link from "next/link";
import { useState } from "react";

type SortOption = "Price Asc" | "Price Desc" | "Date Asc" | "Date Desc";

const MyUnbookedTripsTable = () => {
  // define all states for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
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

  // Get all the trips that belongs to the user
  const userTrips = useQuery(api.trip.getTripsByIssuerId, {
    issuerId: userId ?? "skip",
  });
  // Only process unbooked trips if we have userTrips
  const unbookedTrips =
    userTrips?.filter((trip) => trip.isBooked === false) ?? [];

  // Get all the trucks from the user trips
  const userTripTrucks = (unbookedTrips ?? []).map((trip) => trip.truckId);
  // Get all the trucks by a array of truck IDs
  const trucks = useQuery(api.truck.getTruckByIdArray, {
    truckIds: userTripTrucks.length > 0 ? userTripTrucks : [],
  });

  if (!userTrips) {
    return <div className="p-4">Loading trips...</div>;
  }

  // Add this filtering function before the return statement
  const filteredTrips = unbookedTrips?.filter((trip) => {
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
      trip.originCity?.toLowerCase().includes(searchString) ||
      trip.destinationCity?.toLowerCase().includes(searchString)
    );
  });

  // Sort the filtered bookings based on the selected sort option
  const sortedAndFilteredTrips = filteredTrips?.sort((a, b) => {
    switch (sortBy) {
      case "Price Asc":
        return a.basePrice - b.basePrice;
      case "Price Desc":
        return b.basePrice - a.basePrice;
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
      <div className="fixed top-[50px] flex w-full max-w-8xl flex-col p-8">
        <p>My Trips that are not Booked</p>
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
                  <th>Base Price</th>
                  <th></th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {sortedAndFilteredTrips?.map((trip, index) => {
                  const truck = trucks?.find((t) => t._id === trip.truckId);

                  return (
                    <tr key={trip._id} className="bg-base-100">
                      <th>{index + 1}</th>
                      <td>{trip.originCity}</td>
                      <td>{trip.destinationCity}</td>
                      <td>{formatDate(trip.departureDate)}</td>
                      <td>{formatDate(trip.arrivalDate)}</td>
                      <td>{truck?.registration}</td>
                      <td>{trip?.basePrice}</td>

                      <td>
                        <Link
                          href={{
                            pathname: "/tripOwner",
                            query: { tripId: trip._id as string },
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

export default MyUnbookedTripsTable;
