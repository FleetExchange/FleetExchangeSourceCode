"use client";

import { TRUCK_TYPES } from "@/shared/truckTypes";
import React, { useState } from "react";
import { IoFilter } from "react-icons/io5";

const FleetManagerTableFilter = ({
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
  const [depDate, setDepDate] = useState("");
  const [depTime, setDepTime] = useState("");
  const [arrDate, setArrDate] = useState("");
  const [arrTime, setArrTime] = useState("");
  const [truckType, setType] = useState("");
  const [width, setWidth] = useState("");
  const [length, setlength] = useState("");
  const [height, setHeight] = useState("");
  const [payload, setPayload] = useState("");

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
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
    // You can now send this data to an API, etc.
  };

  const resetFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setDepDate("");
    setDepTime("");
    setArrDate("");
    setArrTime("");
    setWidth("");
    setlength("");
    setHeight("");
    setPayload("");
    setType("");
    onFilter({
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

  return (
    <div className="flex flex-row h-18 items-center">
      <button
        className="btn btn-soft bg-base-100 hover:bg-base-200"
        onClick={openModal}
      >
        <IoFilter /> Filters
      </button>

      <dialog id="my_modal" className="modal">
        <div className="modal-box w-full max-w-[500px]">
          <div>
            <h1 className="font-bold mb-4">Filters</h1>
            <h1 className="font-bold">Specific Departure Date & Time</h1>
            <div className="flex flex-row gap-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Date</legend>
                <input
                  type="date"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={depDate}
                  onChange={(e) => setDepDate(e.target.value)}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Time</legend>
                <input
                  type="time"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={depTime}
                  onChange={(e) => setDepTime(e.target.value)}
                />
              </fieldset>
            </div>
          </div>
          <hr className="border-t border-base-200 my-0 mt-4" />
          <div className="mt-4">
            <h1 className="font-bold">Specific Arrival Date & Time</h1>
            <div className="flex flex-row gap-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Date</legend>
                <input
                  type="date"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={arrDate}
                  onChange={(e) => setArrDate(e.target.value)}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Time</legend>
                <input
                  type="time"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={arrTime}
                  onChange={(e) => setArrTime(e.target.value)}
                />
              </fieldset>
            </div>
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
            <h1 className="font-bold">Dimensions & Capacity</h1>
            <div className="flex flex-row flex-wrap gap-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Width</legend>
                <input
                  type="number"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
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
                  onChange={(e) => setlength(e.target.value)}
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
                  onChange={(e) => setHeight(e.target.value)}
                />
                <p className="label">(In Meter)</p>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Payload Capacity</legend>
                <input
                  type="number"
                  className="input focus:outline-none focus:ring-0"
                  placeholder="Type here"
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
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
