import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { newTruck } from "@/convex/truck";
import { TRUCK_TYPES, TruckType } from "@/shared/truckTypes";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
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
    <>
      <div className="flex items w-full bg-base-100">
        <div className="flex flex-col gap-4 p-4 w-full">
          <h1 className="text-2xl">Create Truck</h1>
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
                  placeholder="Type here"
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
                  placeholder="Type here"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Vehicle Model</legend>
                <input
                  type="text"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Model Year</legend>
                <input
                  type="number"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
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
                      className="input focus:outline-none focus:ring-0"
                      placeholder="Type here"
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value))}
                    />
                    <p className="label">(In Meter)</p>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Length</legend>
                    <input
                      type="number"
                      className="input focus:outline-none focus:ring-0"
                      placeholder="Type here"
                      value={length}
                      onChange={(e) => setLength(parseFloat(e.target.value))}
                    />
                    <p className="label">(In Meter)</p>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Height</legend>
                    <input
                      type="number"
                      className="input focus:outline-none focus:ring-0"
                      placeholder="Type here"
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
                      className="input focus:outline-none focus:ring-0"
                      placeholder="Type here"
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
                    defaultValue={fleet}
                    onChange={(e) => setFleet(e.target.value)}
                  >
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
                <button className="btn btn-primary" onClick={handleCreate}>
                  Create
                </button>
                <button className="btn btn-base-200">Discard</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewTruckCard;
