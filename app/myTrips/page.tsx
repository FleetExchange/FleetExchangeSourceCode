"use client";

import MyBookedTripsTable from "@/components/MyBookedTripsTable";
import MyTripsCardList from "@/components/MyTripsCardList";
import MyUnbookedTripsTable from "@/components/MyUnbookedTripsTable";
import Link from "next/link";

const page = () => {
  return (
    <div className="min-h-screen pl-24 pr-6 py-6 bg-base-200">
      <div className="w-full max-w-none">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">My Trips</h1>
            <p className="text-base-content/60 mt-2">
              View, manage, and create your trips
            </p>
          </div>
          <Link
            href={{
              pathname: "/createTrip",
            }}
          >
            <button className="btn btn-primary">Create Trip</button>
          </Link>
        </div>
        <div className="block md:hidden">
          {/*  mobile component */}
          <MyTripsCardList />
        </div>

        <div className="hidden md:block">
          {/* Booked Trips Table */}
          <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="">
              <MyBookedTripsTable />
            </div>
          </div>

          {/* Unbooked Trips Table */}
          <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
            <div className="">
              <MyUnbookedTripsTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
