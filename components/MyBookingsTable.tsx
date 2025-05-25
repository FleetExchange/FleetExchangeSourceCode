"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { CiMenuKebab } from "react-icons/ci";

import Link from "next/link";

type SortOption = "registration" | "payload" | "length" | "width" | "height";

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
  const trips = useQuery(api.trip.getTruckByIdArray, {
    tripIds: tripIds,
  });

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      <div className="fixed top-[50px] flex w-full max-w-8xl flex-col p-8">
        {/** Action bar */}
        <div className="felx-row flex justify-between gap-2 bg-base-100 border-1 border-base-300 rounded-t-xl items-center px-5 py-2">
          <div className="flex flex-row justify-start gap-4 items-center"></div>
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
                {userBookings?.map((booking, index) => {
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
                            pathname: "/trip",
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
