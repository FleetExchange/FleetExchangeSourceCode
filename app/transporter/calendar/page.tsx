"use client";

import FullCalendar from "@/components/FullCalendar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

const TransporterCalendarPage = () => {
  const { user } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : { clerkId: "skip" }
  );

  const transporterId = userData?._id;

  // Trips for the transporter
  const trips = useQuery(
    api.trip.getTripsByIssuerId,
    transporterId ? { issuerId: transporterId } : "skip"
  );

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
    transporterId ? { userId: transporterId } : "skip"
  );

  const filteredTransporterPurchaseTrips =
    transporterPurchaseTrips?.filter(
      (trip) => trip.status != "Cancelled" && trip.status !== "Refunded"
    ) ?? [];

  const transporterBookings = useQuery(api.trip.getTripByIdArray, {
    tripIds: filteredTransporterPurchaseTrips?.map((trip) => trip.tripId) ?? [],
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
        <h1 className="text-3xl font-bold mb-2 text-primary">Calendar</h1>
        <p className="mb-6 text-base-content/70 text-center">
          View all your upcoming trips and bookings in one place.
        </p>
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded bg-blue-500 border border-blue-700"></span>
            <span className="text-sm text-base-content">
              Trips are{" "}
              <span className="font-semibold text-blue-600">blue</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded bg-green-500 border border-green-700"></span>
            <span className="text-sm text-base-content">
              Bookings are{" "}
              <span className="font-semibold text-green-600">green</span>
            </span>
          </div>
        </div>
        <FullCalendar trips={tripEvents} bookings={bookingEvents} />
      </div>
    </div>
  );
};

export default TransporterCalendarPage;
