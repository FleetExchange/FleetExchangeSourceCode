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
    <>
      <div className="flex items w-full bg-base-100">
        <div className="flex flex-col gap-4 p-4 w-full">
          <h1 className="text-2xl">Edit Truck</h1>
          <hr className="border-base-200 w-full"></hr>
          <div className="mt-2">
            {/** Truck Information */}
            <h1 className="font-bold">General Information</h1>
            <div className="flex flex-row gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Registration Number</legend>
                <input
                  type="text"
                  className="input focus:outline-none focus:ring-0"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                />
              </fieldset>
            </div>
            <div className="flex flex-row gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Vehicle Make</legend>
                <input
                  type="text"
                  className="input focus:outline-none focus:ring-0"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Vehicle Model</legend>
                <input
                  type="text"
                  className="input focus:outline-none focus:ring-0"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Model Year</legend>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="input focus:outline-none focus:ring-0"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </fieldset>
            </div>
            <div>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Type Select</legend>
                <select
                  id="truckTypeSelect"
                  className="select focus:outline-none focus:ring-0"
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value as TruckType)}
                >
                  <option value="Any">Any</option>
                  {TRUCK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>
            <hr className="border-base-200 w-full mt-4 mb-4"></hr>

            <div className="flex flex-row gap-6">
              <div>
                {/** Truck Dimensions */}
                <h1 className="font-bold">Dimensions & Capacity</h1>
                <div className="flex flex-row flex-wrap gap-4">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Width</legend>
                    <input
                      type="number"
                      min="0"
                      className="input focus:outline-none focus:ring-0"
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value))}
                    />
                    <p className="label">(In Meter)</p>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Length</legend>
                    <input
                      type="number"
                      min="0"
                      className="input focus:outline-none focus:ring-0"
                      value={length}
                      onChange={(e) => setLength(parseFloat(e.target.value))}
                    />
                    <p className="label">(In Meter)</p>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Height</legend>
                    <input
                      type="number"
                      min="0"
                      className="input focus:outline-none focus:ring-0"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value))}
                    />
                    <p className="label">(In Meter)</p>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                      Payload Capacity
                    </legend>
                    <input
                      type="number"
                      min="0"
                      className="input focus:outline-none focus:ring-0"
                      value={maxLoadCapacity}
                      onChange={(e) =>
                        setMaxLoadCapacity(parseFloat(e.target.value))
                      }
                    />
                    <p className="label">(In Kg)</p>
                  </fieldset>
                </div>
              </div>
            </div>
            <hr className="border-base-200 w-full mt-4 mb-4"></hr>
            {/** Fleet Selection */}
            <div className="flex flex-row justify-between">
              <div className="flex flex-col">
                <h1 className="font-bold">Fleet Selection</h1>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Assign the vehicle to a fleet.
                  </legend>
                  <select
                    className="select focus:outline-none focus:ring-0"
                    value={fleet}
                    onChange={(e) => setFleet(e.target.value)}
                  >
                    <option value="">Select a fleet</option>
                    {/* Check if userFleets is defined and has length */}
                    {/* Use optional chaining or fallback */}
                    {(userFleets?.length ? userFleets : []).map(
                      (fleet: { _id: string; fleetName: string }) => (
                        <option key={fleet._id} value={fleet._id}>
                          {fleet.fleetName}
                        </option>
                      )
                    )}
                  </select>
                  <p className="label">Make sure you have created a fleet!</p>
                </fieldset>
              </div>

              <div className="flex mt-4 gap-4 items-end">
                <button className="btn btn-primary" onClick={handleEdit}>
                  Edit
                </button>
                <button className="btn btn-primary" onClick={handleDelete}>
                  Delete
                </button>
                <Link href="/fleetManager">
                  <button className="btn btn-soft bg-base-200 outline-none">
                    Close
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTruckCard;
