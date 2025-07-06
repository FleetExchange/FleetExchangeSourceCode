import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TRUCK_TYPES, TruckType } from "@/shared/truckTypes";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

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
  const currentFleet = userFleets?.find((fleet) =>
    fleet.trucks.includes(truckForEdit?._id as Id<"truck">)
  );

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
    if (truckForEdit) {
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
  }, [truckForEdit]); // Runs whenever truckForEdit changes

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

  return (
    <div className="flex justify-center items-start min-h-screen bg-base-200 py-10">
      <div className="w-full max-w-3xl bg-base-100 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Edit Truck</h1>
        <p className="text-base-content/70 mb-6">
          Update your truck details below.
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
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium mb-1">Vehicle Make</legend>
            <input
              type="text"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              value={make}
              onChange={(e) => setMake(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium mb-1">Vehicle Model</legend>
            <input
              type="text"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
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
            <option value="">Select a fleet</option>
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
          <button className="btn btn-primary" onClick={handleEdit}>
            Save Changes
          </button>
          <button className="btn btn-error" onClick={handleDelete}>
            Delete
          </button>
          <Link href="/fleetManager">
            <button className="btn btn-ghost bg-base-200 outline-none">
              Cancel
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EditTruckCard;
