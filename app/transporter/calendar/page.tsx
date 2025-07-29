"use client";

import FullCalendar from "@/components/FullCalendar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

const TransporterCalendarPage = () => {
  const { user } = useUser();
  const transporterId = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id as Id<"users">,
  })?._id;

  // Trips for the transporter
  const trips = useQuery(api.trip.getTripsByIssuerId, {
    issuerId: transporterId as Id<"users">,
  });

  const transporterBookedTrips = useQuery(
    api.purchasetrip.getPurchaseTripByIdArray,
    {
      tripIds: trips?.map((trip) => trip._id) ?? [],
    }
  );

  const activeBookedTrips =
    transporterBookedTrips?.filter(
      (trip) => trip.status != "Cancelled" && trip.status !== "Refunded"
    ) ?? [];

  const transporterTrips =
    trips?.filter((trip) =>
      activeBookedTrips.some((bookedTrip) => bookedTrip.tripId === trip._id)
    ) ?? [];

  const truckForTripIds = useQuery(api.truck.getTruckByIdArray, {
    truckIds: transporterTrips.map((trip) => trip.truckId) as Id<"truck">[],
  });

  const truckForTrip = truckForTripIds?.map((truck) => ({
    id: truck._id,
    title: `${truck.registration}`,
  }));

  // Bookings for the transporter
  const transporterPurchaseTrips = useQuery(
    api.purchasetrip.getPurchaseTripByUserId,
    {
      userId: transporterId as Id<"users">,
    }
  );

  const transporterBookings = useQuery(api.trip.getTripByIdArray, {
    tripIds: transporterPurchaseTrips?.map((trip) => trip.tripId) ?? [],
  });

  const tripEvents =
    transporterTrips?.map((trip) => ({
      id: trip._id,
      title: `${
        truckForTrip?.find((truck) => truck.id === transporterTrips[0]?.truckId)
          ?.title
      } to: ${trip.destinationCity}`,
      start: new Date(trip.departureDate),
      end: new Date(trip.arrivalDate),
    })) ?? [];

  const bookingEvents =
    transporterBookings?.map((booking) => ({
      id: booking._id,
      title: `Booking: ${booking.destinationCity}`,
      start: new Date(booking.departureDate),
      end: new Date(booking.arrivalDate),
    })) ?? [];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="w-full max-w-6xl bg-base-100 rounded-2xl shadow-xl p-6">
        <FullCalendar trips={tripEvents} bookings={bookingEvents} />
      </div>
    </div>
  );
};

export default TransporterCalendarPage;
