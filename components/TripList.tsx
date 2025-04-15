"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Spinner from "./spinner";
import { CalendarDays, Ticket } from "lucide-react";
import TripCard from "./TripCard";

const TripList = () => {
  //Get all events
  const trip = useQuery(api.trip.getTrip);

  if (!trip) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upcomming Trips</h1>
          <p className="mt-2 text-gray-600">
            Discover & book a trip for your cargo
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">{trip.length} Upcoming Trips</span>
          </div>
        </div>
      </div>

      {/* Upcoming Trips Grid */}
      {trip.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {trip.map((trip) => (
            <TripCard key={trip._id} tripId={trip._id} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center mb-12">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No upcoming trips
          </h3>
          <p className="text-gray-600 mt-1">Check back later for new trips</p>
        </div>
      )}
    </div>
  );
};

export default TripList;
