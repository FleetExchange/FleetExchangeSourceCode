"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Spinner from "./spinner";
import { CalendarDays, Ticket } from "lucide-react";
import TripCard from "./TripCard";
import { TbClipboardOff } from "react-icons/tb";

type SortOption = "departureDate" | "price";

type SearchTerm = {
  from: string;
  to: string;
  arrival: string;
};

type FilterTerm = {
  depDate: string;
  depTime: string;
  arrDate: string;
  arrTime: string;
  truckType: string;
  width: string;
  length: string;
  height: string;
  payload: string;
};

const TripList = ({
  searchTerm,
  filterTerm,
  sortBy,
}: {
  searchTerm: SearchTerm;
  filterTerm: FilterTerm;
  sortBy: SortOption;
}) => {
  //Get all events
  const fetchedTrip = useQuery(api.trip.getTrip, { searchTerm, filterTerm });

  let trip = [...(fetchedTrip ?? [])]; // Safe copy, never undefined

  // Sorted events
  if (sortBy === "departureDate") {
    trip.sort(
      (a, b) =>
        new Date(a.departureDate).getTime() -
        new Date(b.departureDate).getTime()
    );
  }
  if (sortBy === "price") {
    trip.sort((a, b) => a.basePrice - b.basePrice);
  }

  if (!trip) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className=" px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">
            Upcomming Trips
          </h1>
          <p className="mt-2 text-neutral-600">
            Discover & book a trip for your cargo
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-base-100">
          <div className="flex items-center gap-2 text-neutral-600">
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">{trip.length} Upcoming Trips</span>
          </div>
        </div>
      </div>

      <hr className="border-t border-base-200 mb-5" />

      {/* Upcoming Trips Grid */}
      {trip.length > 0 ? (
        <div className="grid grid-cols-1 mb-12">
          {trip.map((trip) => (
            <TripCard key={trip._id} tripId={trip._id} />
          ))}
        </div>
      ) : (
        <div className="bg-base-100 rounded-lg p-12 text-center mb-12">
          <TbClipboardOff className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900">
            No upcoming trips
          </h3>
          <p className="text-neutral-600 mt-1">
            Check back later for new trips
          </p>
        </div>
      )}
    </div>
  );
};

export default TripList;
