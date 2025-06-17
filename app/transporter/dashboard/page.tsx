"use client";

import TripToApproveWidget from "@/components/TripToApproveWidget";

const TransporterDashPage = () => {
  return (
    <div className="min-h-screen p-6 bg-base-200">
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
          <div className="bg-base-100 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-warning">
              Trips to Approve
            </h2>
            <div className="text-center text-base-content/60">
              <TripToApproveWidget />
            </div>
          </div>

          {/* Trips in Progress - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 bg-base-100 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-info">
              Trips in Progress
            </h2>
            <div className="text-center text-base-content/60">
              No active trips
            </div>
          </div>

          {/* My Bookings - Full width on mobile, spans remaining space */}
          <div className="lg:col-span-3 bg-base-100 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-success">
              My Bookings
            </h2>
            <div className="text-center text-base-content/60">
              No bookings yet
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Total Trips</div>
              <div className="stat-value text-primary">0</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Revenue</div>
              <div className="stat-value text-success">R0</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Active Routes</div>
              <div className="stat-value text-info">0</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Rating</div>
              <div className="stat-value text-warning">5.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterDashPage;
