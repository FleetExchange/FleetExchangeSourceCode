"use client";

import { usePlacesWithRestrictions } from "@/hooks/usePlacesWithRestrictions";
import { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { AddressAutocomplete } from "./AddressAutocomplete";

export default function SearchBar({
  onSearch,
}: {
  onSearch: (filters: { from: string; to: string; arrival: string }) => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [arrival, setArrival] = useState("");

  // Add Places Autocomplete hooks for origin and destination
  const pickup = usePlacesWithRestrictions({
    cityName: from,
    citiesOnly: true, // Enable city-only mode
  });

  const delivery = usePlacesWithRestrictions({
    cityName: to,
    citiesOnly: true, // Enable city-only mode
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ from, to, arrival });
  };

  return (
    <form className="flex flex-row space-x-2" onSubmit={handleSubmit}>
      <div className="relative mx-auto flex h-18 w-[625px] rounded-2xl border-1 border-base-300 bg-base-100 shadow">
        <div className="flex h-18 w-[175px] rounded-2xl hover:bg-base-200 items-center focus-within:bg-base-200">
          <fieldset className="fieldset ml-4">
            <legend className="fieldset-legend ml-3 mb-0 pb-0">Origin</legend>

            <AddressAutocomplete
              value={from}
              onChange={(address) => {
                setFrom(address || "");
                pickup.setValue(address || ""); // Add this line to update input value
              }}
              ready={pickup.ready}
              inputValue={pickup.value}
              onInputChange={(value) => {
                pickup.setValue(value);
                // Don't update 'from' here, wait for selection
              }}
              suggestions={pickup.suggestions}
              status={pickup.status}
              clearSuggestions={pickup.clearSuggestions}
              label="Enter City"
            />
          </fieldset>
        </div>

        <div className="flex h-18 w-[175px] rounded-2xl hover:bg-base-200 items-center focus-within:bg-base-200">
          <fieldset className="fieldset ml-4">
            <legend className="fieldset-legend ml-3 mb-0 pb-0">
              Destination
            </legend>
            <AddressAutocomplete
              value={to}
              onChange={(address) => {
                setTo(address || "");
                delivery.setValue(address || ""); // Add this line to update input value
              }}
              ready={delivery.ready}
              inputValue={delivery.value}
              onInputChange={(value) => {
                delivery.setValue(value);
                // Don't update 'to' here, wait for selection
              }}
              suggestions={delivery.suggestions}
              status={delivery.status}
              clearSuggestions={delivery.clearSuggestions}
              label="Enter City"
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
              min={new Date().toISOString().split("T")[0]} // Prevent past dates
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
