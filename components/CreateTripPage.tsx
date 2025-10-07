"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect, useRef } from "react";
import { usePlacesWithRestrictions } from "@/hooks/usePlacesWithRestrictions";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Package,
  Truck,
  Calendar,
  Clock,
  DollarSign,
  ArrowLeft,
  Building,
  Route,
  Settings,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  formatDateTimeInSAST,
  convertSASTInputToUTC,
  convertUTCToSASTInput,
  getCurrentSASTInputMin,
  isValidDepartureDate,
  isValidArrivalDate,
  debugTimestamp,
  testConversion,
} from "@/utils/dateUtils";

const CreateTripPage = () => {
  const router = useRouter();

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
  const [departureDate, setDepartureDate] = useState<number>(0); // Store as UTC timestamp (number)
  const [arrivalDate, setArrivalDate] = useState<number>(0); // Store as UTC timestamp (number)
  const [basePrice, setBasePrice] = useState(0);
  const [KMPrice, setKMPrice] = useState(0);
  const [KGPrice, setKGPrice] = useState(0);
  const [selectedFleetId, setSelectedFleetId] = useState<Id<"fleet"> | null>(
    null
  );
  const [selectedTruckId, setSelectedTruckId] = useState<Id<"truck"> | null>(
    null
  );

  // Add local input state for immediate display
  const [originInputValue, setOriginInputValue] = useState("");
  const [destinationInputValue, setDestinationInputValue] = useState("");

  // Check if a payout account exsists

  const payoutAccount = useQuery(
    api.payoutAccount.getByUser,
    userId ? { userId } : "skip"
  );

  // Add availability state
  const [truckAvailability, setTruckAvailability] = useState<{
    isAvailable: boolean;
    conflictingTrips: any[];
  } | null>(null);

  // Add validation states
  const [dateValidation, setDateValidation] = useState({
    departureValid: true,
    arrivalValid: true,
    departureMessage: "",
    arrivalMessage: "",
  });

  // Add debounce refs
  const pickupDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deliveryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Fixed debounced input handlers
  const handleOriginInputChange = (value: string) => {
    // Update display immediately
    setOriginInputValue(value);

    if (pickupDebounceRef.current) {
      clearTimeout(pickupDebounceRef.current);
    }

    pickupDebounceRef.current = setTimeout(() => {
      if (value.length >= 3 || value.length === 0) {
        pickup.setValue(value);
      }
    }, 400);
  };

  const handleDestinationInputChange = (value: string) => {
    // Update display immediately
    setDestinationInputValue(value);

    if (deliveryDebounceRef.current) {
      clearTimeout(deliveryDebounceRef.current);
    }

    deliveryDebounceRef.current = setTimeout(() => {
      if (value.length >= 3 || value.length === 0) {
        delivery.setValue(value);
      }
    }, 400);
  };

  // Sync local state when selection is made
  const handleOriginSelection = (city: string) => {
    setOriginCity(city);
    setOriginInputValue(city);
    pickup.clearSuggestions();
  };

  const handleDestinationSelection = (city: string) => {
    setDestinationCity(city);
    setDestinationInputValue(city);
    delivery.clearSuggestions();
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (pickupDebounceRef.current) clearTimeout(pickupDebounceRef.current);
      if (deliveryDebounceRef.current)
        clearTimeout(deliveryDebounceRef.current);
    };
  }, []);

  // Add Places Autocomplete hooks for origin and destination
  const pickup = usePlacesWithRestrictions({
    cityName: originCity,
    citiesOnly: true, // Enable city-only mode
    debounceMs: 0, // Add debouncing at hook level too
  });

  const delivery = usePlacesWithRestrictions({
    cityName: destinationCity,
    citiesOnly: true, // Enable city-only mode
    debounceMs: 0, // Add debouncing at hook level too
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

  // Check truck availability query - now using number timestamps
  const checkTruckAvailability = useQuery(
    api.truck.isTruckAvailable,
    selectedTruckId && departureDate > 0 && arrivalDate > 0
      ? {
          truckId: selectedTruckId,
          departureDate: departureDate,
          arrivalDate: arrivalDate,
        }
      : "skip"
  );

  // Update availability when query result changes
  useEffect(() => {
    if (checkTruckAvailability !== undefined) {
      setTruckAvailability(checkTruckAvailability);
    }
  }, [checkTruckAvailability]);

  // Reset availability when truck selection changes
  useEffect(() => {
    setTruckAvailability(null);
  }, [selectedTruckId, departureDate, arrivalDate]);

  // Validate dates whenever they change
  useEffect(() => {
    const validation = {
      departureValid: true,
      arrivalValid: true,
      departureMessage: "",
      arrivalMessage: "",
    };

    // Validate departure date
    if (departureDate > 0) {
      if (!isValidDepartureDate(departureDate)) {
        validation.departureValid = false;
        validation.departureMessage = "Departure date cannot be in the past";
      }
    }

    // Validate arrival date
    if (arrivalDate > 0 && departureDate > 0) {
      if (!isValidArrivalDate(departureDate, arrivalDate)) {
        validation.arrivalValid = false;
        validation.arrivalMessage = "Arrival must be after departure";
      }
    }

    setDateValidation(validation);
  }, [departureDate, arrivalDate]);

  const createTrip = useMutation(api.trip.createTrip);

  // Fixed date handlers
  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value; // "2024-08-25T14:30"

    if (!userInput) {
      setDepartureDate(0);
      return;
    }

    const utcTimestamp = convertSASTInputToUTC(userInput);
    if (utcTimestamp > 0) {
      setDepartureDate(utcTimestamp);
    } else {
      console.error("Error parsing departure date:", userInput);
      setDepartureDate(0);
    }
  };

  const handleArrivalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value; // "2024-08-25T18:00"

    if (!userInput) {
      setArrivalDate(0);
      return;
    }

    const utcTimestamp = convertSASTInputToUTC(userInput);
    if (utcTimestamp > 0) {
      setArrivalDate(utcTimestamp);
    } else {
      console.error("Error parsing arrival date:", userInput);
      setArrivalDate(0);
    }
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
    // Require payout account before allowing trip creation
    if (!payoutAccount) {
      alert(
        "You must set up a payout account before creating a trip. Please add a payout account in Settings > Payouts."
      );
      return;
    }
    if (!userId || !selectedFleetId || !selectedTruckId) {
      alert("Please select a fleet and truck");
      return;
    }

    if (!originCity || !destinationCity || !departureDate || !arrivalDate) {
      alert("Please fill in all required fields");
      return;
    }

    // Ensure we have valid timestamps
    if (departureDate <= 0 || arrivalDate <= 0) {
      alert("Please select valid departure and arrival dates");
      return;
    }

    // Check date validation
    if (!dateValidation.departureValid || !dateValidation.arrivalValid) {
      alert("Please fix the date validation errors before proceeding");
      return;
    }

    // Check availability one more time before creating
    if (truckAvailability && !truckAvailability.isAvailable) {
      alert(
        `This truck is not available during the selected time period. It conflicts with ${truckAvailability.conflictingTrips.length} existing trip(s).`
      );
      return;
    }

    try {
      await createTrip({
        userId,
        truckId: selectedTruckId,
        originCity,
        destinationCity,
        departureDate: departureDate.toString(),
        arrivalDate: arrivalDate.toString(),
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
      alert(
        `Failed to create trip: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Add this function to render availability status
  const renderTruckAvailabilityStatus = () => {
    if (!selectedTruckId || !departureDate || !arrivalDate) return null;

    if (truckAvailability === null) {
      return (
        <div className="bg-info/10 border border-info/20 rounded-lg p-3 mt-2">
          <div className="flex items-center gap-2">
            <div className="loading loading-spinner loading-sm"></div>
            <span className="text-sm text-base-content/70">
              Checking truck availability...
            </span>
          </div>
        </div>
      );
    }

    if (truckAvailability.isAvailable) {
      return (
        <div className="bg-success/10 border border-success/20 rounded-lg p-3 mt-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm text-success font-medium">
              Truck is available for selected dates
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3 mt-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-error" />
              <span className="text-sm text-error font-medium">
                Truck is not available
              </span>
            </div>
            <div className="text-xs text-base-content/60">
              Conflicts with {truckAvailability.conflictingTrips.length}{" "}
              existing trip(s):
              {truckAvailability.conflictingTrips.map((trip, index) => (
                <div
                  key={trip._id}
                  className="mt-1 pl-2 border-l-2 border-error/20"
                >
                  <div className="font-medium">
                    {trip.originCity} → {trip.destinationCity}
                  </div>
                  <div className="text-xs">
                    {/* Format conflicting trip times in SAST */}
                    {formatDateTimeInSAST(trip.departureDate)} -{" "}
                    {formatDateTimeInSAST(trip.arrivalDate)} (SAST)
                  </div>
                  <div className="text-xs">
                    Status: {trip.isBooked ? "Booked" : "Available for booking"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  // Add date validation message renderer
  const renderDateValidation = (field: "departure" | "arrival") => {
    const isValid =
      field === "departure"
        ? dateValidation.departureValid
        : dateValidation.arrivalValid;
    const message =
      field === "departure"
        ? dateValidation.departureMessage
        : dateValidation.arrivalMessage;

    if (isValid || !message) return null;

    return (
      <div className="text-error text-xs mt-1 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        {message}
      </div>
    );
  };

  // Add loading state handling
  if (!userId || !userFleets) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-base-content/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Get minimum datetime values
  const minDateTime = getCurrentSASTInputMin();
  const minArrivalDateTime =
    departureDate > 0 ? convertUTCToSASTInput(departureDate) : minDateTime;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-5xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8 pl-16 lg:pl-0">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.back()}
                className="btn btn-ghost btn-sm gap-2 text-base-content hover:bg-base-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="w-px h-6 bg-base-300"></div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                  Create New Trip
                </h1>
                <p className="text-base-content/60 mt-1">
                  Fill in the details below to create a new transportation
                  service
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="xl:col-span-2 space-y-6">
              {/* Route Information */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <Route className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-base-content">
                      Route Information
                    </h2>
                    <p className="text-sm text-base-content/60">
                      Define your trip's origin and destination
                    </p>
                    <div className="mt-3 rounded-xl border border-base-300 bg-base-200/50 p-3">
                      <p className="text-sm text-base-content/70">
                        Enter only the Origin CITY and Destination CITY. The
                        client will provide the exact pickup and delivery
                        addresses when booking.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Origin City
                      </span>
                    </label>
                    <AddressAutocomplete
                      value={originCity}
                      onChange={handleOriginSelection}
                      ready={pickup.ready}
                      inputValue={originInputValue}
                      onInputChange={handleOriginInputChange}
                      suggestions={pickup.suggestions}
                      status={pickup.status}
                      clearSuggestions={pickup.clearSuggestions}
                      label="Origin City"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-success" />
                        Destination City
                      </span>
                    </label>
                    <AddressAutocomplete
                      value={destinationCity}
                      onChange={handleDestinationSelection}
                      ready={delivery.ready}
                      inputValue={destinationInputValue}
                      onInputChange={handleDestinationInputChange}
                      suggestions={delivery.suggestions}
                      status={delivery.status}
                      clearSuggestions={delivery.clearSuggestions}
                      label="Destination City"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-info/10 rounded-lg border border-info/20">
                    <Calendar className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-base-content">
                      Schedule
                    </h2>
                    <p className="text-sm text-base-content/60">
                      Set your departure and arrival times (SAST timezone)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-info" />
                        Departure Date & Time (SAST)
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      className={`input input-bordered w-full focus:outline-none ${
                        !dateValidation.departureValid
                          ? "border-error focus:border-error"
                          : "focus:border-primary"
                      }`}
                      value={convertUTCToSASTInput(departureDate)}
                      onChange={handleDepartureChange}
                      min={minDateTime}
                    />
                    {renderDateValidation("departure")}
                  </div>

                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-success" />
                        Arrival Date & Time (SAST)
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      className={`input input-bordered w-full focus:outline-none ${
                        !dateValidation.arrivalValid
                          ? "border-error focus:border-error"
                          : "focus:border-primary"
                      }`}
                      value={convertUTCToSASTInput(arrivalDate)}
                      onChange={handleArrivalChange}
                      min={minArrivalDateTime}
                    />
                    {renderDateValidation("arrival")}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-base-content">
                      Pricing Structure
                    </h2>
                    <p className="text-sm text-base-content/60">
                      Configure your pricing with base price and variable rates
                    </p>
                  </div>
                </div>

                <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Settings className="w-4 h-4 text-warning mt-0.5" />
                    <div className="text-sm text-base-content/70">
                      <p className="font-medium mb-1">
                        Flexible Pricing Options:
                      </p>
                      <p>
                        Combine a fixed trip price with variable rates per KM or
                        KG to create your ideal pricing schema.
                      </p>
                      {/* Example block */}
                      <div className="mt-3 rounded-lg border border-base-300 bg-base-100/70 p-3">
                        <p className="font-medium text-base-content/80 mb-2">
                          Example
                        </p>
                        <ul className="list-disc ml-5 space-y-1">
                          <li>Fixed price: R500.00</li>
                          <li>Rate per KM: R2.50</li>
                          <li>Rate per KG: R0.80</li>
                          <li>Trip: 350 km, 800 kg</li>
                        </ul>
                        <div className="mt-2 text-sm">
                          <p>
                            Calculation: R500.00 + (350 × 2.50) + (800 × 0.80)
                          </p>
                          <p className="font-semibold text-base-content">
                            Total: R2,015.00
                          </p>
                        </div>
                        <p className="text-xs text-base-content/60 mt-2">
                          Leave input boxes empty if it doesn’t apply (e.g.,
                          only base price or only distance-based).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Base Price (R)
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-base-content/60 text-sm">R</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="input input-bordered w-full pl-8 focus:outline-none focus:border-primary"
                        value={basePrice || ""}
                        onChange={handleBasePrice}
                      />
                    </div>
                    <div className="label">
                      <span className="label-text-alt text-base-content/60">
                        Fixed trip cost
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Rate per KG (R/kg)
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-base-content/60 text-sm">R</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="input input-bordered w-full pl-8 focus:outline-none focus:border-primary"
                        value={KGPrice || ""}
                        onChange={handleKGPrice}
                      />
                    </div>
                    <div className="label">
                      <span className="label-text-alt text-base-content/60">
                        Per kg of cargo weight
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Rate per KM (R/km)
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-base-content/60 text-sm">R</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="input input-bordered w-full pl-8 focus:outline-none focus:border-primary"
                        value={KMPrice || ""}
                        onChange={handleKMPrice}
                      />
                    </div>
                    <div className="label">
                      <span className="label-text-alt text-base-content/60">
                        Per km of route distance
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fleet & Truck Selection */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-warning/10 rounded-lg border border-warning/20">
                    <Truck className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-base-content">
                      Fleet & Vehicle
                    </h2>
                    <p className="text-sm text-base-content/60">
                      Select the fleet and truck for this trip
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <Building className="w-4 h-4 text-warning" />
                        Select Fleet
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full focus:outline-none focus:border-primary"
                      value={selectedFleetId || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedFleetId(
                          value ? (value as Id<"fleet">) : null
                        );
                        setSelectedTruckId(null);
                      }}
                    >
                      <option value="">Choose a fleet</option>
                      {userFleets?.map((fleet) => (
                        <option key={fleet._id} value={fleet._id}>
                          {fleet.fleetName}
                        </option>
                      ))}
                    </select>
                    {!userFleets?.length && (
                      <div className="label">
                        <span className="label-text-alt text-error">
                          No fleets available. Create a fleet first.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <Truck className="w-4 h-4 text-warning" />
                        Select Truck
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full focus:outline-none focus:border-primary"
                      value={selectedTruckId || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedTruckId(
                          value ? (value as Id<"truck">) : null
                        );
                      }}
                      disabled={!selectedFleetId || fleetTruckIds.length === 0}
                    >
                      <option value="">Choose a truck</option>
                      {fleetTrucks?.map((truck) => (
                        <option key={truck._id} value={truck._id}>
                          {truck?.registration} - {truck.model}
                        </option>
                      ))}
                    </select>

                    {/* Add availability status here */}
                    {renderTruckAvailabilityStatus()}

                    {selectedFleetId && fleetTruckIds.length === 0 && (
                      <div className="label">
                        <span className="label-text-alt text-warning">
                          No trucks in selected fleet
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Preview & Actions */}
            <div className="space-y-6">
              {/* Trip Preview */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-info/10 rounded-lg border border-info/20">
                    <Package className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base-content">
                      Trip Preview
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Review your trip details
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Route */}
                  <div className="bg-base-200/50 border border-base-300 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Route className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Route</span>
                    </div>
                    <p className="text-sm text-base-content/70">
                      {originCity || "Origin"} →{" "}
                      {destinationCity || "Destination"}
                    </p>
                  </div>

                  {/* Schedule */}
                  {(departureDate > 0 || arrivalDate > 0) && (
                    <div className="bg-base-200/50 border border-base-300 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-info" />
                        <span className="text-sm font-medium">Schedule</span>
                      </div>
                      <div className="space-y-1 text-xs text-base-content/70">
                        {departureDate > 0 && (
                          <p>
                            Depart: {formatDateTimeInSAST(departureDate)} (SAST)
                          </p>
                        )}
                        {arrivalDate > 0 && (
                          <p>
                            Arrive: {formatDateTimeInSAST(arrivalDate)} (SAST)
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  {(basePrice > 0 || KGPrice > 0 || KMPrice > 0) && (
                    <div className="bg-base-200/50 border border-base-300 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium">Pricing</span>
                      </div>
                      <div className="space-y-1 text-xs text-base-content/70">
                        {basePrice > 0 && <p>Base: R{basePrice.toFixed(2)}</p>}
                        {KGPrice > 0 && <p>Per KG: R{KGPrice.toFixed(2)}</p>}
                        {KMPrice > 0 && <p>Per KM: R{KMPrice.toFixed(2)}</p>}
                      </div>
                    </div>
                  )}

                  {/* Vehicle */}
                  {selectedFleetId && selectedTruckId && (
                    <div className="bg-base-200/50 border border-base-300 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-warning" />
                        <span className="text-sm font-medium">Vehicle</span>
                      </div>
                      <div className="space-y-1 text-xs text-base-content/70">
                        <p>
                          Fleet:{" "}
                          {
                            userFleets?.find((f) => f._id === selectedFleetId)
                              ?.fleetName
                          }
                        </p>
                        <p>
                          Truck:{" "}
                          {
                            fleetTrucks?.find((t) => t._id === selectedTruckId)
                              ?.registration
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-6">
                  <button
                    className="btn btn-primary gap-2"
                    onClick={handleCreateTrip}
                    disabled={
                      !originCity ||
                      !destinationCity ||
                      !departureDate ||
                      !arrivalDate ||
                      !selectedFleetId ||
                      !selectedTruckId ||
                      !dateValidation.departureValid ||
                      !dateValidation.arrivalValid ||
                      (truckAvailability !== null &&
                        !truckAvailability.isAvailable)
                    }
                  >
                    <Plus className="w-4 h-4" />
                    Create Trip
                  </button>
                  <button
                    className="btn btn-ghost gap-2"
                    onClick={() => {
                      window.location.href = "/myTrips";
                    }}
                  >
                    <X className="w-4 h-4" />
                    Discard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTripPage;
