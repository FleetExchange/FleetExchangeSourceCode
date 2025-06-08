"use client";

import FilterBtn from "@/components/FilterBtn";
import SearchBar from "@/components/SearchBar";
import TripList from "@/components/TripList";
import { useState } from "react";

// app/discover/page.tsx
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
    depTime: string;
    arrDate: string;
    arrTime: string;
    truckType: string;
    width: string;
    length: string;
    height: string;
    payload: string;
  }>({
    depDate: "",
    depTime: "",
    arrDate: "",
    arrTime: "",
    truckType: "",
    width: "",
    length: "",
    height: "",
    payload: "",
  });

  const [sortBy, setSortBy] = useState<"price" | "departureDate">(
    "departureDate"
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section with Search */}
      <div className="bg-base-200 rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Find Available Trips
        </h1>
        <div className="max-w-4xl mx-auto">
          <SearchBar
            onSearch={(searchTerm) => {
              setSearchTerm(searchTerm);
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full md:w-72 lg:w-80">
          <div className="bg-base-200 rounded-xl shadow-md p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Sort & Filter</h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setFilterTerm({
                    depDate: "",
                    depTime: "",
                    arrDate: "",
                    arrTime: "",
                    truckType: "",
                    width: "",
                    length: "",
                    height: "",
                    payload: "",
                  });
                  setSortBy("departureDate");
                }}
              >
                Clear All
              </button>
            </div>

            {/* Sort Options */}
            <div className="space-y-4 mb-8">
              <h3 className="font-medium text-base-content/70 text-sm uppercase tracking-wide">
                Sort Options
              </h3>
              <div className="form-control">
                <select
                  className="select select-bordered w-full bg-base-100"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "price" | "departureDate")
                  }
                >
                  <option value="departureDate">Departure Date</option>
                  <option value="price">Price</option>
                </select>
              </div>
            </div>

            {/* Filter Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-base-content/70 text-sm uppercase tracking-wide">
                Filters
              </h3>
              <div className="bg-base-100 rounded-lg p-4">
                <FilterBtn
                  onFilter={(filterTerm) => {
                    setFilterTerm(filterTerm);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trip List */}
        <div className="flex-1">
          <div className="bg-base-100 rounded-lg shadow">
            <TripList
              searchTerm={searchTerm}
              filterTerm={filterTerm}
              sortBy={sortBy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
