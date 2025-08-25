"use client";

import FullCalendar from "@/components/FullCalendar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Calendar as CalendarIcon } from "lucide-react";
import { formatDateTimeInSAST } from "@/utils/dateUtils";

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
    clientBookings?.map((booking) => {
      // Format dates in SAST for calendar display
      const departureDateTime = formatDateTimeInSAST(booking.departureDate);
      const arrivalDateTime = formatDateTimeInSAST(booking.arrivalDate);

      return {
        id: booking._id,
        title: `Destination: ${booking.destinationCity}`,
        start: new Date(booking.departureDate), // Calendar library expects Date objects
        end: new Date(booking.arrivalDate),
        // Add formatted display data for tooltips/popups
        formattedStart: departureDateTime.fullDateTime,
        formattedEnd: arrivalDateTime.fullDateTime,
        departureDate: departureDateTime.date,
        departureTime: departureDateTime.time,
        arrivalDate: arrivalDateTime.date,
        arrivalTime: arrivalDateTime.time,
      };
    }) ?? [];

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
                  View all your upcoming bookings in one place
                </p>
              </div>
              {/* Optional stats or action button could go here */}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-base-300 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-base-content">
                    Booking Calendar
                  </h2>
                  <p className="text-sm text-base-content/60">
                    {bookingEvents.length} active bookings scheduled
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar Content */}
            <div className="p-4 lg:p-6">
              {clientBookings ? (
                <FullCalendar bookings={bookingEvents} />
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

export default ClientCalendarPage;
