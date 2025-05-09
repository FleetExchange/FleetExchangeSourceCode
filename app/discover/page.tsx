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

  return (
    <>
      <div className="relative top-20 flex justify-center w-full px-4">
        {/* Search Bar - Centered */}
        <div className="w-full max-w-4xl">
          <SearchBar
            onSearch={(searchTerm) => {
              setSearchTerm(searchTerm);
            }}
          />
        </div>
      </div>

      {/* Filter Button - Positioned below with some space */}
      <div className="flex justify-center mt-19">
        <div className="ml-4">
          <FilterBtn
            onFilter={(filterTerm) => {
              setFilterTerm(filterTerm);
            }}
          />
        </div>
      </div>

      <hr className="border-t border-base-200 my-0" />

      <TripList searchTerm={searchTerm} filterTerm={filterTerm}></TripList>
    </>
  );
}
