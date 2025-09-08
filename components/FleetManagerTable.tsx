"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import {
  Search,
  ArrowUpDown,
  Plus,
  Settings,
  Truck,
  MoreHorizontal,
} from "lucide-react";
import FleetManagerTableFilter from "./FleetManagerTableFilter";
import NewFleetCard from "./NewFleetCard";
import NewFleetModal from "./NewFleetModal";
import EditFleetCard from "./EditFleetCard";
import EditFleetModal from "./EditFleetModal";
import Link from "next/link";
import PaginationControls from "./PaginationControls";

const FleetManagerTable = () => {
  // Pagination constant
  const ITEMS_PER_PAGE = 2;
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
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/60">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!userFleets) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/60">Loading fleets...</p>
        </div>
      </div>
    );
  }

  // Calculate pagination values
  const totalItems = filteredTrucks.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Get current page items
  const currentItems = filteredTrucks.slice(startIndex, endIndex);

  return (
    <div className="p-4">
      {/* Controls Section */}
      <div className="bg-base-200/50 border border-base-300 rounded-t-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left Controls */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-start sm:items-center w-full lg:w-auto">
            {/* Search Bar */}
            <div className="form-control">
              <label className="input input-bordered flex items-center gap-2 min-w-[200px] focus-within:outline-none focus-within:ring-0 focus-within:ring-primary focus-within:border-primary">
                <Search className="w-4 h-4 text-base-content/60" />
                <input
                  type="text"
                  className="grow focus:outline-none border-none"
                  placeholder="Search registration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>

            {/* Fleet Selector */}
            <div className="form-control">
              <select
                value={userFleet || ""}
                onChange={handleFleetChange}
                className="select select-bordered focus:outline-none focus:border-primary min-w-[150px]"
              >
                {userFleets?.map(
                  (fleet: { _id: string; fleetName: string }) => (
                    <option key={fleet._id} value={fleet._id}>
                      {fleet.fleetName}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="form-control">
              <select
                className="select select-bordered focus:outline-none focus:border-primary min-w-[180px]"
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
                <option value="payload">Sort By Payload</option>
                <option value="length">Sort By Length</option>
                <option value="width">Sort By Width</option>
                <option value="height">Sort By Height</option>
              </select>
            </div>

            {/* Filter Button */}
            <FleetManagerTableFilter
              onFilter={(filterTerm) => {
                setFilterTerm(filterTerm);
              }}
            />
          </div>

          {/* Right Controls */}
          <div className="flex gap-3 items-center">
            {/* Pagination */}
            <PaginationControls
              currentPage={totalPages === 0 ? 0 : currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            {/* Actions Dropdown */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Actions
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content bg-base-100 rounded-box z-[1] w-65 p-2 shadow-lg border border-base-300"
              >
                <li>
                  <Link
                    href={{
                      pathname: "/truckManager",
                      query: { action: "create", truckId: "" },
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary hover:text-primary-content transition-colors duration-200 group"
                  >
                    <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary-content/20">
                      <Truck className="w-4 h-4 text-primary group-hover:text-primary-content" />
                    </div>
                    <div>
                      <div className="font-medium">Create Truck</div>
                      <div className="text-xs text-base-content/60 group-hover:text-primary-content/80">
                        Add a new vehicle to your fleet
                      </div>
                    </div>
                  </Link>
                </li>
                <li>
                  <div className="p-3 rounded-lg hover:bg-success hover:text-success-content transition-colors duration-200 group cursor-pointer">
                    <NewFleetCard />
                  </div>
                </li>
                <li>
                  <div className="p-3 rounded-lg hover:bg-info hover:text-info-content transition-colors duration-200 group cursor-pointer">
                    <EditFleetCard />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-base-300">
          <div className="text-sm text-base-content/60">
            Showing {currentItems.length} of {totalItems} vehicles
          </div>
          {(searchTerm ||
            Object.values(filterTerm).some((val) => val && val !== 0)) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/60">
                Filters active
              </span>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterTerm({
                    make: "",
                    year: "",
                    truckType: "",
                    width: 0,
                    length: 0,
                    height: 0,
                    payload: 0,
                  });
                }}
                className="btn btn-ghost btn-xs"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto border border-base-300 border-t-0 rounded-b-xl bg-base-100">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Truck className="w-12 h-12 text-base-content/30 mb-4" />
            <h3 className="text-lg font-semibold text-base-content/60 mb-2">
              No vehicles found
            </h3>
            <p className="text-base-content/40 text-center max-w-md">
              {searchTerm ||
              Object.values(filterTerm).some((val) => val && val !== 0)
                ? "Try adjusting your search criteria or filters."
                : "Add your first vehicle to get started."}
            </p>
          </div>
        ) : (
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th className="font-semibold text-base-content">#</th>
                <th className="font-semibold text-base-content">
                  Registration
                </th>
                <th className="font-semibold text-base-content">Type</th>
                <th className="font-semibold text-base-content">Make</th>
                <th className="font-semibold text-base-content">Model</th>
                <th className="font-semibold text-base-content">Year</th>
                <th className="font-semibold text-base-content">
                  Payload (kg)
                </th>
                <th className="font-semibold text-base-content">Length (m)</th>
                <th className="font-semibold text-base-content">Width (m)</th>
                <th className="font-semibold text-base-content">Height (m)</th>
                <th className="font-semibold text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((truck, index) => (
                <tr key={truck.registration} className="hover:bg-base-200/50">
                  <td className="font-medium">{startIndex + index + 1}</td>
                  <td className="font-medium text-primary">
                    {truck.registration}
                  </td>
                  <td>{truck.truckType}</td>
                  <td>{truck.make}</td>
                  <td>{truck.model}</td>
                  <td>{truck.year}</td>
                  <td>{truck.maxLoadCapacity?.toLocaleString()}</td>
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
                      <button className="btn btn-ghost btn-sm hover:bg-base-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Hidden Modals */}
      {userFleets && <NewFleetModal fleets={userFleets} />}
      {userFleets && <EditFleetModal UserFleets={userFleets} />}
    </div>
  );
};

export default FleetManagerTable;
