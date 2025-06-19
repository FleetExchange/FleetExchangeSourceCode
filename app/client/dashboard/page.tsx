"use client";

import MyBookingsWidget from "@/components/MyBookingsWidget";

const ClientDashPage = () => {
  return (
    <div className="min-h-screen p-6 bg-base-200">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            Client Dashboard
          </h1>
          <p className="text-base-content/60 mt-2">
            Manage your trips and track your shipments
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* My Bookings - Full width on mobile, spans remaining space */}
          <MyBookingsWidget />
        </div>
      </div>
    </div>
  );
};

export default ClientDashPage;
