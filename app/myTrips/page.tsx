"use client";

import MyBookedTripsTable from "@/components/MyBookedTripsTable";
import MyUnbookedTripsTable from "@/components/MyUnbookedTripsTable";
import Link from "next/link";

const page = () => {
  return (
    <div className="flex flex-col p-4">
      <Link
        href={{
          pathname: "/createTrip",
        }}
      >
        <button className="pointer-events-auto btn btn-primary">
          Create Trip
        </button>
      </Link>
      <MyBookedTripsTable />
      <MyUnbookedTripsTable />
    </div>
  );
};

export default page;
