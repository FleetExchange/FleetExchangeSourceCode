"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePlacesWithRestrictions } from "@/hooks/usePlacesWithRestrictions";
import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
} from "@react-google-maps/api";
// Import DirectionsResult type from Google Maps types
// @ts-ignore
import { DirectionsResult } from "@types/googlemaps";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import StatusAdvanceButton from "./StatusAdvanceButton";
import { TripStatus } from "./StatusAdvanceButton";
import TripRejectButton from "./TripRejectButton";
import TripCancelButton from "./TripCancelButton";

interface TripPageClientProps {
  tripId: string;
}

const TripPageOwner: React.FC<TripPageClientProps> = ({ tripId }) => {
  // Use States
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [distance, setDistance] = useState<number>(0);

  // Get the trip object
  const trip = useQuery(api.trip.getById, { tripId: tripId as Id<"trip"> });
  // Get the purchaseTrip object
  const purchaseTrip = useQuery(api.purchasetrip.getPurchaseTripByTripId, {
    tripId: tripId as Id<"trip">,
  });
  // Get the truck objecr from trip
  const truck = useQuery(api.truck.getTruckById, {
    truckId: trip?.truckId as Id<"truck">,
  });

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

  const tripPrice =
    (trip?.basePrice ?? 0) + (trip?.variablePrice ?? 0) * distance;

  const deleteTrip = useMutation(api.trip.deleteTripById);
  const handleDeleteTrip = async () => {
    try {
      await deleteTrip({ tripId: tripId as Id<"trip"> });
      // Optionally: Add a success message or redirect
      alert("Trip deleted successfully.");
      // Redirect to myTrips page
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete trip:", error);
      alert("Failed to delete trip. Please try again.");
    }
  };

  return (
    <div>
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
                    {purchaseTrip !== null ? (
                      <p>{trip?.originAddress}</p>
                    ) : (
                      <p>N/A</p>
                    )}
                  </fieldset>

                  <fieldset className="space-y-2">
                    <legend className="text-base font-medium">
                      Pickup Instructions
                    </legend>
                    {purchaseTrip !== null ? (
                      <p>{purchaseTrip?.pickupInstructions}</p>
                    ) : (
                      <p>N/A</p>
                    )}
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
                    {purchaseTrip !== null ? (
                      <p>{trip?.destinationAddress}</p>
                    ) : (
                      <p>N/A</p>
                    )}
                  </fieldset>

                  <fieldset className="space-y-2">
                    <legend className="text-base font-medium">
                      Delivery Instructions
                    </legend>
                    {purchaseTrip !== null ? (
                      <p>{purchaseTrip?.deliveryInstructions}</p>
                    ) : (
                      <p>N/A</p>
                    )}
                  </fieldset>
                </div>
              </div>
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
                          response.routes?.[0]?.legs?.[0]?.distance?.value !=
                          null
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
            <div className="flex justify-evenly gap-8">
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
                  {purchaseTrip !== null ? (
                    <p>{purchaseTrip?.cargoWeight}</p>
                  ) : (
                    <p>N/A</p>
                  )}
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="text-base font-medium">
                    Cargo Description
                  </legend>
                  {purchaseTrip !== null ? (
                    <p>{purchaseTrip?.freightNotes}</p>
                  ) : (
                    <p>N/A</p>
                  )}
                </fieldset>
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
                <span>Distance:</span>
                <span>{distance.toFixed(2)} km</span>
              </p>
              <p className="flex justify-between">
                <span>Rate per km:</span>
                <span>R{trip?.variablePrice}</span>
              </p>
              <div className="border-t border-base-300 my-2" />
              <p className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                {purchaseTrip !== null ? (
                  <span>R{purchaseTrip?.amount.toFixed(2)}</span>
                ) : (
                  <span>R{tripPrice}</span>
                )}
              </p>
            </div>

            <div className="flex justify-center flex-col items-center gap-4">
              {trip?.isBooked === true && purchaseTrip ? (
                <>
                  {purchaseTrip.status === "Delivered" ? (
                    <>
                      <div className="badge badge-success badge-lg gap-2">
                        <span className="text-base">✓ Trip Delivered</span>
                      </div>
                      <p className="text-sm text-base-content/70 text-center mt-2">
                        For any queries, refunds, or assistance, please contact
                        our support line:
                        <br />
                        <a
                          href="tel:+27000000000"
                          className="text-primary hover:underline"
                        >
                          0800 123 456
                        </a>
                        {" or "}
                        <a
                          href="mailto:support@freightconnect.com"
                          className="text-primary hover:underline"
                        >
                          support@freightconnect.com
                        </a>
                      </p>
                    </>
                  ) : (
                    <StatusAdvanceButton
                      currentStatus={purchaseTrip.status as TripStatus}
                      purchaseTripId={purchaseTrip._id}
                    />
                  )}
                  {purchaseTrip.status !== "Delivered" && (
                    <>
                      {purchaseTrip.status === "Awaiting Confirmation" ? (
                        <TripRejectButton
                          purchaseTripId={purchaseTrip._id}
                          tripId={trip._id}
                          currentStatus={purchaseTrip.status}
                        />
                      ) : (
                        <TripCancelButton
                          purchaseTripId={purchaseTrip._id}
                          tripId={trip._id}
                          currentStatus={purchaseTrip.status}
                        />
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleDeleteTrip}
                    className="btn btn-error btn-sm flex flex-col items-center gap-1 py-2 h-auto min-h-[3rem]"
                  >
                    <span className="font-medium">Delete Trip</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPageOwner;
