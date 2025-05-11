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
    <>
      <div className="flex flex-col space-y-8 mt-20">
        <div className="relative flex justify-center w-full px-4">
          {/* Search Bar - Centered */}
          <div className="w-full max-w-4xl">
            <SearchBar
              onSearch={(searchTerm) => {
                setSearchTerm(searchTerm);
              }}
            />
          </div>
        </div>

        <hr className="border-t border-base-200" />

        <div className="mx-start flex flex-row gap-4 p-8 ">
          <div className="flex w-1/6 flex-col p-4 border-1 border-base-300">
            <fieldset className="fieldset">
              <select
                className="select focus:outline-none focus:ring-0"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "price" | "departureDate")
                }
              >
                <option value="departureDare">Sort By Date</option>
                <option value="price">Sort By Price</option>
              </select>
            </fieldset>
            <FilterBtn
              onFilter={(filterTerm) => {
                setFilterTerm(filterTerm);
              }}
            />
          </div>

          <div className="flex w-3/4 flex-col p-4">
            <TripList
              searchTerm={searchTerm}
              filterTerm={filterTerm}
              sortBy={sortBy}
            ></TripList>
          </div>
        </div>
      </div>
    </>
  );
}
