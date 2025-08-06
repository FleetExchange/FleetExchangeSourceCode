"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { usePlacesWithRestrictions } from "@/hooks/usePlacesWithRestrictions";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { Id } from "@/convex/_generated/dataModel";

const CreateTripPage = () => {
  // Get Id of the user creating the trip
  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const clerkId = user!.id;
  // User Id in Convex
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkId,
  })?._id;

  // Declare all fields
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [KMPrice, setKMPrice] = useState(0);
  const [KGPrice, setKGPrice] = useState(0);
  const [selectedFleetId, setSelectedFleetId] = useState<Id<"fleet"> | null>(
    null
  );
  const [selectedTruckId, setSelectedTruckId] = useState<Id<"truck"> | null>(
    null
  );

  // Add Places Autocomplete hooks for origin and destination
  const pickup = usePlacesWithRestrictions({
    cityName: originCity,
    citiesOnly: true, // Enable city-only mode
  });

  const delivery = usePlacesWithRestrictions({
    cityName: destinationCity,
    citiesOnly: true, // Enable city-only mode
  });

  const userFleets = useQuery(api.fleet.getFleetForCurrentUser, {
    userId: clerkId,
  });

  // Keep both queries but handle the empty case better
  const fleetTruckIds =
    useQuery(
      api.fleet.getTrucksForFleet,
      selectedFleetId ? { fleetId: selectedFleetId } : "skip"
    ) ?? [];

  const fleetTrucks =
    useQuery(
      api.truck.getTruckByIdArray,
      fleetTruckIds.length > 0 ? { truckIds: fleetTruckIds } : "skip"
    ) ?? [];

  const createTrip = useMutation(api.trip.createTrip);

  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setDepartureDate(date.toISOString());
  };

  const handleArrivalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setArrivalDate(date.toISOString());
  };

  // Format ISO date string to local datetime-local input value
  const formatDateForInput = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const formatNumber = (value: number) => {
    return value.toFixed(2);
  };

  // Simplified price handlers
  const handleBasePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setBasePrice(value);
  };

  const handleKMPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setKMPrice(value);
  };

  const handleKGPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setKGPrice(value);
  };

  const handleCreateTrip = async () => {
    if (!userId || !selectedFleetId || !selectedTruckId) {
      alert("Please select a fleet and truck");
      return;
    }

    if (!originCity || !destinationCity || !departureDate || !arrivalDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createTrip({
        userId,
        truckId: selectedTruckId,
        originCity,
        destinationCity,
        departureDate,
        arrivalDate,
        basePrice,
        KMPrice,
        KGPrice,
        isBooked: false,
        originAddress: "",
        destinationAddress: "",
      });

      alert("Trip created successfully!");
      window.location.href = "/myTrips";
    } catch (error) {
      console.error("Failed to create trip:", error);
      alert("Failed to create trip. Please try again.");
    }
  };

  // Add loading state handling
  if (!userId || !userFleets) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-base-200 py-10">
      <div className="w-full max-w-3xl bg-base-100 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Create Trip</h1>
        <p className="text-base-content/70 mb-6">
          Fill in the details below to create a new trip.
        </p>
        <div className="divider my-4" />

        {/* Origin & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <fieldset className="space-y-2">
            <legend className="text-base font-medium">Origin City</legend>
            <AddressAutocomplete
              value={originCity}
              onChange={(city) => {
                setOriginCity(city);
                pickup.setValue(city);
              }}
              ready={pickup.ready}
              inputValue={pickup.value}
              onInputChange={pickup.setValue}
              suggestions={pickup.suggestions}
              status={pickup.status}
              clearSuggestions={pickup.clearSuggestions}
              label="Origin City"
            />
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-base font-medium">Destination City</legend>
            <AddressAutocomplete
              value={destinationCity}
              onChange={(city) => {
                setDestinationCity(city);
                delivery.setValue(city);
              }}
              ready={delivery.ready}
              inputValue={delivery.value}
              onInputChange={delivery.setValue}
              suggestions={delivery.suggestions}
              status={delivery.status}
              clearSuggestions={delivery.clearSuggestions}
              label="Destination City"
            />
          </fieldset>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <fieldset className="space-y-2">
            <legend className="text-base font-medium">Departure Date</legend>
            <input
              type="datetime-local"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              value={formatDateForInput(departureDate)}
              onChange={handleDepartureChange}
              min={formatDateForInput(new Date().toISOString())}
            />
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-base font-medium">Arrival Date</legend>
            <input
              type="datetime-local"
              className="input input-bordered w-full focus:outline-none focus:ring-0"
              value={formatDateForInput(arrivalDate)}
              onChange={handleArrivalChange}
              min={formatDateForInput(
                departureDate || new Date().toISOString()
              )}
            />
          </fieldset>
        </div>

        <div className="divider my-6" />

        {/* Price Inputs */}
        <h2 className="font-semibold text-lg mb-2">Pricing</h2>
        <p className=" text-sm m-1">
          {" "}
          Configure your ideal pricing schema with a combination of minimum trip
          price & variable prices per KM or KG.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <fieldset className="space-y-2">
            <legend className="text-base font-medium">Base Price (R)</legend>
            <label className="input-group">
              <span>R</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="input input-bordered w-full focus:outline-none focus:ring-0"
                value={basePrice}
                onChange={handleBasePrice}
              />
            </label>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-base font-medium">
              Amount per KG of Additional Weight (R/kg)
            </legend>
            <label className="input-group">
              <span>R</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="input input-bordered w-full focus:outline-none focus:ring-0"
                value={KGPrice}
                onChange={handleKGPrice}
              />
            </label>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-base font-medium">
              Amount per KM of Route Distance (R/km)
            </legend>
            <label className="input-group">
              <span>R</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="input input-bordered w-full focus:outline-none focus:ring-0"
                value={KMPrice}
                onChange={handleKMPrice}
              />
            </label>
          </fieldset>
        </div>

        <div className="divider my-6" />

        {/* Fleet and Truck Selection */}
        <h2 className="font-semibold text-lg mb-2">Fleet & Truck</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <fieldset className="space-y-2">
            <legend className="text-base font-medium">Select Fleet</legend>
            <select
              className="select select-bordered w-full focus:outline-none focus:ring-0"
              value={selectedFleetId || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedFleetId(value ? (value as Id<"fleet">) : null);
                setSelectedTruckId(null);
              }}
            >
              <option value="">Select a fleet</option>
              {userFleets?.map((fleet) => (
                <option key={fleet._id} value={fleet._id}>
                  {fleet.fleetName}
                </option>
              ))}
            </select>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-base font-medium">Select Truck</legend>
            <select
              className="select select-bordered w-full focus:outline-none focus:ring-0"
              value={selectedTruckId || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedTruckId(value ? (value as Id<"truck">) : null);
              }}
              disabled={!selectedFleetId || fleetTruckIds.length === 0}
            >
              <option value="">Select a truck</option>
              {fleetTrucks?.map((truck) => (
                <option key={truck._id} value={truck._id}>
                  {truck?.registration} - {truck.model}
                </option>
              ))}
            </select>
          </fieldset>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            className="btn btn-ghost"
            onClick={() => {
              window.location.href = "/myTrips";
            }}
          >
            Discard
          </button>
          <button className="btn btn-primary" onClick={handleCreateTrip}>
            Create Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTripPage;
