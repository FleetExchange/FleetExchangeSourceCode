import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TRUCK_TYPES, TruckType } from "@/shared/truckTypes";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Truck,
  Calendar,
  Ruler,
  Weight,
  Package,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface EditTruckCardProps {
  truckId: string;
}

const EditTruckCard: React.FC<EditTruckCardProps> = ({ truckId }) => {
  // Get the truck to edit
  const truckForEdit = useQuery(api.truck.getTruckById, {
    truckId: truckId as Id<"truck">,
  });

  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const userId = user?.id ?? "";
  // Get all fleets that belong to user
  const userFleets = useQuery(api.fleet.getFleetForCurrentUser, {
    userId: userId,
  });

  // Check in which fleet the truck is currently in
  // (This will be calculated in useEffect and used for display)

  const [registration, setRegistration] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [truckType, setTruckType] = useState<TruckType | "">("");
  const [maxLoadCapacity, setMaxLoadCapacity] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [fleet, setFleet] = useState("");

  // Populate state when truckForEdit is loaded
  useEffect(() => {
    if (truckForEdit && userFleets) {
      // Calculate currentFleet inside useEffect to avoid dependency issues
      const currentFleet = userFleets.find((fleet) =>
        fleet.trucks.includes(truckForEdit._id as Id<"truck">)
      );

      setRegistration(truckForEdit.registration || "");
      setMake(truckForEdit.make || "");
      setModel(truckForEdit.model || "");
      setYear(truckForEdit.year || "");
      setTruckType(truckForEdit.truckType || "");
      setMaxLoadCapacity(truckForEdit.maxLoadCapacity || 0);
      setWidth(truckForEdit.width || 0);
      setLength(truckForEdit.length || 0);
      setHeight(truckForEdit.height || 0);
      setFleet(currentFleet?._id || ""); // Set fleet to current fleet or empty if not in a fleet
    }
  }, [truckForEdit, userFleets]); // Only depend on the data from queries

  // Calculate currentFleet outside useEffect for display purposes
  const currentFleet = userFleets?.find((fleet) =>
    fleet.trucks.includes(truckForEdit?._id as Id<"truck">)
  );

  // Combine all truck IDs from all fleets
  const allTruckIds = userFleets?.flatMap((fleet) => fleet.trucks) || [];
  // Fetch all trucks in a single query
  const allTrucks = useQuery(api.truck.getTruckByIdArray, {
    truckIds: allTruckIds,
  });

  const deleteTruck = useMutation(api.truck.deleteTruck);
  const deleteTruckFromFleet = useMutation(api.fleet.removeTruckFromFleet);
  const linkedTrips = useQuery(api.trip.getTripsByTruckId, {
    truckId: truckId as Id<"truck">,
  });

  const handleDelete = async () => {
    if (linkedTrips && linkedTrips.length > 0) {
      alert(
        "This truck cannot be deleted because it has trips that are either:\n" +
          "- Currently in progress\n" +
          "- Scheduled for the future\n\n" +
          "Please wait for trips to complete and delete or reassign any future trips before deleting this truck."
      );
      return;
    }

    try {
      const deletedTruckId = await deleteTruck({
        truckId: truckId as Id<"truck">,
      });

      // Remove from Fleet
      const fleetId = userFleets?.find((fleet) =>
        fleet.trucks.includes(truckId as Id<"truck">)
      )?._id;

      if (fleetId) {
        await deleteTruckFromFleet({
          fleetId: fleetId as Id<"fleet">,
          truckId: truckId as Id<"truck">,
        });
      }

      if (deletedTruckId) {
        alert("Truck successfully deleted.");
        // Redirect to fleet manager page
        window.location.href = "/fleetManager";
      }
    } catch (error) {
      console.error("Failed to delete truck:", error);
      alert("Failed to delete truck. Please try again.");
    }
  };

  const editTruck = useMutation(api.truck.editTruck); // ✅ Hook at top level
  const changeTruckFleet = useMutation(api.fleet.changeTruckFleet);
  const handleEdit = async () => {
    // Ensure all values are set to a valid state
    if (
      !registration ||
      !make ||
      !model ||
      !year ||
      !truckType ||
      (!maxLoadCapacity && maxLoadCapacity != 0) ||
      (!width && width != 0) ||
      (!length && length != 0) ||
      (!height && height != 0) ||
      !fleet
    ) {
      alert("Please fill all fields & make sure dimensions are valid");
      return;
    }

    // Check Registration Number
    // Check if the registration already exists
    const registrationExists = allTrucks?.some(
      (truck) =>
        truck._id !== truckForEdit?._id &&
        truck.registration.toLowerCase() === registration.trim().toLowerCase()
    );

    if (registrationExists) {
      alert("A truck with this registration already exists in your fleets.");
      return;
    }

    // Edit Truck
    try {
      const editedTruckId = await editTruck({
        truckId: truckForEdit?._id as Id<"truck">,
        registration: registration.trim(),
        make: make.trim(),
        model: model.trim(),
        year: year.trim(),
        truckType: truckType,
        maxLoadCapacity: maxLoadCapacity,
        width: width,
        length: length,
        height: height,
      });

      // Add to Fleet
      await changeTruckFleet({
        fleetId: fleet as Id<"fleet">,
        truckId: editedTruckId as Id<"truck">,
        userFleet: userFleets?.map((fleet) => fleet._id) || [],
      });

      alert("Truck Edited.");
    } catch (err) {
      console.error("Failed to edit truck:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  // Loading state
  if (!truckForEdit) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/60">Loading truck information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 pl-16 lg:pl-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                  Edit Vehicle
                </h1>
                <p className="text-base-content/60 mt-2">
                  Update vehicle information for {truckForEdit.registration}
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-base-300 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Edit className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-base-content">
                    Vehicle Information
                  </h2>
                  <p className="text-sm text-base-content/60">
                    Modify your vehicle details and fleet assignment
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* General Information Section */}
              <div className="bg-base-200/50 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-base-content">
                    General Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full focus:outline-none focus:border-primary"
                      placeholder="e.g., ABC123GP"
                      value={registration}
                      onChange={(e) => setRegistration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content">
                      Vehicle Make
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full focus:outline-none focus:border-primary"
                      placeholder="e.g., Mercedes"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full focus:outline-none focus:border-primary"
                      placeholder="e.g., Actros"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Model Year
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="input input-bordered w-full focus:outline-none focus:border-primary"
                      placeholder="e.g., 2020"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content">
                      Truck Type
                    </label>
                    <select
                      className="select select-bordered w-full focus:outline-none focus:border-primary"
                      value={truckType}
                      onChange={(e) =>
                        setTruckType(e.target.value as TruckType)
                      }
                    >
                      <option value="">Select truck type</option>
                      {TRUCK_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dimensions & Capacity Section */}
              <div className="bg-base-200/50 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Ruler className="w-4 h-4 text-primary" />
                    <Weight className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base-content">
                    Dimensions & Capacity
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content">
                      Width (meters)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="input input-bordered w-full focus:outline-none focus:border-primary"
                      placeholder="e.g., 2.5"
                      value={width || ""}
                      onChange={(e) =>
                        setWidth(
                          e.target.value === "" ? 0 : parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content">
                      Length (meters)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="input input-bordered w-full focus:outline-none focus:border-primary"
                      placeholder="e.g., 12.0"
                      value={length || ""}
                      onChange={(e) =>
                        setLength(
                          e.target.value === "" ? 0 : parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content">
                      Height (meters)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="input input-bordered w-full focus:outline-none focus:border-primary"
                      placeholder="e.g., 4.0"
                      value={height || ""}
                      onChange={(e) =>
                        setHeight(
                          e.target.value === "" ? 0 : parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content">
                      Payload Capacity (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="input input-bordered w-full focus:outline-none focus:border-primary"
                      placeholder="e.g., 10000"
                      value={maxLoadCapacity || ""}
                      onChange={(e) =>
                        setMaxLoadCapacity(
                          e.target.value === "" ? 0 : parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Fleet Assignment Section */}
              <div className="bg-base-200/50 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-base-content">
                    Fleet Assignment
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-base-content">
                    Assign to Fleet
                  </label>
                  <select
                    className="select select-bordered w-full focus:outline-none focus:border-primary"
                    value={fleet}
                    onChange={(e) => setFleet(e.target.value)}
                  >
                    <option value="">Select a fleet</option>
                    {(userFleets?.length ? userFleets : []).map(
                      (fleet: { _id: string; fleetName: string }) => (
                        <option key={fleet._id} value={fleet._id}>
                          {fleet.fleetName}
                        </option>
                      )
                    )}
                  </select>
                  <p className="text-xs text-base-content/60">
                    Currently assigned to:{" "}
                    {currentFleet?.fleetName || "No fleet"}
                  </p>
                </div>
              </div>

              {/* Warning for active trips */}
              {linkedTrips && linkedTrips.length > 0 && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning">
                        Active trips detected
                      </p>
                      <p className="text-xs text-warning/80 mt-1">
                        This vehicle has {linkedTrips.length} active trip(s).
                        Complete all trips before deleting this vehicle.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between gap-3 pt-4 border-t border-base-300">
                <button className="btn btn-error gap-2" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4" />
                  Delete Vehicle
                </button>

                <div className="flex gap-3">
                  <button
                    className="btn btn-primary gap-2"
                    onClick={handleEdit}
                  >
                    <Edit className="w-4 h-4" />
                    Save Changes
                  </button>
                  <Link href="/fleetManager">
                    <button className="btn btn-outline gap-2">
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section - Make it more subtle */}
          <div className="bg-info/10 border border-info/20 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-info/10 rounded border border-info/20">
                <AlertTriangle className="w-4 h-4 text-info" />
              </div>
              <div>
                <h4 className="font-medium text-info mb-1">Important Notes</h4>
                <ul className="text-sm text-info/80 space-y-1">
                  <li>
                    • Changes to vehicle specifications may affect trip
                    compatibility
                  </li>
                  <li>
                    • Moving vehicles between fleets will update all related
                    records
                  </li>
                  <li>• Vehicles with active trips cannot be deleted</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTruckCard;
