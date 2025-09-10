"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Spinner from "./spinner";
import { CalendarDays, Package, Search, TruckIcon } from "lucide-react";
import TripCard from "./TripCard";
import { TbClipboardOff } from "react-icons/tb";
import { useState } from "react";
import PaginationControls from "./PaginationControls";

type SortOption = "departureDate" | "price";

type SearchTerm = {
  from: string;
  to: string;
  arrival: string;
};

type FilterTerm = {
  depDate: string;

  arrDate: string;

  truckType: string;
  width: string;
  length: string;
  height: string;
  payload: string;
};

const ITEMS_PER_PAGE = 20;
const TripList = ({
  searchTerm,
  filterTerm,
  sortBy,
}: {
  searchTerm: SearchTerm;
  filterTerm: FilterTerm;
  sortBy: SortOption;
}) => {
  const [currentPage, setCurrentPage] = useState(1);

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

  // Calculate pagination values
  const totalItems = trip.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Get current page items
  const currentItems = trip.slice(startIndex, endIndex);

  if (!trip) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <TruckIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-base-content">
              Available Trips
            </h2>
            <p className="text-sm text-base-content/60">
              Browse and book from available routes
            </p>
          </div>
        </div>

        <div className="bg-info/10 border border-info/20 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-info" />
            <span className="font-semibold text-sm text-base-content">
              {trip.length} Available
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      {trip.length > 0 ? (
        <div className="space-y-6">
          {/* Trip Grid */}
          <div className="space-y-4">
            {currentItems.map((trip) => (
              <TripCard key={trip._id} tripId={trip._id} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  // Scroll to top of list
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-base-100 border border-base-300 rounded-2xl p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-base-200/50 rounded-full mb-4">
              <TbClipboardOff className="w-12 h-12 text-base-content/40" />
            </div>
            <h3 className="text-lg font-semibold text-base-content mb-2">
              No trips found
            </h3>
            <p className="text-base-content/60 mb-6 max-w-md">
              We couldn't find any trips matching your search criteria. Try
              adjusting your filters or search terms.
            </p>

            {/* Search Tips */}
            <div className="bg-info/5 border border-info/20 rounded-xl p-4 max-w-md w-full">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-info/20 rounded-lg mt-0.5">
                  <Search className="w-4 h-4 text-info" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-sm text-base-content mb-1">
                    Search Tips
                  </h4>
                  <ul className="text-xs text-base-content/70 space-y-1">
                    <li>• Try broader location searches</li>
                    <li>• Adjust your date filters</li>
                    <li>• Remove some advanced filters</li>
                    <li>• Check back later for new trips</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripList;
