"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Spinner from "./spinner";
import { CalendarDays, Ticket } from "lucide-react";

const ConnectionList = () => {
  //Get all events
  const connection = useQuery(api.connection.getConnection);

  if (!connection) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  //Filters
  const filterTrip = connection.trips;
  const filterFrieght = connection.freights;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Upcomming Trips & Frieghts
          </h1>
          <p className="mt-2 text-gray-600">
            Discover & book trips for your cargo
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">
              {filterTrip.length + filterFrieght.length} Upcoming Connections
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Trips Grid */}
      {filterTrip.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filterTrip.map((trip) => (
            <ConnectionCard key={trip._id} tripId={trip._id} />
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

      {/* Upcoming Freight Grid */}
      {filterFrieght.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filterFrieght.map((freight) => (
            <ConnectionCard key={freight._id} freightId={freight._id} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center mb-12">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No upcoming freight
          </h3>
          <p className="text-gray-600 mt-1">
            Check back later for new frieghts
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionList;
