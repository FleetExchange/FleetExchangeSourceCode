"use client";

import TripCalendar from "@/components/TransporterCalendar";
import TransporterCalendar from "@/components/TransporterCalendar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

const TransporterCalendarPage = () => {
  const { user } = useUser();
  const transporterId = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id as Id<"users">,
  })?._id;

  const transporterTrips = useQuery(api.trip.getTripsByIssuerId, {
    issuerId: transporterId as Id<"users">,
  });

  const calendarTrips =
    transporterTrips?.map((trip) => ({
      id: trip._id,
      type: "trip" as const,
      title: trip.destinationCity,
      start: new Date(trip.departureDate),
      end: new Date(trip.arrivalDate),
    })) ?? [];

  return <TripCalendar trips={calendarTrips} />;
};

export default TransporterCalendarPage;
