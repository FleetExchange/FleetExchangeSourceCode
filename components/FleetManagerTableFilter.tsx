"use client";

import { TRUCK_TYPES } from "@/shared/truckTypes";
import React, { use, useState } from "react";
import { IoFilter } from "react-icons/io5";

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
    // You can now send this data to an API, etc.
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
      make,
      year,
      truckType,
      width,
      length,
      height,
      payload,
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
        className="btn btn-soft bg-base-100 hover:bg-base-200"
        onClick={openModal}
      >
        <IoFilter /> Filters
      </button>

      <dialog id="FleetManagerFilterModal" className="modal">
        <div className="modal-box w-full max-w-[500px]">
          <div>
            <h1 className="font-bold mb-4">Filters</h1>
          </div>
          <hr className="border-t border-base-200 my-0 mt-4" />
          <div className="mt-4">
            <h1 className="font-bold">Select Vehicle Type</h1>
            <div className="flex flex-row gap-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Type Select</legend>
                <select
                  id="truckTypeSelect"
                  className="select focus:outline-none focus:ring-0"
                  value={truckType}
                  onChange={(e) => setType(e.target.value)}
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
          </div>

          <hr className="border-t border-base-200 my-0 mt-4" />
          <div className="mt-4">
            <h1 className="font-bold">Vehcile Information</h1>
            <div className="flex flex-row gap-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Vehcile Make</legend>
                <input
                  type="text"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Year of Model</legend>
                <input
                  type="number"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </fieldset>
            </div>
          </div>

          <hr className="border-t border-base-200 my-0 mt-4" />
          <div className="mt-4">
            <h1 className="font-bold">Dimensions & Capacity</h1>
            <div className="flex flex-row flex-wrap gap-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Width</legend>
                <input
                  type="number"
                  min="0"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={width}
                  onChange={(e) =>
                    setWidth(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                />
                <p className="label">(In Meter)</p>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Length</legend>
                <input
                  type="number"
                  min="0"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={length}
                  onChange={(e) =>
                    setlength(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
                <p className="label">(In Meter)</p>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Height</legend>
                <input
                  type="number"
                  min="0"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={height}
                  onChange={(e) =>
                    setHeight(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
                <p className="label">(In Meter)</p>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Payload Capacity</legend>
                <input
                  type="number"
                  min="0"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={payload}
                  onChange={(e) =>
                    setPayload(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
                <p className="label">(In Kg)</p>
              </fieldset>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn btn-primary" onClick={applyFilters}>
              Apply
            </button>
            <button className="btn btn-base-200" onClick={resetFilters}>
              Clear Filters
            </button>

            <form method="dialog">
              <button className="btn btn-base-200">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default FleetManagerTableFilter;
