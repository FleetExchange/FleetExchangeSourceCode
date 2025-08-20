"use client";

import MyBookingsCardList from "@/components/MyBookingsCardList";
import MyBookingsTable from "@/components/MyBookingsTable";
import { Package } from "lucide-react";

const page = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 pl-16 lg:pl-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                  My Bookings
                </h1>
                <p className="text-base-content/60 mt-2">
                  View and manage your trip bookings
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden">
            <MyBookingsCardList />
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
              <div className="bg-gradient-to-r from-info/10 to-info/5 border-b border-base-300 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-info/10 rounded-lg border border-info/20">
                    <Package className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-base-content">
                      Your Bookings
                    </h2>
                    <p className="text-sm text-base-content/60">
                      All your trip bookings and their current status
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-base-100">
                <MyBookingsTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
