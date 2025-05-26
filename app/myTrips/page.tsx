"use client";

import MyBookedTripsTable from "@/components/MyBookedTripsTable";
import MyUnbookedTripsTable from "@/components/MyUnbookedTripsTable";

const page = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <MyUnbookedTripsTable />
    </div>
  );
};

export default page;
