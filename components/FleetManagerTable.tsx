"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import FleetManagerTableFilter from "./FleetManagerTableFilter";

type SortOption = "registration" | "payload" | "length" | "width" | "height";

const FleetManagerTable = () => {
  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const userId = user?.id ?? "";

  // Get all fleets that belong to user
  const userFleets = useQuery(api.fleet.getFleetForCurrentUser, {
    userId: userId,
  });
  // Set the current selected fleet from selector
  const [userFleet, setUserFleet] = useState<string | undefined>(undefined);

  // Handle when the selected fleet changes
  const handleFleetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserFleet(event.target.value);
  };
  useEffect(() => {
    if (userFleets && userFleets.length > 0) {
      setUserFleet(userFleets[0]._id);
    }
  }, [userFleets]);

  // Stores which sorting is choses
  const [sortBy, setSortBy] = useState<
    "registration" | "payload" | "length" | "width" | "height"
  >("registration");

  // Stores the terms to filter by
  const [filterTerm, setFilterTerm] = useState<{
    make: string;
    year: string;
    truckType: string;
    width: number;
    length: number;
    height: number;
    payload: number;
  }>({
    make: "",
    year: "",
    truckType: "",
    width: 0,
    length: 0,
    height: 0,
    payload: 0,
  });

  // Queries to fetch all the truck ID's belonging to selected user fleets
  const trucksInFleet = useQuery(
    api.fleet.getTrucksForFleet,
    userFleet ? { fleetId: userFleet as Id<"fleet"> } : "skip"
  );

  // Get all trucks by ID
  const getTrucks = useQuery(
    api.truck.getTruckByIdArray,
    trucksInFleet ? { truckIds: trucksInFleet } : "skip"
  );
  let trucks = [...(getTrucks ?? [])]; // Safe copy, never undefined

  // Filtering the trucks
  const filteredTrucks = trucks.filter((truck) => {
    return (
      (!filterTerm.make || truck.make === filterTerm.make) &&
      (!filterTerm.year || truck.year === filterTerm.year) &&
      (!filterTerm.truckType || truck.truckType === filterTerm.truckType) &&
      (filterTerm.width == 0 || truck.width === filterTerm.width) &&
      (filterTerm.length == 0 || truck.length === filterTerm.length) &&
      (filterTerm.height == 0 || truck.height === filterTerm.height) &&
      (filterTerm.payload == 0 || truck.maxLoadCapacity === filterTerm.payload)
    );
  });

  // Sorting methods
  if (sortBy === "registration") {
    filteredTrucks.sort((a, b) =>
      a.registration.localeCompare(b.registration, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }
  if (sortBy === "payload") {
    filteredTrucks.sort((a, b) => a.maxLoadCapacity - b.maxLoadCapacity);
  }
  if (sortBy === "length") {
    filteredTrucks.sort((a, b) => a.length - b.length);
  }
  if (sortBy === "width") {
    filteredTrucks.sort((a, b) => a.width - b.width);
  }
  if (sortBy === "height") {
    filteredTrucks.sort((a, b) => a.height - b.height);
  }

  // If the user has no fleets, a message is shown
  if (!userFleets) {
    return <p>Loading fleets...</p>; // or a spinner
  }

  return (
    <>
      <div className="fixed top-[50px] flex w-full max-w-8xl flex-col p-8">
        {/** Action bar */}
        <div className="felx-row flex justify-between gap-2 bg-base-100 border-1 border-base-300 rounded-t-xl items-center px-5 py-2">
          <div className="flex flex-row justify-start gap-4">
            {/* Search Bar */}
            <input type="search" className="grow" placeholder="Search" />
            {/* Fleet selector */}
            <select
              defaultValue={userFleet}
              onChange={handleFleetChange}
              className="select"
            >
              {userFleets.map((fleet: { _id: string; fleetName: string }) => (
                <option key={fleet._id} value={fleet._id}>
                  {fleet.fleetName}
                </option>
              ))}
            </select>
            {/* Sorting Selector */}
            <select
              className="select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "registration"
                    | "payload"
                    | "length"
                    | "width"
                    | "height"
                )
              }
            >
              <option value="registration">Sort By Registration</option>
              <option value="payload">Sort By Payload Capacity</option>
              <option value="length">Sort By Length</option>
              <option value="width">Sort By Width</option>
              <option value="height">Sort By Height</option>
            </select>
            {/* Filter Button */}
            <FleetManagerTableFilter
              onFilter={(filterTerm) => {
                setFilterTerm(filterTerm);
              }}
            />
          </div>

          {/* Action Button */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-primary m-1">
              Actions
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
            >
              <li>
                <a>Create Truck</a>
              </li>
              <li>
                <a>New Fleet</a>
                <a>Edit Fleet</a>
              </li>
            </ul>
          </div>
        </div>

        {/** Table */}
        <div>
          <div className="overflow-x-auto border-1 border-base-300 border-t-0">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Registration</th>
                  <th>Type</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Payload Capacity (kg)</th>
                  <th>Length (m) </th>
                  <th>Width (m) </th>
                  <th>Height (m) </th>
                  <th></th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {filteredTrucks.map((truck, index) => (
                  <tr key={truck.registration} className="bg-base-100">
                    <th>{index + 1}</th>
                    <td>{truck.registration}</td>
                    <td>{truck.truckType}</td>
                    <td>{truck.make}</td>
                    <td>{truck.model}</td>
                    <td>{truck.year}</td>
                    <td>{truck.maxLoadCapacity}</td>
                    <td>{truck.length}</td>
                    <td>{truck.width}</td>
                    <td>{truck.height}</td>
                    <th>
                      <button className="btn btn-square bg-base-100 border-none">
                        <CiMenuKebab />
                      </button>
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default FleetManagerTable;
