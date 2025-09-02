"use client";

import FullCalendar from "@/components/FullCalendar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Calendar as CalendarIcon, Truck } from "lucide-react";
import {
  formatDateTimeInSAST,
  formatDateInSAST,
  formatTimeInSAST,
} from "@/utils/dateUtils";

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
    transporterTrips?.map((trip) => {
      return {
        id: trip._id,
        title: `${
          truckForTrip?.find((truck) => truck.id === trip.truckId)?.title
        } to: ${trip.destinationCity}`,
        start: new Date(Number(trip.departureDate)), // Ensure numeric UTC timestamp
        end: new Date(Number(trip.arrivalDate)),
        // Add formatted display data for tooltips/popups
        formattedStart: formatDateTimeInSAST(trip.departureDate),
        formattedEnd: formatDateTimeInSAST(trip.arrivalDate),
        departureDate: formatDateInSAST(trip.departureDate),
        departureTime: formatTimeInSAST(trip.departureDate),
        arrivalDate: formatDateInSAST(trip.arrivalDate),
        arrivalTime: formatTimeInSAST(trip.arrivalDate),
        type: "trip", // Identify as trip for styling
      };
    }) ?? [];

  const bookingEvents =
    transporterBookings?.map((booking) => {
      return {
        id: booking._id,
        title: `Booking: ${booking.destinationCity}`,
        start: new Date(Number(booking.departureDate)), // Ensure numeric UTC timestamp
        end: new Date(Number(booking.arrivalDate)),
        // Add formatted display data for tooltips/popups
        formattedStart: formatDateTimeInSAST(booking.departureDate),
        formattedEnd: formatDateTimeInSAST(booking.arrivalDate),
        departureDate: formatDateInSAST(booking.departureDate),
        departureTime: formatTimeInSAST(booking.departureDate),
        arrivalDate: formatDateInSAST(booking.arrivalDate),
        arrivalTime: formatTimeInSAST(booking.arrivalDate),
        type: "booking", // Identify as booking for styling
      };
    }) ?? [];

  const totalEvents = tripEvents.length + bookingEvents.length;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 pl-16 lg:pl-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                  Calendar
                </h1>
                <p className="text-base-content/60 mt-2">
                  View all your trips and bookings in one place
                </p>
              </div>
              {/* Optional: Add current time display */}
              <div className="text-sm text-base-content/60">
                All times shown in South African Standard Time (SAST)
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-base-300 p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-base-content">
                    Transportation Calendar
                  </h2>
                  <p className="text-sm text-base-content/60">
                    {totalEvents} active trips and bookings scheduled
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-info border-2 border-info-content/20"></div>
                  <span className="text-sm text-base-content">
                    Your Trips ({tripEvents.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-success border-2 border-success-content/20"></div>
                  <span className="text-sm text-base-content">
                    Your Bookings ({bookingEvents.length})
                  </span>
                </div>
              </div>
            </div>

            {/* Calendar Content */}
            <div className="p-4 lg:p-6">
              {trips && transporterBookings ? (
                <FullCalendar trips={tripEvents} bookings={bookingEvents} />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterCalendarPage;
