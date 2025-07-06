import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { newTruck } from "@/convex/truck";
import { TRUCK_TYPES, TruckType } from "@/shared/truckTypes";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import React, { useState } from "react";

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
  const createTruck = useMutation(api.truck.newTruck); // ✅ Hook at top level
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

    // Check Registration Number

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
    <div className="flex justify-center items-start min-h-screen bg-base-200 py-10">
      <div className="w-full max-w-3xl bg-base-100 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Create Truck</h1>
        <p className="text-base-content/70 mb-6">
          Enter your new truck details below.
        </p>
        <div className="divider my-4" />

        {/* General Information */}
        <h2 className="font-semibold text-lg mb-2">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <fieldset>
            <legend className="text-sm font-medium mb-1">
              Registration Number
            </legend>
            <input
              type="text"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              placeholder="Type here"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium mb-1">Vehicle Make</legend>
            <input
              type="text"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              placeholder="Type here"
              value={make}
              onChange={(e) => setMake(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium mb-1">Vehicle Model</legend>
            <input
              type="text"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              placeholder="Type here"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </fieldset>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <fieldset>
            <legend className="text-sm font-medium mb-1">Model Year</legend>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              placeholder="Type here"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium mb-1">Type Select</legend>
            <select
              id="truckTypeSelect"
              className="select select-bordered w-full focus:outline-none focus:ring-0"
              value={truckType}
              onChange={(e) => setTruckType(e.target.value as TruckType)}
            >
              <option value="">Select type</option>
              {TRUCK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </fieldset>
        </div>

        <div className="divider my-6" />

        {/* Dimensions & Capacity */}
        <h2 className="font-semibold text-lg mb-2">Dimensions & Capacity</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <fieldset>
            <legend className="text-sm font-medium mb-1">Width (m)</legend>
            <input
              type="number"
              min="0"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              placeholder="Type here"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))}
            />
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium mb-1">Length (m)</legend>
            <input
              type="number"
              min="0"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              placeholder="Type here"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
            />
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium mb-1">Height (m)</legend>
            <input
              type="number"
              min="0"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              placeholder="Type here"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
            />
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium mb-1">
              Payload Capacity (kg)
            </legend>
            <input
              type="number"
              min="0"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              placeholder="Type here"
              value={maxLoadCapacity}
              onChange={(e) => setMaxLoadCapacity(parseFloat(e.target.value))}
            />
          </fieldset>
        </div>

        <div className="divider my-6" />

        {/* Fleet Selection */}
        <h2 className="font-semibold text-lg mb-2">Fleet Selection</h2>
        <fieldset className="mb-4">
          <legend className="text-sm font-medium mb-1">
            Assign the vehicle to a fleet.
          </legend>
          <select
            className="select select-bordered w-full focus:outline-none focus:ring-0"
            value={fleet}
            onChange={(e) => setFleet(e.target.value)}
          >
            <option value="">Select a Fleet</option>
            {(userFleets?.length ? userFleets : []).map(
              (fleet: { _id: string; fleetName: string }) => (
                <option key={fleet._id} value={fleet._id}>
                  {fleet.fleetName}
                </option>
              )
            )}
          </select>
          <p className="label text-xs mt-1 text-base-content/60">
            Make sure you have created a fleet!
          </p>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex flex-row justify-end gap-4 mt-8">
          <button className="btn btn-primary" onClick={handleCreate}>
            Create
          </button>
          <Link href="/fleetManager">
            <button className="btn btn-ghost bg-base-200 outline-none">
              Close
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewTruckCard;
