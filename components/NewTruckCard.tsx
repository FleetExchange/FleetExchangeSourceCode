"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { newTruck } from "@/convex/truck";
import { TRUCK_TYPES, TruckType } from "@/shared/truckTypes";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import React, { useState } from "react";
import {
  Truck,
  Calendar,
  Ruler,
  Weight,
  Package,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const NewTruckCard = () => {
  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const userId = user?.id ?? "";
  // Get all fleets that belong to user
  const userFleets = useQuery(api.fleet.getFleetForCurrentUser, {
    userId: userId,
  });

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

  // Combine all truck IDs from all fleets
  const allTruckIds = userFleets?.flatMap((fleet) => fleet.trucks) || [];
  // Fetch all trucks in a single query
  const allTrucks = useQuery(api.truck.getTruckByIdArray, {
    truckIds: allTruckIds,
  });

  const createTruck = useMutation(api.truck.newTruck);
  const addTruckToFleet = useMutation(api.fleet.addTruckToFleet);

  const handleCreate = async () => {
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

    // Check if the registration already exists
    const registrationExists = allTrucks?.some(
      (truck) =>
        truck.registration.toLowerCase() === registration.trim().toLowerCase()
    );

    if (registrationExists) {
      alert("A truck with this registration already exists in your fleets.");
      return;
    }

    // Create Truck
    try {
      const newTruckId = await createTruck({
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
      await addTruckToFleet({
        fleetId: fleet as Id<"fleet">,
        truckId: newTruckId,
      });

      alert("Truck Created.");
    } catch (err) {
      console.error("Failed to create truck:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 pl-16 lg:pl-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                  Create New Truck
                </h1>
                <p className="text-base-content/60 mt-2">
                  Add a new vehicle to your fleet
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
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-base-content">
                    Vehicle Information
                  </h2>
                  <p className="text-sm text-base-content/60">
                    Enter all required details for your new truck
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
                    Make sure you have created a fleet before adding vehicles
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
                <button
                  className="btn btn-primary gap-2"
                  onClick={handleCreate}
                >
                  <Plus className="w-4 h-4" />
                  Create Truck
                </button>
                <Link href="/fleetManager">
                  <button className="btn btn-outline gap-2">
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-info/5 border border-info/20 rounded-xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-info/10 rounded border border-info/20">
                <Truck className="w-4 h-4 text-info" />
              </div>
              <div>
                <h4 className="font-medium text-base-content mb-1">
                  Vehicle Registration Tips
                </h4>
                <p className="text-sm text-base-content/60">
                  Ensure all vehicle information is accurate and matches your
                  official documentation. This information will be used for trip
                  matching and compliance verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTruckCard;
