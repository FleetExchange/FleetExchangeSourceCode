"use client";

import { usePlacesWithRestrictions } from "@/hooks/usePlacesWithRestrictions";
import { useState } from "react";
import { Search, MapPin, Calendar } from "lucide-react";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { getCurrentSASTInputMin } from "@/utils/dateUtils";

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

  // Get current date in SAST timezone for min date
  const getCurrentSASTDate = () => {
    const today = getCurrentSASTInputMin();
    return today.split("T")[0]; // Returns YYYY-MM-DD format
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ from, to, arrival });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
          <Search className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-base-content">Search Routes</h3>
          <p className="text-sm text-base-content/60">
            Find available transportation • Dates in SAST
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Desktop Layout */}
        <div className="hidden lg:flex bg-base-200/50 border border-base-300 rounded-xl p-2 gap-2">
          {/* Origin */}
          <div className="flex-1 bg-base-100 rounded-lg p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium text-base-content">
                Origin
              </label>
            </div>
            <AddressAutocomplete
              value={from}
              onChange={(address) => {
                setFrom(address || "");
                pickup.setValue(address || "");
              }}
              ready={pickup.ready}
              inputValue={pickup.value}
              onInputChange={(value) => {
                pickup.setValue(value);
              }}
              suggestions={pickup.suggestions}
              status={pickup.status}
              clearSuggestions={pickup.clearSuggestions}
              label="Enter City"
            />
          </div>

          {/* Destination */}
          <div className="flex-1 bg-base-100 rounded-lg p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-success" />
              <label className="text-sm font-medium text-base-content">
                Destination
              </label>
            </div>
            <AddressAutocomplete
              value={to}
              onChange={(address) => {
                setTo(address || "");
                delivery.setValue(address || "");
              }}
              ready={delivery.ready}
              inputValue={delivery.value}
              onInputChange={(value) => {
                delivery.setValue(value);
              }}
              suggestions={delivery.suggestions}
              status={delivery.status}
              clearSuggestions={delivery.clearSuggestions}
              label="Enter City"
            />
          </div>

          {/* Date - Enhanced with SAST formatting */}
          <div className="flex-1 bg-base-100 rounded-lg p-4 border border-base-300">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-info" />
              <label className="text-sm font-medium text-base-content">
                Latest Arrival (SAST)
              </label>
            </div>
            <input
              type="date"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              min={getCurrentSASTDate()}
              className="w-full text-sm bg-transparent border-none focus:outline-none focus:ring-0"
              title="Select latest arrival date in South African Standard Time"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-center">
            <button
              type="submit"
              className="btn btn-primary btn-lg h-full px-8 gap-2 hover:bg-primary-focus"
            >
              <Search className="w-5 h-5" />
              <span className="hidden xl:inline">Search</span>
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Origin */}
          <div className="bg-base-100 rounded-xl p-4 border border-base-300 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-primary/10 rounded-lg border border-primary/20">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <label className="text-sm font-medium text-base-content">
                From
              </label>
            </div>
            <AddressAutocomplete
              value={from}
              onChange={(address) => {
                setFrom(address || "");
                pickup.setValue(address || "");
              }}
              ready={pickup.ready}
              inputValue={pickup.value}
              onInputChange={(value) => {
                pickup.setValue(value);
              }}
              suggestions={pickup.suggestions}
              status={pickup.status}
              clearSuggestions={pickup.clearSuggestions}
              label="Enter origin city"
            />
          </div>

          {/* Destination */}
          <div className="bg-base-100 rounded-xl p-4 border border-base-300 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-success/10 rounded-lg border border-success/20">
                <MapPin className="w-4 h-4 text-success" />
              </div>
              <label className="text-sm font-medium text-base-content">
                To
              </label>
            </div>
            <AddressAutocomplete
              value={to}
              onChange={(address) => {
                setTo(address || "");
                delivery.setValue(address || "");
              }}
              ready={delivery.ready}
              inputValue={delivery.value}
              onInputChange={(value) => {
                delivery.setValue(value);
              }}
              suggestions={delivery.suggestions}
              status={delivery.status}
              clearSuggestions={delivery.clearSuggestions}
              label="Enter destination city"
            />
          </div>

          {/* Date - Enhanced with SAST formatting */}
          <div className="bg-base-100 rounded-xl p-4 border border-base-300 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-info/10 rounded-lg border border-info/20">
                <Calendar className="w-4 h-4 text-info" />
              </div>
              <label className="text-sm font-medium text-base-content">
                Latest Arrival Date (SAST)
              </label>
            </div>
            <input
              type="date"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              min={getCurrentSASTDate()}
              className="w-full text-base bg-transparent border-none focus:outline-none focus:ring-0"
              title="Select latest arrival date in South African Standard Time"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="btn btn-primary w-full h-14 text-base gap-3 hover:bg-primary-focus"
          >
            <Search className="w-5 h-5" />
            Search Available Trips
          </button>
        </div>

        {/* Enhanced Search Tips */}
        <div className="bg-info/5 border border-info/20 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-info/20 rounded-lg mt-0.5">
              <Search className="w-4 h-4 text-info" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-base-content mb-1">
                Search Tips
              </h4>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Enter your pickup and delivery cities. Use the date filter to
                find trips arriving by your deadline (South African Standard
                Time). Leave fields empty to browse all available routes.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
