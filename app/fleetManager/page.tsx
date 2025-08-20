"use client";

import FleetManagerTable from "@/components/FleetManagerTable";
import { Truck } from "lucide-react";

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
                  Fleet Manager
                </h1>
                <p className="text-base-content/60 mt-2">
                  Manage your fleet vehicles and track their status
                </p>
              </div>
            </div>
          </div>

          {/* Fleet Manager Content */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-base-300 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-base-content">
                    Fleet Overview
                  </h2>
                  <p className="text-sm text-base-content/60">
                    Monitor and manage all your vehicles in one place
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <FleetManagerTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
