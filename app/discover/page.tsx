"use client";

import FilterBtn from "@/components/FilterBtn";
import SearchBar from "@/components/SearchBar";
import TripList from "@/components/TripList";
import { useState } from "react";
import { Search, Filter, MapPin, Calendar } from "lucide-react";

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState<{
    from: string;
    to: string;
    arrival: string;
  }>({
    from: "",
    to: "",
    arrival: "",
  });

  const [filterTerm, setFilterTerm] = useState<{
    depDate: string;

    arrDate: string;

    truckType: string;
    width: string;
    length: string;
    height: string;
    payload: string;
  }>({
    depDate: "",

    arrDate: "",

    truckType: "",
    width: "",
    length: "",
    height: "",
    payload: "",
  });

  const [sortBy, setSortBy] = useState<"price" | "departureDate">(
    "departureDate"
  );

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 pl-16 lg:p-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
              Discover Trips
            </h1>
            <p className="text-base-content/60 mt-2">
              Find and book transportation for your cargo
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-8">
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-4 lg:p-6">
              <SearchBar
                onSearch={(searchTerm) => {
                  setSearchTerm(searchTerm);
                }}
              />
            </div>
          </div>

          {/* Styled Divider */}
          <div className="mb-12 flex items-center">
            <div className="flex-1 border-t border-base-300"></div>
            <div className="px-4 text-base-content/40 text-sm font-medium">
              Browse Results
            </div>
            <div className="flex-1 border-t border-base-300"></div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-primary btn-outline w-full gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {/* Filters Sidebar */}
            <div
              className={`w-full lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 lg:sticky lg:top-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-info/10 rounded-lg border border-info/20">
                      <Filter className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-base-content">
                        Sort & Filter
                      </h3>
                      <p className="text-sm text-base-content/60">
                        Refine your search
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Sort Section */}
                  <div className="border-b border-base-300 pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-secondary" />
                      <h4 className="font-semibold text-base-content">
                        Sort By
                      </h4>
                    </div>
                    <select
                      className="select select-bordered w-full bg-base-100 border-base-300 focus:border-primary focus:outline-none"
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as "price" | "departureDate")
                      }
                    >
                      <option value="departureDate">
                        Sort by Departure Date
                      </option>
                      <option value="price">Sort by Base Price</option>
                    </select>
                  </div>

                  {/* Filters Section */}
                  <div className="border-b border-base-300 pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-warning" />
                      <h4 className="font-semibold text-base-content">
                        Advanced Filters
                      </h4>
                    </div>
                    <FilterBtn
                      onFilter={(filterTerm) => {
                        setFilterTerm(filterTerm);
                      }}
                    />
                  </div>

                  {/* Search Tips */}
                  <div>
                    <div className="bg-info/5 border border-info/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-info/20 rounded-lg mt-0.5">
                          <Search className="w-4 h-4 text-info" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm text-base-content mb-1">
                            Pro Tips
                          </h5>
                          <ul className="text-xs text-base-content/70 space-y-1">
                            <li>
                              • Use date filters for time-sensitive shipments
                            </li>
                            <li>
                              • Filter by truck type for specific cargo needs
                            </li>
                            <li>• Sort by price to find the best deals</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip List */}
            <div className="flex-1 min-w-0">
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
                <TripList
                  searchTerm={searchTerm}
                  filterTerm={filterTerm}
                  sortBy={sortBy}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
