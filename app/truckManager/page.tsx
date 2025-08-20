"use client";

import EditTruckCard from "@/components/EditTruckCard";
import NewTruckCard from "@/components/NewTruckCard";
import { useSearchParams } from "next/navigation";
import { Truck, Edit, Plus } from "lucide-react";

const Page = () => {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const truckId = searchParams.get("truckId");

  // Handle case where no action is provided
  if (!action) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="p-4 lg:p-6">
          <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8 pl-16 lg:pl-0">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                    Truck Manager
                  </h1>
                  <p className="text-base-content/60 mt-2">
                    Manage your fleet vehicles
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-base-300 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-base-content">
                      Invalid Action
                    </h2>
                    <p className="text-sm text-base-content/60">
                      Please specify a valid action (create or edit)
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 text-center">
                <p className="text-base-content/60 mb-4">
                  No valid action specified. Please navigate back to the fleet
                  manager.
                </p>
                <a href="/fleetManager" className="btn btn-primary gap-2">
                  <Truck className="w-4 h-4" />
                  Back to Fleet Manager
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {action === "create" && <NewTruckCard />}
      {action === "edit" && truckId && <EditTruckCard truckId={truckId} />}

      {/* Handle case where edit action is specified but no truckId */}
      {action === "edit" && !truckId && (
        <div className="p-4 lg:p-6">
          <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8 pl-16 lg:pl-0">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                    Edit Vehicle
                  </h1>
                  <p className="text-base-content/60 mt-2">
                    Vehicle information required
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
              <div className="bg-gradient-to-r from-error/10 to-error/5 border-b border-base-300 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-error/10 rounded-lg border border-error/20">
                    <Edit className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-base-content">
                      Missing Vehicle ID
                    </h2>
                    <p className="text-sm text-base-content/60">
                      No vehicle specified for editing
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 text-center">
                <p className="text-base-content/60 mb-4">
                  Please select a vehicle from the fleet manager to edit.
                </p>
                <a href="/fleetManager" className="btn btn-primary gap-2">
                  <Truck className="w-4 h-4" />
                  Back to Fleet Manager
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
