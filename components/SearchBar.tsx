"use client";

import { useState } from "react";
import { IoIosSearch } from "react-icons/io";

export default function SearchBar() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [arrival, setArrival] = useState("");
  const [truck, setTruck] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ from, to, arrival, truck });
    // You can now send this data to an API, etc.
  };

  return (
    <form className="flex flex-row space-x-2" onSubmit={handleSubmit}>
      <div className="relative mx-auto flex h-18 w-[625px] rounded-2xl border-1 border-base-300 bg-base-100 shadow">
        <div className="flex h-18 w-[175px] rounded-2xl hover:bg-base-200 items-center focus-within:bg-base-200">
          <fieldset className="fieldset ml-4">
            <legend className="fieldset-legend ml-3 mb-0 pb-0">Origin</legend>
            <input
              type="text"
              placeholder="Enter City"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input input-ghost w-[120px] input-xs mt-0 pt-0 focus:bg-base-200 focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </fieldset>
        </div>

        <div className="flex h-18 w-[175px] rounded-2xl hover:bg-base-200 items-center focus-within:bg-base-200">
          <fieldset className="fieldset ml-4">
            <legend className="fieldset-legend ml-3 mb-0 pb-0">
              Destination
            </legend>
            <input
              type="text"
              placeholder="Enter City"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input input-ghost w-[120px] input-xs mt-0 pt-0 focus:bg-base-200 focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </fieldset>
        </div>
        <div className="flex h-18 w-[175px] rounded-2xl hover:bg-base-200 items-center focus-within:bg-base-200">
          <fieldset className="fieldset ml-4">
            <legend className="fieldset-legend ml-3 mb-0 pb-0">
              Latest Arrival?
            </legend>
            <input
              type="date"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="input input-ghost input-xs mt-0 pt-0 focus:bg-base-200 focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </fieldset>
        </div>
        <div className="flex h-18 w-[100px] rounded-2xl items-center justify-center">
          <button className="btn btn-lg btn-circle bg-primary outline-none">
            <IoIosSearch />
          </button>
        </div>
      </div>
    </form>
  );
}
