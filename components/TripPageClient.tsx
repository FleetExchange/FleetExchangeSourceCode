"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { usePlacesWithRestrictions } from "@/hooks/usePlacesWithRestrictions";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { useUser } from "@clerk/nextjs";
import TripCancelButton from "./TripCancelButton";
import { isAddressWithinRange } from "@/utils/geocoding";
import TripRatingComponent from "./TripRatingComponent";
import ProfileImage from "./ProfileImage";
import BookTripButton from "./BookTripButton";
import {
  MapPin,
  Package,
  Truck,
  User,
  Calendar,
  Clock,
  Route,
  FileText,
  Star,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  formatDateTimeInSAST,
  formatDateInSAST,
  formatTimeInSAST,
} from "@/utils/dateUtils";
import { getCachedCityCoordinates } from "../utils/cityCoordinatesCache";

type DirectionsResult = google.maps.DirectionsResult;

interface TripPageClientProps {
  tripId: string;
}

const TripPageClient: React.FC<TripPageClientProps> = ({ tripId }) => {
  const router = useRouter();

  // Get the logged in user identity
  const { user } = useUser();

  // Get user's Convex ID
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "skip",
  })?._id;

  // Object of the trip being used
  const trip = useQuery(api.trip.getById, {
    tripId: tripId as Id<"trip">,
  });

  // Only query truck if we have a truckId
  const truck = useQuery(
    api.truck.getTruckById,
    trip?.truckId ? { truckId: trip.truckId } : "skip"
  );

  // Only query trip issuer if we have a userId
  const tripIssuer = useQuery(
    api.users.getUserById,
    trip?.userId ? { userId: trip.userId as Id<"users"> } : "skip"
  );

  // Only query purchase details if we have a tripId
  const purchaseTripDetails = useQuery(
    api.purchasetrip.getPurchaseTripByTripId,
    {
      tripId: tripId as Id<"trip">,
    }
  );

  // State declarations
  const [booked, setBooked] = useState(trip?.isBooked ?? false);
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [cargoWeight, setCargoWeight] = useState<number>(0);
  const [cargoDescription, setCargoDescription] = useState("");
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [directionsKey, setDirectionsKey] = useState<string>("");
  const [hasDirectionsBeenFetched, setHasDirectionsBeenFetched] =
    useState(false);

  // Trip pricing calculations
  const variableKMPrice = (trip?.KMPrice ?? 0) * distance;
  const variableKGPrice = (trip?.KGPrice ?? 0) * cargoWeight;
  const tripPriceWithoutFees =
    (trip?.basePrice ?? 0) + variableKGPrice + variableKMPrice; // As transporter intended
  const tripFees = tripPriceWithoutFees * 0.05; // 5% commission
  const fullTripPrice = tripPriceWithoutFees + tripFees; // What the client pays

  // Get whether the trip is booked or not
  useEffect(() => {
    if (trip?.isBooked !== undefined) {
      setBooked(trip.isBooked);
    }
  }, [trip?.isBooked]);

  // Updated to use SAST formatting utilities
  const formatDateTime = (dateInput: string | number) => {
    if (!dateInput) return null;
    return formatDateTimeInSAST(Number(dateInput));
  };

  // Google Maps helper functions

  // Coordinates state
  const [pickupCoords, setPickupCoords] = useState({
    lat: -26.2041,
    lng: 28.0473,
  });
  const [deliveryCoords, setDeliveryCoords] = useState({
    lat: -26.2041,
    lng: 28.0473,
  });

  // Update coordinates when trip data loads
  useEffect(() => {
    if (trip?.originCity) {
      getCachedCityCoordinates(trip.originCity).then(setPickupCoords);
    }
    if (trip?.destinationCity) {
      getCachedCityCoordinates(trip.destinationCity).then(setDeliveryCoords);
    }
  }, [trip?.originCity, trip?.destinationCity]);

  // Places autocomplete hooks
  const pickup = usePlacesWithRestrictions({ cityName: trip?.originCity });
  const delivery = usePlacesWithRestrictions({
    cityName: trip?.destinationCity,
  });

  // Mutations
  const bookTrip = useMutation(api.trip.setTripBooked);
  const purchaseTrip = useMutation(api.purchasetrip.createPurchaseTrip);
  const setTripAdresses = useMutation(api.trip.setTripAddresses);

  // Address validation
  const validateAddress = async (
    address: string,
    cityName: string,
    type: "pickup" | "delivery"
  ): Promise<boolean> => {
    const isValid = await isAddressWithinRange(address, cityName);

    if (!isValid) {
      alert(
        `The selected ${type} address is too far from ${cityName}. Please select an address within 100km of the city.`
      );
      return false;
    }
    return true;
  };

  // Book trip handler
  const handleBookTrip = async (): Promise<string> => {
    if (!truck) {
      alert("Truck information is not available. Please try again.");
      return "";
    }

    if (
      !pickupAddress ||
      !pickupInstructions ||
      !deliveryAddress ||
      !deliveryInstructions ||
      !cargoDescription ||
      (!cargoWeight && cargoWeight >= 0)
    ) {
      alert("Please fill all fields");
      return "";
    }

    if (cargoWeight > truck.maxLoadCapacity) {
      alert("The cargo weight exceeds the truck's maximum load capacity.");
      return "";
    }

    const isPickupValid = await validateAddress(
      pickupAddress,
      trip?.originCity || "",
      "pickup"
    );
    const isDeliveryValid = await validateAddress(
      deliveryAddress,
      trip?.destinationCity || "",
      "delivery"
    );

    if (!isPickupValid || !isDeliveryValid) {
      return "";
    }

    try {
      await bookTrip({ tripId: trip?._id as Id<"trip"> });
      setBooked(true);
      await setTripAdresses({
        tripId: trip?._id as Id<"trip">,
        originAdress: pickupAddress,
        destinationAddress: deliveryAddress,
      });
      const PurchaseTripId = await purchaseTrip({
        tripId: trip?._id as Id<"trip">,
        userId: userId as Id<"users">,

        clientPayable: fullTripPrice, // Final amount of the sale to be paid by the client
        tripTotal: tripPriceWithoutFees, // Total cost of the trip as specified by the transporter
        transporterAmount: tripPriceWithoutFees - tripFees, // Amount the transporter will receive after commission
        commissionAmount: tripFees, // Amount the platform will take as commission
        commissionPercentage: 5, // Percentage of the commission
        distance: distance,
        pickupInstructions: pickupInstructions,
        deliveryInstructions: deliveryInstructions,
        freightNotes: cargoDescription,
        cargoWeight: cargoWeight,
      });

      return PurchaseTripId || "";
    } catch (error) {
      alert("Failed to book trip. Please try again.");
      return "";
    }
  };

  // Update form fields when trip is booked
  useEffect(() => {
    if (!trip) return;

    setBooked(trip.isBooked ?? false);

    if (trip.isBooked && purchaseTripDetails) {
      setPickupAddress(trip.originAddress || "");
      setDeliveryAddress(trip.destinationAddress || "");
      setPickupInstructions(purchaseTripDetails.pickupInstructions || "");
      setDeliveryInstructions(purchaseTripDetails.deliveryInstructions || "");
      setCargoDescription(purchaseTripDetails.freightNotes || "");
      setCargoWeight(purchaseTripDetails.cargoWeight || 0);
      setDistance(purchaseTripDetails.distance || 0);
      if (trip.originAddress) pickup.setValue(trip.originAddress);
      if (trip.destinationAddress) delivery.setValue(trip.destinationAddress);
    }
  }, [trip, purchaseTripDetails]);

  // Extract action button logic into a helper function
  const renderActionButton = () => {
    // Loading state
    if (!trip || !userId) {
      return (
        <div className="flex justify-center py-4">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      );
    }

    // Trip owner
    if (userId === trip.userId) {
      return (
        <div className="bg-info/10 border border-info/20 rounded-lg p-4 text-center">
          <p className="text-sm text-base-content/70">
            You are the trip issuer
          </p>
        </div>
      );
    }

    // Trip is booked by current user
    if (booked && purchaseTripDetails) {
      // Delivered - show rating
      if (purchaseTripDetails.status === "Delivered") {
        return <TripRatingComponent purchaseTripId={purchaseTripDetails._id} />;
      }

      // Dispatched - cannot cancel
      if (purchaseTripDetails.status === "Dispatched") {
        return (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-center">
            <p className="text-sm text-base-content/70">
              Trip is in transit - cannot be cancelled
            </p>
          </div>
        );
      }

      // Can cancel (Awaiting Confirmation, Booked)
      if (
        ["Awaiting Confirmation", "Booked"].includes(purchaseTripDetails.status)
      ) {
        return (
          <TripCancelButton
            userId={userId}
            tripId={trip._id}
            currentStatus={purchaseTripDetails.status}
          />
        );
      }

      // Other statuses
      return (
        <div className="bg-base-200/50 border border-base-300 rounded-lg p-4 text-center">
          <p className="text-sm text-base-content/70">
            Status: {purchaseTripDetails.status}
          </p>
        </div>
      );
    }

    // Available for booking
    return (
      <BookTripButton
        trip={{
          tripId: trip?._id as Id<"trip">,
          price: tripPriceWithoutFees,
          transporterId: trip?.userId,
        }}
        user={{
          _id: userId,
          email: user?.emailAddresses[0]?.emailAddress,
        }}
        onBookTrip={handleBookTrip}
      />
    );
  };

  // Only create new directions request when addresses actually change
  const directionsOptions = useMemo(() => {
    if (!trip?.originCity && !pickupAddress) return null;
    if (!trip?.destinationCity && !deliveryAddress) return null;

    const origin = pickupAddress || `${trip?.originCity}, South Africa`;
    const destination =
      deliveryAddress || `${trip?.destinationCity}, South Africa`;
    const newKey = `${origin}-${destination}`;

    // Don't create new request if addresses haven't changed
    if (newKey === directionsKey || hasDirectionsBeenFetched) return null;

    console.log("🚨 NEW DIRECTIONS API CALL:", newKey); // Remove after testing

    return {
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    };
  }, [
    trip?.originCity,
    trip?.destinationCity,
    pickupAddress,
    deliveryAddress,
    directionsKey,
    hasDirectionsBeenFetched,
  ]);

  const handleDirectionsCallback = useCallback(
    (response: any, status: string) => {
      if (response !== null && status === "OK") {
        setDirections(response);
        const distanceInKm =
          response.routes?.[0]?.legs?.[0]?.distance?.value != null
            ? response.routes[0].legs[0].distance.value / 1000
            : 0;
        setDistance(distanceInKm);

        // Mark as fetched and update key
        const origin = pickupAddress || `${trip?.originCity}, South Africa`;
        const destination =
          deliveryAddress || `${trip?.destinationCity}, South Africa`;
        setDirectionsKey(`${origin}-${destination}`);
        setHasDirectionsBeenFetched(true);

        console.log(
          "✅ DIRECTIONS API SUCCESS:",
          response.routes[0].legs[0].distance.text
        );
      }
    },
    [trip?.originCity, trip?.destinationCity, pickupAddress, deliveryAddress]
  );

  // Reset when trip changes
  useEffect(() => {
    setHasDirectionsBeenFetched(false);
    setDirectionsKey("");
  }, [tripId]);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-7xl mx-auto">
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
                  Trip Details
                </h1>
                <p className="text-base-content/60 mt-1">
                  Review and book this transportation service • Times in SAST
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Route Overview with SAST formatting */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Route className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  {trip?.originCity} → {trip?.destinationCity}
                </h2>
                <p className="text-sm text-base-content/60">
                  Trip route and schedule (SAST)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Origin */}
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                  <div className="p-1 bg-primary/10 rounded-lg border border-primary/20">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-base-content/60">
                    Departure
                  </span>
                </div>
                <h3 className="text-lg font-bold text-base-content mb-2">
                  {trip?.originCity}
                </h3>
                {trip?.departureDate ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 justify-center md:justify-start text-sm text-base-content/70">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateInSAST(trip.departureDate)}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center md:justify-start text-sm font-medium text-primary">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeInSAST(trip.departureDate)} SAST</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-base-content/60">TBD</div>
                )}
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="p-3 bg-info/10 rounded-full border border-info/20">
                  <ArrowRight className="w-6 h-6 text-info" />
                </div>
              </div>

              {/* Destination */}
              <div className="text-center md:text-right">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-end">
                  <span className="text-sm font-medium text-base-content/60">
                    Arrival
                  </span>
                  <div className="p-1 bg-success/10 rounded-lg border border-success/20">
                    <MapPin className="w-4 h-4 text-success" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-base-content mb-2">
                  {trip?.destinationCity}
                </h3>
                {trip?.arrivalDate ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 justify-center md:justify-end text-sm text-base-content/70">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateInSAST(trip.arrivalDate)}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center md:justify-end text-sm font-medium text-success">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeInSAST(trip.arrivalDate)} SAST</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-base-content/60">TBD</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Details */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-warning/10 rounded-lg border border-warning/20">
                    <MapPin className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content">
                      Address Details
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Pickup and delivery locations
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pickup */}
                  <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1 bg-primary/10 rounded-lg border border-primary/20">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <h4 className="font-semibold text-base-content">
                        Pickup Location
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Address
                          </span>
                        </label>
                        <AddressAutocomplete
                          value={pickupAddress || ""}
                          onChange={(address) => {
                            setPickupAddress(address || "");
                            pickup.setValue(address || ""); // KEEP: only on select
                          }}
                          disabled={booked}
                          ready={pickup.ready}
                          inputValue={pickup.value || ""}
                          onInputChange={(value) =>
                            pickup.setValue(value || "")
                          }
                          suggestions={pickup.suggestions}
                          status={pickup.status}
                          clearSuggestions={pickup.clearSuggestions}
                          label="Pickup Address"
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Instructions
                          </span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered w-full focus:outline-none focus:border-primary"
                          placeholder="Special pickup instructions"
                          value={pickupInstructions}
                          onChange={(e) =>
                            setPickupInstructions(e.target.value)
                          }
                          disabled={booked}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1 bg-success/10 rounded-lg border border-success/20">
                        <MapPin className="w-4 h-4 text-success" />
                      </div>
                      <h4 className="font-semibold text-base-content">
                        Delivery Location
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Address
                          </span>
                        </label>
                        <AddressAutocomplete
                          value={deliveryAddress || ""}
                          onChange={(address) => {
                            setDeliveryAddress(address || "");
                            delivery.setValue(address || ""); // KEEP: only on select
                          }}
                          disabled={booked}
                          ready={delivery.ready}
                          inputValue={delivery.value || ""}
                          onInputChange={(value) =>
                            delivery.setValue(value || "")
                          }
                          suggestions={delivery.suggestions}
                          status={delivery.status}
                          clearSuggestions={delivery.clearSuggestions}
                          label="Delivery Address"
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Instructions
                          </span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered w-full focus:outline-none focus:border-primary"
                          placeholder="Special delivery instructions"
                          value={deliveryInstructions}
                          onChange={(e) =>
                            setDeliveryInstructions(e.target.value)
                          }
                          disabled={booked}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-info/5 border border-info/20 rounded-xl p-4 mt-6">
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <Route className="w-4 h-4 text-info" />
                    <span>
                      Total Distance:{" "}
                      <span className="font-semibold">
                        {distance.toFixed(2)} km
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Cargo Details */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-info/10 rounded-lg border border-info/20">
                    <Package className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content">
                      Cargo Information
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Weight and description of your cargo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">
                        Weight (kg)
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="input input-bordered w-full focus:outline-none focus:border-primary"
                      placeholder="Enter cargo weight"
                      value={cargoWeight}
                      onChange={(e) => setCargoWeight(Number(e.target.value))}
                      disabled={booked}
                    />
                    {truck && (
                      <div className="label">
                        <span className="label-text-alt text-base-content/60">
                          Max capacity: {truck.maxLoadCapacity} kg
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">
                        Description
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full focus:outline-none focus:border-primary"
                      placeholder="Describe your cargo"
                      value={cargoDescription}
                      onChange={(e) => setCargoDescription(e.target.value)}
                      disabled={booked}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle & Transporter Info */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-warning/10 rounded-lg border border-warning/20">
                    <Truck className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content">
                      Vehicle & Transporter
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Vehicle specifications and driver information
                    </p>
                  </div>
                </div>

                {/* Vehicle Specs */}
                <div className="bg-base-200/50 border border-base-300 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-base-content mb-4 text-center">
                    {truck?.year} {truck?.make} {truck?.model} -{" "}
                    {truck?.truckType}
                  </h4>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-base-100 rounded-lg p-3 text-center border border-base-300">
                      <div className="w-4 h-4 mx-auto mb-1 text-primary font-bold">
                        L
                      </div>
                      <p className="text-xs text-base-content/60">Length</p>
                      <p className="text-sm font-semibold text-base-content">
                        {truck?.length}m
                      </p>
                    </div>
                    <div className="bg-base-100 rounded-lg p-3 text-center border border-base-300">
                      <div className="w-4 h-4 mx-auto mb-1 text-primary font-bold">
                        W
                      </div>
                      <p className="text-xs text-base-content/60">Width</p>
                      <p className="text-sm font-semibold text-base-content">
                        {truck?.width}m
                      </p>
                    </div>
                    <div className="bg-base-100 rounded-lg p-3 text-center border border-base-300">
                      <div className="w-4 h-4 mx-auto mb-1 text-primary font-bold">
                        H
                      </div>
                      <p className="text-xs text-base-content/60">Height</p>
                      <p className="text-sm font-semibold text-base-content">
                        {truck?.height}m
                      </p>
                    </div>
                    <div className="bg-base-100 rounded-lg p-3 text-center border border-base-300">
                      <Package className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-xs text-base-content/60">Max Load</p>
                      <p className="text-sm font-semibold text-base-content">
                        {truck?.maxLoadCapacity}kg
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transporter Info */}
                <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ProfileImage
                          fileUrl={tripIssuer?.profileImageUrl}
                          size={48}
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-base-100"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base-content">
                          {tripIssuer?.name}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-base-content/60">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          <span>
                            {tripIssuer?.averageRating} (
                            {tripIssuer?.ratingCount} reviews)
                          </span>
                        </div>
                        <p className="text-sm text-base-content/60">
                          {tripIssuer?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline btn-sm gap-2"
                      onClick={() =>
                        (window.location.href = `/profiles/${tripIssuer?._id}`)
                      }
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Map */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
                <div className="p-4 border-b border-base-300">
                  <div className="flex items-center gap-2">
                    <Route className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-base-content">
                      Route Map
                    </h3>
                  </div>
                </div>
                <div style={{ height: "400px", width: "100%" }}>
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    options={{
                      zoomControl: false,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                      gestureHandling: "none",
                      clickableIcons: false,
                      mapTypeId: google.maps.MapTypeId.ROADMAP,
                    }}
                    zoom={7}
                    center={pickupCoords}
                    onClick={(e) => {}}
                    onLoad={(map) => {
                      window.google.maps.event.trigger(map, "resize");
                    }}
                  >
                    {directionsOptions && (
                      <DirectionsService
                        options={directionsOptions}
                        callback={handleDirectionsCallback}
                      />
                    )}
                    {directions && (
                      <DirectionsRenderer
                        options={{
                          suppressMarkers: false,
                          preserveViewport: false,
                          draggable: true,
                        }}
                        directions={directions}
                      />
                    )}
                  </GoogleMap>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                    <FileText className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base-content">
                      Price Breakdown
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Trip cost details
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Base Price */}
                  {Number(trip?.basePrice) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-base-content/70">Base Price:</span>
                      <span className="font-medium">
                        R{Number(trip?.basePrice).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* KG pricing */}
                  {Number(trip?.KGPrice) > 0 && cargoWeight > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">
                          Rate per KG:
                        </span>
                        <span>R{Number(trip?.KGPrice).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">
                          Weight ({cargoWeight}kg):
                        </span>
                        <span>
                          R{(Number(trip?.KGPrice) * cargoWeight).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* KM pricing */}
                  {Number(trip?.KMPrice) > 0 && distance > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">
                          Rate per KM:
                        </span>
                        <span>R{Number(trip?.KMPrice).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">
                          Distance ({distance.toFixed(1)}km):
                        </span>
                        <span>
                          R{(Number(trip?.KMPrice) * distance).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/70">
                      Service Fees (5%):
                    </span>
                    <span>R{tripFees.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-base-300 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-success">
                        R{fullTripPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">{renderActionButton()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPageClient;
