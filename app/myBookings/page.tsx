"use client";

import MyBookingsTable from "@/components/MyBookingsTable";

const page = () => {
  return (
    <div className="min-h-screen pl-24 pr-6 py-6 bg-base-200">
      <div className="w-full max-w-none">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">My Bookings</h1>
          <p className="text-base-content/60 mt-2">
            View and manage your trip bookings
          </p>
        </div>

        {/* Bookings Table */}
        <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <MyBookingsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
