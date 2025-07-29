"use client";

import FullCalendar from "@/components/FullCalendar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

const ClientCalendarPage = () => {
  const { user } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : { clerkId: "skip" }
  );

  const clientId = userData?._id;

  // Bookings for the transporter
  const clientPurchaseTrips = useQuery(
    api.purchasetrip.getPurchaseTripByUserId,
    clientId ? { userId: clientId } : "skip"
  );

  const filteredClientPurchaseTrips =
    clientPurchaseTrips?.filter(
      (trip) => trip.status != "Cancelled" && trip.status !== "Refunded"
    ) ?? [];

  const clientBookings = useQuery(api.trip.getTripByIdArray, {
    tripIds: filteredClientPurchaseTrips?.map((trip) => trip.tripId) ?? [],
  });

  const bookingEvents =
    clientBookings?.map((booking) => ({
      id: booking._id,
      title: `Destination: ${booking.destinationCity}`,
      start: new Date(booking.departureDate),
      end: new Date(booking.arrivalDate),
    })) ?? [];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="w-full max-w-6xl bg-base-100 rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold mb-2 text-primary">Calendar</h1>
        <p className="mb-6 text-base-content/70 text-center">
          View all your upcoming bookings in one place.
        </p>

        <FullCalendar bookings={bookingEvents} />
      </div>
    </div>
  );
};

export default ClientCalendarPage;
