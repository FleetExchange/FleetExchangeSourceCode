"use client";

import MyBookedTripsTable from "@/components/MyBookedTripsTable";
import MyUnbookedTripsTable from "@/components/MyUnbookedTripsTable";
import Link from "next/link";

const page = () => {
  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-end">
        <Link
          href={{
            pathname: "/createTrip",
          }}
        >
          <button className="pointer-events-auto btn btn-primary">
            Create Trip
          </button>
        </Link>
      </div>

      <MyBookedTripsTable />
      <MyUnbookedTripsTable />
    </div>
  );
};

export default page;
