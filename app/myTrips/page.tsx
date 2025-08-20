"use client";

import MyBookedTripsTable from "@/components/MyBookedTripsTable";
import MyTripsCardList from "@/components/MyTripsCardList";
import MyUnbookedTripsTable from "@/components/MyUnbookedTripsTable";
import Link from "next/link";
import { Plus, Truck, Calendar } from "lucide-react";

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
                  My Trips
                </h1>
                <p className="text-base-content/60 mt-2">
                  View, manage, and create your transportation services
                </p>
              </div>
              <Link href="/createTrip">
                <button className="btn btn-primary gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Trip</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden">
            <MyTripsCardList />
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block space-y-8">
            {/* Booked Trips Section */}
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
              <div className="bg-gradient-to-r from-success/10 to-success/5 border-b border-base-300 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                    <Calendar className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-base-content">
                      Active Trips
                    </h2>
                    <p className="text-sm text-base-content/60">
                      Trips that have been booked by customers
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-base-100">
                <MyBookedTripsTable />
              </div>
            </div>

            {/* Unbooked Trips Section */}
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
              <div className="bg-gradient-to-r from-warning/10 to-warning/5 border-b border-base-300 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg border border-warning/20">
                    <Truck className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-base-content">
                      Available Trips
                    </h2>
                    <p className="text-sm text-base-content/60">
                      Trips waiting for customers to book
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-base-100">
                <MyUnbookedTripsTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
