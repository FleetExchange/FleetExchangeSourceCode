"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import FleetManagerTableFilter from "./FleetManagerTableFilter";
import { CiSearch } from "react-icons/ci";
import NewFleetCard from "./NewFleetCard";
import NewFleetModal from "./NewFleetModal";
import EditFleetCard from "./EditFleetCard";
import EditFleetModal from "./EditFleetModal";
import Link from "next/link";
import PaginationControls from "./PaginationControls";

const FleetManagerTable = () => {
  // Pagination constant
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const userId = user?.id ?? "";

  // Get all fleets that belong to user
  const userFleets = useQuery(
    api.fleet.getFleetForCurrentUser,
    userId ? { userId } : "skip"
  );
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

  // Search Term
  const [searchTerm, setSearchTerm] = useState("");

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
      (!searchTerm ||
        truck.registration
          .toLowerCase()
          .startsWith(searchTerm.toLowerCase())) &&
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

  // Add loading state handling
  if (!user || !userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading user...
      </div>
    );
  }

  if (!userFleets) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading fleets...
      </div>
    );
  }

  // If the user has no fleets, a message is shown
  if (!userFleets) {
    return <p>Loading fleets...</p>; // or a spinner
  }

  // Calculate pagination values
  const totalItems = filteredTrucks.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Get current page items
  const currentItems = filteredTrucks.slice(startIndex, endIndex);

  return (
    <div className="flex w-full flex-col">
      {/** Action bar */}
      <div className="flex flex-row justify-between gap-2 bg-base-100 border border-base-300 rounded-t-xl items-center px-5 py-4">
        <div className="flex flex-row justify-start gap-4 items-center">
          {/* Search Bar */}
          <div className="form-control max-w-sm ">
            <div className="input flex items-center gap-2 focus:outline-none focus:ring-0">
              <CiSearch className="w-4 h-4 opacity-70" />
              <input
                type="text"
                className="grow focus:outline-none focus:ring-0 bg-transparent"
                placeholder="Search Registration"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Fleet selector */}
          <select
            value={userFleet || ""}
            onChange={handleFleetChange}
            className="select select-bordered max-w-xs focus:outline-none focus:ring-0"
          >
            {userFleets?.map((fleet: { _id: string; fleetName: string }) => (
              <option key={fleet._id} value={fleet._id}>
                {fleet.fleetName}
              </option>
            ))}
          </select>

          {/* Sorting Selector */}
          <select
            className="select select-bordered max-w-xs focus:outline-none focus:ring-0"
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

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>

        {/* Action Button */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-primary">
            Actions
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
            <li>
              <Link
                href={{
                  pathname: "/truckManager",
                  query: { action: "create", truckId: "" },
                }}
              >
                Create Truck
              </Link>
            </li>
            <li>
              <NewFleetCard />
              {userFleets && <NewFleetModal fleets={userFleets} />}
              <EditFleetCard />
              {userFleets && <EditFleetModal UserFleets={userFleets} />}
            </li>
          </ul>
        </div>
      </div>

      {/** Table */}
      <div className="overflow-x-auto border border-base-300 border-t-0 rounded-b-xl">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Index</th>
              <th>Registration</th>
              <th>Type</th>
              <th>Make</th>
              <th>Model</th>
              <th>Year</th>
              <th>Payload Capacity (kg)</th>
              <th>Length (m)</th>
              <th>Width (m)</th>
              <th>Height (m)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((truck, index) => (
              <tr key={truck.registration}>
                <th>{startIndex + index + 1}</th>
                <td>{truck.registration}</td>
                <td>{truck.truckType}</td>
                <td>{truck.make}</td>
                <td>{truck.model}</td>
                <td>{truck.year}</td>
                <td>{truck.maxLoadCapacity}</td>
                <td>{truck.length}</td>
                <td>{truck.width}</td>
                <td>{truck.height}</td>
                <td>
                  <Link
                    href={{
                      pathname: "/truckManager",
                      query: {
                        action: "edit",
                        truckId: truck._id as string,
                      },
                    }}
                  >
                    <button className="btn btn-ghost btn-sm">
                      <CiMenuKebab />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FleetManagerTable;
