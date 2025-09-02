"use client";

import { TRUCK_TYPES } from "@/shared/truckTypes";
import React, { useState } from "react";
import { Filter, Calendar, Truck, Package, X } from "lucide-react";
import {
  convertSASTInputToUTC,
  getCurrentSASTInputMin,
  getEndOfSASTDay,
} from "@/utils/dateUtils";

const FilterBtn = ({
  onFilter,
}: {
  onFilter: (filters: {
    depDate: string;
    depTime: string;
    arrDate: string;
    arrTime: string;
    truckType: string;
    width: string;
    length: string;
    height: string;
    payload: string;
  }) => void;
}) => {
  // Local state for form inputs (user sees SAST times)
  const [depDate, setDepDate] = useState("");
  const [depTime, setDepTime] = useState("");
  const [arrDate, setArrDate] = useState("");
  const [arrTime, setArrTime] = useState("");
  const [truckType, setType] = useState("");
  const [width, setWidth] = useState("");
  const [length, setlength] = useState("");
  const [height, setHeight] = useState("");
  const [payload, setPayload] = useState("");

  // Applied filters state - tracks what's actually been applied
  const [appliedFilters, setAppliedFilters] = useState({
    depDate: "",
    depTime: "",
    arrDate: "",
    arrTime: "",
    truckType: "",
    width: "",
    length: "",
    height: "",
    payload: "",
  });

  // Helper function to get today's date in SAST for min date
  const getTodayInSAST = () => {
    return getCurrentSASTInputMin().split("T")[0]; // Extract just the date part
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert SAST date/time inputs to UTC timestamps for filtering
    let depDateUTC = "";
    let arrDateUTC = "";

    if (depDate && depTime) {
      // Combine date and time, then convert SAST to UTC
      const depDateTime = `${depDate}T${depTime}`;
      const depTimestamp = convertSASTInputToUTC(depDateTime);
      depDateUTC = depTimestamp.toString();
    } else if (depDate) {
      // Just date, assume start of day (00:00) in SAST
      const depDateTime = `${depDate}T00:00`;
      const depTimestamp = convertSASTInputToUTC(depDateTime);
      depDateUTC = depTimestamp.toString();
    }

    if (arrDate && arrTime) {
      // Combine date and time, then convert SAST to UTC
      const arrDateTime = `${arrDate}T${arrTime}`;
      const arrTimestamp = convertSASTInputToUTC(arrDateTime);
      arrDateUTC = arrTimestamp.toString();
    } else if (arrDate) {
      // Just date, use end of day utility for precise end-of-day calculation
      const startOfDay = convertSASTInputToUTC(`${arrDate}T00:00`);
      const arrTimestamp = getEndOfSASTDay(startOfDay);
      arrDateUTC = arrTimestamp.toString();
    }

    const filters = {
      depDate: depDateUTC, // Send UTC timestamp for filtering
      depTime: depTime, // Keep time for additional filtering logic if needed
      arrDate: arrDateUTC, // Send UTC timestamp for filtering
      arrTime: arrTime, // Keep time for additional filtering logic if needed
      truckType,
      width,
      length,
      height,
      payload,
    };

    // Update applied filters state (keep original user input for display)
    setAppliedFilters({
      depDate,
      depTime,
      arrDate,
      arrTime,
      truckType,
      width,
      length,
      height,
      payload,
    });

    // Call the parent function with UTC timestamps
    onFilter(filters);

    // Close modal after applying
    const modal = document.getElementById(
      "my_modal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.close();
    }
  };

  const resetFilters = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset local state
    setDepDate("");
    setDepTime("");
    setArrDate("");
    setArrTime("");
    setWidth("");
    setlength("");
    setHeight("");
    setPayload("");
    setType("");

    // Reset applied filters
    const emptyFilters = {
      depDate: "",
      depTime: "",
      arrDate: "",
      arrTime: "",
      truckType: "",
      width: "",
      length: "",
      height: "",
      payload: "",
    };

    setAppliedFilters(emptyFilters);
    onFilter(emptyFilters);
  };

  const openModal = () => {
    const modal = document.getElementById(
      "my_modal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    } else {
      console.error("Modal element not found");
    }
  };

  // Check applied filters instead of local state
  const hasActiveFilters = Object.values(appliedFilters).some(
    (value) => value !== ""
  );
  const activeFilterCount = Object.values(appliedFilters).filter(
    (value) => value !== ""
  ).length;

  return (
    <>
      <button
        className={`btn gap-2 transition-all duration-200 ${
          hasActiveFilters
            ? "btn-primary shadow-lg"
            : "btn-outline btn-primary hover:btn-primary"
        }`}
        onClick={openModal}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Advanced Filters</span>
        <span className="sm:hidden">Filters</span>
        {hasActiveFilters && (
          <div className="badge badge-success badge-sm">
            {activeFilterCount}
          </div>
        )}
      </button>

      <dialog id="my_modal" className="modal">
        <div className="modal-box w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  Advanced Filters
                </h2>
                <p className="text-sm text-base-content/60">
                  All times in South African Standard Time (SAST)
                </p>
              </div>
            </div>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm p-2">
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {/* Departure Section */}
            <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-base-content">
                  Departure Time (SAST)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                    value={depDate}
                    onChange={(e) => setDepDate(e.target.value)}
                    min={getTodayInSAST()}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Time</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                    value={depTime}
                    onChange={(e) => setDepTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Arrival Section */}
            <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-success" />
                <h3 className="font-semibold text-base-content">
                  Arrival Time (SAST)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                    value={arrDate}
                    onChange={(e) => setArrDate(e.target.value)}
                    min={depDate || getTodayInSAST()}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Time</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                    value={arrTime}
                    onChange={(e) => setArrTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Type Section */}
            <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-warning" />
                <h3 className="font-semibold text-base-content">
                  Vehicle Type
                </h3>
              </div>
              <select
                className="select select-bordered w-full focus:outline-none focus:border-primary"
                value={truckType}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Any vehicle type</option>
                {TRUCK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Dimensions & Capacity Section */}
            <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-info" />
                <h3 className="font-semibold text-base-content">
                  Dimensions & Capacity
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Width (m)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                    placeholder="0.0"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Length (m)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                    placeholder="0.0"
                    value={length}
                    onChange={(e) => setlength(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Height (m)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                    placeholder="0.0"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Payload (kg)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                    placeholder="0"
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Preview */}
            {hasActiveFilters && (
              <div className="bg-info/10 border border-info/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-info" />
                  <h4 className="font-semibold text-base-content">
                    Active Filters
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {appliedFilters.depDate && (
                    <div className="badge badge-primary gap-1">
                      Depart: {appliedFilters.depDate} {appliedFilters.depTime}
                    </div>
                  )}
                  {appliedFilters.arrDate && (
                    <div className="badge badge-success gap-1">
                      Arrive: {appliedFilters.arrDate} {appliedFilters.arrTime}
                    </div>
                  )}
                  {appliedFilters.truckType && (
                    <div className="badge badge-warning gap-1">
                      {appliedFilters.truckType}
                    </div>
                  )}
                  {(appliedFilters.width ||
                    appliedFilters.length ||
                    appliedFilters.height ||
                    appliedFilters.payload) && (
                    <div className="badge badge-info gap-1">
                      Custom dimensions
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-base-300">
            <button
              className="btn btn-ghost order-3 sm:order-1"
              onClick={resetFilters}
            >
              Clear All Filters
            </button>
            <form method="dialog" className="order-2">
              <button className="btn btn-outline w-full sm:w-auto">
                Cancel
              </button>
            </form>
            <button
              className="btn btn-primary order-1 sm:order-3 w-full sm:w-auto gap-2"
              onClick={applyFilters}
            >
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default FilterBtn;
