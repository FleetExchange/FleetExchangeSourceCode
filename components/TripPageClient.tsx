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
import { log } from "console";
import { useUser } from "@clerk/nextjs";
type DirectionsResult = google.maps.DirectionsResult;

interface TripPageClientProps {
  tripId: string;
}

const TripPageClient: React.FC<TripPageClientProps> = ({ tripId }) => {
  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const clerkId = user!.id;
  // User Id in Convex
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkId,
  })?._id;

  // Object of the trip being used
  const trip = useQuery(api.trip.getById, { tripId: tripId as Id<"trip"> });
  const truck = useQuery(api.truck.getTruckById, {
    truckId: trip?.truckId as Id<"truck">,
  });
  const tripIssuer = useQuery(api.users.getUserById, {
    userId: trip?.userId as Id<"users">,
  });

  // Consts for new trip data from client
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
    (trip?.basePrice ?? 0) + (trip?.variablePrice ?? 0) * distance;

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

    try {
      // Set trip to booked
      await bookTrip({ tripId: trip?._id as Id<"trip"> });
      setBooked(true);
      // Create trip purchase object
      await purchaseTrip({
        tripId: trip?._id as Id<"trip">,
        userId: userId as Id<"users">,
        amount: tripPrice,
        freightNotes: cargoDescription,
        logisticNotes: "${pickupInstructions} ${deliveryInstructions}",
      });

      alert("Trip booked successfully!");
      // Redirect to fleet manager page
      window.location.href = "/discover";
    } catch (error) {
      alert("Failed to book trip. Please try again.");
    }
  };

  // Cancel event handler
  const cancelTrip = useMutation(api.trip.setTripCancelled);
  const deletePurchaseTrip = useMutation(api.purchasetrip.deletePurchaseTrip);
  const handleCancelTrip = async () => {
    // Confrim cancellation

    try {
      // Set trip to cancelled
      await cancelTrip({ tripId: trip?._id as Id<"trip"> });
      setBooked(false);
      await deletePurchaseTrip({
        tripId: trip?._id as Id<"trip">,
      });
      alert("Trip cancelled successfully!");
      // Redirect to fleet manager page
      window.location.href = "/discover";
    } catch (error) {
      alert("Failed to cancel trip. Please try again.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full">
        <div className="row-span-2 col-span-2 bg-blue-400">
          <div className="flex flex-col gap-4 p-2">
            <h1>
              Trip: {trip?.originCity} to {trip?.destinationCity}
            </h1>
            <div className="flex flex-row gap-2 justify-evenly">
              <div>
                <h2>{trip?.originCity}</h2>
                <p>
                  {departureDateTime && (
                    <>
                      {departureDateTime.date} at {departureDateTime.time}
                    </>
                  )}
                </p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Pickup Address</legend>
                  <AddressAutocomplete
                    value={pickupAddress}
                    onChange={setPickupAddress}
                    ready={pickup.ready}
                    inputValue={pickup.value}
                    onInputChange={pickup.setValue}
                    suggestions={pickup.suggestions}
                    status={pickup.status}
                    clearSuggestions={pickup.clearSuggestions}
                    label="Pickup Address"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="$$fieldset-legend">
                    Pickup Instructions
                  </legend>
                  <textarea
                    className="textarea h-24"
                    placeholder="Type here"
                    value={pickupInstructions}
                    onChange={(e) => setPickupInstructions(e.target.value)}
                  ></textarea>
                </fieldset>
              </div>
              <div className="border-1 border-base-300"></div>
              <div>
                <h2>{trip?.destinationCity}</h2>
                <p>
                  {arrivalDateTime && (
                    <>
                      {arrivalDateTime.date} at {arrivalDateTime.time}
                    </>
                  )}
                </p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Delivery Address</legend>
                  <AddressAutocomplete
                    value={deliveryAddress}
                    onChange={setDeliveryAddress}
                    ready={delivery.ready}
                    inputValue={delivery.value}
                    onInputChange={delivery.setValue}
                    suggestions={delivery.suggestions}
                    status={delivery.status}
                    clearSuggestions={delivery.clearSuggestions}
                    label="Delivery Address"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="$$fieldset-legend">
                    Delivery Instructions
                  </legend>
                  <textarea
                    className="textarea h-24"
                    placeholder="Type here"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  ></textarea>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
        <div className="row-span-2 bg-green-300">
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
        <div className="col-span-2 bg-yellow-300">
          <div className="flex flex-row justify-evenly gap-4">
            <div className="flex flex-col gap-4">
              <div>
                <p>
                  Truck Info: {truck?.year} {truck?.make} {truck?.model}
                </p>
                <p> Truck Type: {truck?.truckType}</p>
              </div>
              <div className="grid grid-cols-2">
                <p>Length: {truck?.length}m </p>
                <p>Width: {truck?.width}m </p>
                <p>Height: {truck?.height}m </p>
                <p>Payload Capacity:{truck?.maxLoadCapacity}kg </p>
              </div>
            </div>

            <div>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Cargo Weight</legend>
                <input
                  type="number"
                  className="input"
                  placeholder="Type here"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(Number(e.target.value))}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="$$fieldset-legend">Cargo Description</legend>
                <textarea
                  className="textarea h-24"
                  placeholder="Type here"
                  value={cargoDescription}
                  onChange={(e) => setCargoDescription(e.target.value)}
                ></textarea>
              </fieldset>
            </div>
            <div>
              <p>Issuer Detials:</p>
              <p>{tripIssuer?.name}</p>
              <p>{tripIssuer?.email}</p>
            </div>
          </div>
        </div>
        <div className="bg-pink-400 p-4">
          <p>Base Price: R{trip?.basePrice}</p>
          <p>Distance: {distance.toFixed(2)} km</p>
          <p>Variable Price: R{trip?.variablePrice} / km</p>
          <p>Total: R{tripPrice.toFixed(2)}</p>
          {/**If the owner of the trip */}
          {userId === trip?.userId ? (
            <p> You are the trip issuer</p>
          ) : booked ? (
            <button className="btn btn-error" onClick={handleCancelTrip}>
              Cancel Booking
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleBookTrip}>
              Book Trip
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default TripPageClient;
