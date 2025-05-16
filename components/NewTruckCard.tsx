import { TRUCK_TYPES } from "@/shared/truckTypes";
import { v } from "convex/values";
import React, { useState } from "react";

const NewTruckCard = () => {
  const [registration, setRegistration] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [truckType, setTruckType] = useState("");
  const [maxLoadCapacity, setMaxLoadCapacity] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [height, setHeight] = useState("");
  const [fleet, setFleet] = useState("");

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
                  onChange={(e) => setTruckType(e.target.value)}
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
                      onChange={(e) => setLength(e.target.value)}
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
                    <legend className="fieldset-legend">
                      Payload Capacity
                    </legend>
                    <input
                      type="number"
                      className="input focus:outline-none focus:ring-0"
                      placeholder="Type here"
                      value={maxLoadCapacity}
                      onChange={(e) => setMaxLoadCapacity(e.target.value)}
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
                    <option> Test</option>
                  </select>
                </fieldset>
              </div>

              <div className="flex mt-4 gap-4 items-end">
                <button className="btn btn-primary">Create</button>
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
