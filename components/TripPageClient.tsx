import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
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
type DirectionsResult = google.maps.DirectionsResult;

interface TripPageClientProps {
  tripId: string;
}

const TripPageClient: React.FC<TripPageClientProps> = ({ tripId }) => {
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
  const tripPrice =
    (trip?.basePrice ?? 0) + (trip?.variablePrice ?? 0) * cargoWeight;

  // Get whether the trip is booked or not
  useEffect(() => {
    if (trip?.isBooked !== undefined) {
      setBooked(trip.isBooked);
    }
  }, [trip?.isBooked]);

  // Format date and time
  const formatDateTime = (dateInput: string | number) => {
    const date = new Date(dateInput);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const departureDateTime = trip?.departureDate
    ? formatDateTime(trip.departureDate)
    : null;
  const arrivalDateTime = trip?.arrivalDate
    ? formatDateTime(trip.arrivalDate)
    : null;

  //
  //  Google Maps API Section
  //
  //
  // First, add these helper functions at the top of your component
  const getCityCoordinates = async (cityName: string) => {
    try {
      const results = await getGeocode({
        address: `${cityName}, South Africa`,
      });
      return getLatLng(results[0]);
    } catch (error) {
      console.error("Error getting coordinates for city:", error);
      return { lat: -26.2041, lng: 28.0473 }; // Fallback to Johannesburg
    }
  };

  // Update the Places Autocomplete setup
  const [pickupCoords, setPickupCoords] = useState({
    lat: -26.2041,
    lng: 28.0473,
  });
  const [deliveryCoords, setDeliveryCoords] = useState({
    lat: -26.2041,
    lng: 28.0473,
  });

  // Add this effect to update coordinates when trip data loads
  useEffect(() => {
    if (trip?.originCity) {
      getCityCoordinates(trip.originCity).then(setPickupCoords);
    }
    if (trip?.destinationCity) {
      getCityCoordinates(trip.destinationCity).then(setDeliveryCoords);
    }
  }, [trip?.originCity, trip?.destinationCity]);

  const pickup = usePlacesWithRestrictions({ cityName: trip?.originCity });
  const delivery = usePlacesWithRestrictions({
    cityName: trip?.destinationCity,
  });

  // First, add this style to ensure the map container is properly sized
  const mapContainerStyle = {
    width: "100%",
    height: "600px",
    position: "relative" as const,
  };

  // Book event handler
  const bookTrip = useMutation(api.trip.setTripBooked);
  const purchaseTrip = useMutation(api.purchasetrip.createPurchaseTrip);
  const setTripAdresses = useMutation(api.trip.setTripAddresses);

  // Add this validation function inside your component
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

  const handleBookTrip = async () => {
    // Check if truck data is loaded
    if (!truck) {
      alert("Truck information is not available. Please try again.");
      return;
    }

    // Validate all required fields
    if (
      !pickupAddress ||
      !pickupInstructions ||
      !deliveryAddress ||
      !deliveryInstructions ||
      !cargoDescription ||
      (!cargoWeight && cargoWeight >= 0)
    ) {
      alert("Please fill all fields");
      return;
    }

    // Make sure cargo weight is below the max load capacity
    // Now TypeScript knows truck is defined
    if (cargoWeight > truck.maxLoadCapacity) {
      alert("The cargo weight exceeds the truck's maximum load capacity.");
      return;
    }

    // Validate addresses are within range
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
      return;
    }

    try {
      // Set trip to booked
      await bookTrip({ tripId: trip?._id as Id<"trip"> });
      setBooked(true);
      // Update trips origin and destination addresses
      await setTripAdresses({
        tripId: trip?._id as Id<"trip">,
        originAdress: pickupAddress,
        destinationAddress: deliveryAddress,
      });
      // Create trip purchase object
      await purchaseTrip({
        tripId: trip?._id as Id<"trip">,
        userId: userId as Id<"users">,
        amount: tripPrice,
        pickupInstructions: pickupInstructions,
        deliveryInstructions: deliveryInstructions,
        freightNotes: cargoDescription,
        cargoWeight: cargoWeight,
      });

      alert("Trip booked successfully!");
      // Redirect to fleet manager page
      window.location.href = "/discover";
    } catch (error) {
      alert("Failed to book trip. Please try again.");
    }
  };

  // Combine the effects and add better dependency control
  useEffect(() => {
    // Only update if we have trip data
    if (!trip) return;

    // Update booked state
    setBooked(trip.isBooked ?? false);

    // Only update form fields if trip is booked and we have purchase details
    if (trip.isBooked && purchaseTripDetails) {
      setPickupAddress(trip.originAddress || "");
      setDeliveryAddress(trip.destinationAddress || "");
      setPickupInstructions(purchaseTripDetails.pickupInstructions || "");
      setDeliveryInstructions(purchaseTripDetails.deliveryInstructions || "");
      setCargoDescription(purchaseTripDetails.freightNotes || "");
      setCargoWeight(purchaseTripDetails.cargoWeight || 0);

      // Update autocomplete values
      if (trip.originAddress) pickup.setValue(trip.originAddress);
      if (trip.destinationAddress) delivery.setValue(trip.destinationAddress);
    }
  }, [trip, purchaseTripDetails]); // Simplified dependencies

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-3 grid-rows-3 gap-6">
        {/* Main Trip Information Section */}
        <div className="row-span-2 col-span-2 bg-base-200 rounded-lg shadow-lg">
          <div className="p-6 space-y-6">
            <h1 className="text-3xl font-semibold text-base-content">
              Trip: {trip?.originCity} to {trip?.destinationCity}
            </h1>

            <div className="flex justify-between gap-8">
              {/* Pickup Section */}
              <div className="flex-1 space-y-4">
                <div className="bg-base-100 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">
                    {trip?.originCity}
                  </h2>
                  <p className="text-base-content/80">
                    {departureDateTime && (
                      <span>
                        {departureDateTime.date} at {departureDateTime.time}
                      </span>
                    )}
                  </p>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-base font-medium">
                    Pickup Address
                  </legend>
                  <AddressAutocomplete
                    value={pickupAddress || ""} // Ensure we never pass null
                    onChange={(address) => {
                      // Just update the value without validation
                      setPickupAddress(address || "");
                      pickup.setValue(address || ""); // Add this line to update the input value
                    }}
                    ready={pickup.ready}
                    inputValue={pickup.value || ""} // Ensure we never pass null
                    onInputChange={(value) => {
                      pickup.setValue(value || "");
                      // Don't update pickupAddress here, wait for selection
                    }}
                    suggestions={pickup.suggestions}
                    status={pickup.status}
                    clearSuggestions={pickup.clearSuggestions}
                    label="Pickup Address"
                    onBlur={async () => {
                      if (pickupAddress) {
                        const isValid = await validateAddress(
                          pickupAddress,
                          trip?.originCity || "",
                          "pickup"
                        );
                        if (!isValid) {
                          setPickupAddress("");
                          pickup.setValue("");
                        }
                      }
                    }}
                  />
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="text-base font-medium">
                    Pickup Instructions
                  </legend>
                  <textarea
                    className="textarea textarea-bordered w-full h-24 focus:outline-none focus:ring-0"
                    placeholder="Enter pickup instructions"
                    value={pickupInstructions}
                    onChange={(e) => setPickupInstructions(e.target.value)}
                  />
                </fieldset>
              </div>

              <div className="w-px bg-base-300" />

              {/* Delivery Section */}
              <div className="flex-1 space-y-4">
                <div className="bg-base-100 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">
                    {trip?.destinationCity}
                  </h2>
                  <p className="text-base-content/80">
                    {arrivalDateTime && (
                      <span>
                        {arrivalDateTime.date} at {arrivalDateTime.time}
                      </span>
                    )}
                  </p>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-base font-medium">
                    Delivery Address
                  </legend>
                  <AddressAutocomplete
                    value={deliveryAddress || ""} // Ensure we never pass null
                    onChange={(address) => {
                      setDeliveryAddress(address || "");
                      delivery.setValue(address || ""); // Add this line to update the input value
                    }}
                    ready={delivery.ready}
                    inputValue={delivery.value || ""} // Ensure we never pass null
                    onInputChange={(value) => {
                      delivery.setValue(value || "");
                      // Don't update deliveryAddress here, wait for selection
                    }}
                    suggestions={delivery.suggestions}
                    status={delivery.status}
                    clearSuggestions={delivery.clearSuggestions}
                    label="Delivery Address"
                    onBlur={async () => {
                      if (deliveryAddress) {
                        const isValid = await validateAddress(
                          deliveryAddress,
                          trip?.destinationCity || "",
                          "delivery"
                        );
                        if (!isValid) {
                          setDeliveryAddress("");
                          delivery.setValue("");
                        }
                      }
                    }}
                  />
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="text-base font-medium">
                    Delivery Instructions
                  </legend>
                  <textarea
                    className="textarea textarea-bordered w-full h-24 focus:outline-none focus:ring-0"
                    placeholder="Enter delivery instructions"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  />
                </fieldset>
              </div>
            </div>
            <p className="flex justify-between">
              <span>Distance:</span>
              <span>{distance.toFixed(2)} km</span>
            </p>
          </div>
        </div>

        {/* Map Section */}
        <div className="row-span-2 bg-base-200 rounded-lg shadow-lg overflow-hidden">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            options={{
              zoomControl: true,
              streetViewControl: true,
              mapTypeControl: true,
              fullscreenControl: true,
              gestureHandling: "greedy", // Changed from cooperative to greedy
              clickableIcons: false,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
            }}
            zoom={7}
            center={pickupCoords}
            onClick={(e) => {
              // Add click handler if needed
            }}
            onLoad={(map) => {
              // Trigger a resize event after the map loads
              window.google.maps.event.trigger(map, "resize");
            }}
          >
            {(trip?.originCity || pickupAddress) &&
              (trip?.destinationCity || deliveryAddress) && (
                <DirectionsService
                  options={{
                    origin:
                      pickupAddress || `${trip?.originCity}, South Africa`,
                    destination:
                      deliveryAddress ||
                      `${trip?.destinationCity}, South Africa`,
                    travelMode: google.maps.TravelMode.DRIVING,
                  }}
                  callback={(response, status) => {
                    if (response !== null && status === "OK") {
                      setDirections(response);
                      // Get distance in kilometers (converts from meters)
                      const distanceInKm =
                        response.routes?.[0]?.legs?.[0]?.distance?.value != null
                          ? response.routes[0].legs[0].distance.value / 1000
                          : 0;
                      setDistance(distanceInKm);
                    }
                  }}
                />
              )}
            {directions && (
              <DirectionsRenderer
                options={{
                  suppressMarkers: false,
                  preserveViewport: false,
                  draggable: true, // Allow route dragging
                }}
                directions={directions}
              />
            )}
          </GoogleMap>
        </div>

        {/* Trip Details Section */}
        <div className="col-span-2 bg-base-200 rounded-lg shadow-lg p-6">
          <div className="flex justify-between gap-8">
            {/* Truck Information */}
            <div className="space-y-4">
              <div className="bg-base-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Truck Details</h3>
                <p className="mb-2">
                  {truck?.year} {truck?.make} {truck?.model} -{" "}
                  {truck?.truckType}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p>Length: {truck?.length}m</p>
                  <p>Width: {truck?.width}m</p>
                  <p>Height: {truck?.height}m</p>
                  <p>Max Load: {truck?.maxLoadCapacity}kg</p>
                </div>
              </div>
            </div>

            {/* Cargo Information */}
            <div className="space-y-4">
              <fieldset className="space-y-2">
                <legend className="text-base font-medium">
                  Cargo Weight (kg)
                </legend>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered w-full focus:outline-none focus:ring-0"
                  placeholder="Enter cargo weight"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(Number(e.target.value))}
                />
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-base font-medium">
                  Cargo Description
                </legend>
                <textarea
                  className="textarea textarea-bordered w-full h-24 focus:outline-none focus:ring-0"
                  placeholder="Describe your cargo"
                  value={cargoDescription}
                  onChange={(e) => setCargoDescription(e.target.value)}
                />
              </fieldset>
            </div>

            {/* Issuer Details */}
            <div className="bg-base-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Trip Issuer</h3>
              <p className="mb-1">{tripIssuer?.name}</p>
              <p className="text-base-content/80">{tripIssuer?.email}</p>
            </div>
          </div>
        </div>

        {/* Price and Action Section */}
        <div className="bg-base-200 rounded-lg shadow-lg p-6">
          <div className="space-y-2 mb-4">
            <p className="flex justify-between">
              <span>Base Price:</span>
              <span className="font-semibold">R{trip?.basePrice}</span>
            </p>
            <p className="flex justify-between">
              <span>Rate per kg:</span>
              <span>R{trip?.variablePrice}</span>
            </p>
            <div className="border-t border-base-300 my-2" />
            <p className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>R{tripPrice.toFixed(2)}</span>
            </p>
          </div>

          <div className="flex justify-center">
            {!trip || !userId ? (
              <div className="loading loading-spinner"></div>
            ) : userId === trip.userId ? (
              <p className="text-base-content/80">You are the trip issuer</p>
            ) : booked && purchaseTripDetails ? (
              purchaseTripDetails.status === "Delivered" ? (
                <TripRatingComponent purchaseTripId={purchaseTripDetails._id} />
              ) : (
                <TripCancelButton
                  purchaseTripId={purchaseTripDetails._id}
                  tripId={trip._id}
                  currentStatus={purchaseTripDetails.status}
                />
              )
            ) : (
              <button
                className="btn btn-primary btn-wide"
                onClick={handleBookTrip}
                disabled={!trip}
              >
                Book Trip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPageClient;
