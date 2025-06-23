"use client";

import MyBookingsWidget from "@/components/MyBookingsWidget";
import TransporterStatsWidget from "@/components/TransporterStatsWidget";
import TripsInProgressWidget from "@/components/TripsInProgressWidget";
import TripToApproveWidget from "@/components/TripToApproveWidget";

const TransporterDashPage = () => {
  return (
    <div className="min-h-screen pl-24 p-6 bg-base-200">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            Transporter Dashboard
          </h1>
          <p className="text-base-content/60 mt-2">
            Manage your trips and track your business performance
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trips to Approve */}
          <TripToApproveWidget />

          {/* Trips in Progress - Takes 2 columns on large screens */}
          <TripsInProgressWidget />

          {/* My Bookings - Full width on mobile, spans remaining space */}
          <MyBookingsWidget />
        </div>

        {/* Stats Section */}
        <TransporterStatsWidget />
      </div>
    </div>
  );
};

export default TransporterDashPage;
