"use client";

import { TRUCK_TYPES } from "@/shared/truckTypes";
import React, { useState } from "react";
import { Filter, Truck, Calendar, Ruler, Weight } from "lucide-react";

const FleetManagerTableFilter = ({
  onFilter,
}: {
  onFilter: (filters: {
    truckType: string;
    make: string;
    year: string;
    width: number;
    length: number;
    height: number;
    payload: number;
  }) => void;
}) => {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [truckType, setType] = useState("");
  const [width, setWidth] = useState<number>(0);
  const [length, setlength] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [payload, setPayload] = useState<number>(0);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      year,
      make,
      truckType,
      width,
      length,
      height,
      payload,
    });
  };

  const resetFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setMake("");
    setYear("");
    setWidth(0);
    setlength(0);
    setHeight(0);
    setPayload(0);
    setType("");
    onFilter({
      make: "",
      year: "",
      truckType: "",
      width: 0,
      length: 0,
      height: 0,
      payload: 0,
    });
  };

  const openModal = () => {
    const modal = document.getElementById(
      "FleetManagerFilterModal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    } else {
      console.error("Modal element not found");
    }
  };

  return (
    <div className="flex flex-row h-18 items-center">
      <button
        className="btn btn-ghost gap-2 hover:bg-base-200 border border-base-300"
        onClick={openModal}
      >
        <Filter className="w-4 h-4" />
        Filters
      </button>

      <dialog id="FleetManagerFilterModal" className="modal">
        <div className="modal-box w-full max-w-[600px] bg-base-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-base-content">
                  Filter Fleet
                </h1>
                <p className="text-sm text-base-content/60">
                  Refine your vehicle search criteria
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Type Section */}
          <div className="bg-base-200/50 border border-base-300 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-base-content">Vehicle Type</h2>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Type Selection</span>
              </label>
              <select
                id="truckTypeSelect"
                className="select select-bordered focus:outline-none focus:border-primary"
                value={truckType}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Any">Any Type</option>
                {TRUCK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Information Section */}
          <div className="bg-base-200/50 border border-base-300 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-base-content">
                Vehicle Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vehicle Make</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered focus:outline-none focus:border-primary"
                  placeholder="e.g., Mercedes, Volvo"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Year of Model</span>
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="input input-bordered focus:outline-none focus:border-primary"
                  placeholder="e.g., 2020"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Dimensions & Capacity Section */}
          <div className="bg-base-200/50 border border-base-300 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4 text-primary" />
                <Weight className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold text-base-content">
                Dimensions & Capacity
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Width (meters)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="input input-bordered focus:outline-none focus:border-primary"
                  placeholder="e.g., 2.5"
                  value={width || ""}
                  onChange={(e) =>
                    setWidth(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Length (meters)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="input input-bordered focus:outline-none focus:border-primary"
                  placeholder="e.g., 12.0"
                  value={length || ""}
                  onChange={(e) =>
                    setlength(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Height (meters)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="input input-bordered focus:outline-none focus:border-primary"
                  placeholder="e.g., 4.0"
                  value={height || ""}
                  onChange={(e) =>
                    setHeight(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Payload Capacity (kg)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered focus:outline-none focus:border-primary"
                  placeholder="e.g., 10000"
                  value={payload || ""}
                  onChange={(e) =>
                    setPayload(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
            <button className="btn btn-primary gap-2" onClick={applyFilters}>
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
            <button className="btn btn-ghost gap-2" onClick={resetFilters}>
              Clear All
            </button>
            <form method="dialog">
              <button className="btn btn-outline">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default FleetManagerTableFilter;
