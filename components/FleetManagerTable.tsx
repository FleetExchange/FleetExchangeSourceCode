"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";

type SortOption = "registration" | "payload" | "length" | "width" | "height";

const FleetManagerTable = () => {
  const { user } = useUser();
  const userId = user?.id ?? ""; // This is the Clerk user ID

  // Get all fleets that belong to user
  const userFleets = useQuery(api.fleet.getFleetForCurrentUser, {
    userId: userId,
  });
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

  const [sortBy, setSortBy] = useState<
    "registration" | "payload" | "length" | "width" | "height"
  >("registration");

  const [filterTerm, setFilterTerm] = useState<{
    truckType: string;
    width: string;
    length: string;
    height: string;
    payload: string;
  }>({
    truckType: "",
    width: "",
    length: "",
    height: "",
    payload: "",
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

  if (sortBy === "registration") {
    trucks.sort((a, b) =>
      a.registration.localeCompare(b.registration, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }
  if (sortBy === "payload") {
    trucks.sort((a, b) => a.maxLoadCapacity - b.maxLoadCapacity);
  }
  if (sortBy === "length") {
    trucks.sort((a, b) => a.length - b.length);
  }
  if (sortBy === "width") {
    trucks.sort((a, b) => a.width - b.width);
  }
  if (sortBy === "height") {
    trucks.sort((a, b) => a.height - b.height);
  }

  if (!userFleets) {
    return <p>Loading fleets...</p>; // or a spinner
  }

  return (
    <>
      <div className="fixed top-[50px] flex w-full max-w-8xl flex-col p-8">
        {/** Action bar */}
        <div className="felx-row flex justify-between gap-2 bg-base-100 border-1 border-base-300 rounded-t-xl items-center px-5 py-2">
          <div className="flex flex-row justify-start gap-4">
            <input type="search" className="grow" placeholder="Search" />
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
            <button className="btn">Insert Filter</button>
          </div>

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
                  <th>Payload Capacity</th>
                  <th>Length</th>
                  <th>Width</th>
                  <th>Height</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck, index) => (
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
