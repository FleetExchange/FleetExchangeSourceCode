"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePlacesWithRestrictions } from "@/hooks/usePlacesWithRestrictions";
import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
} from "@react-google-maps/api";
// @ts-ignore
import { DirectionsResult } from "@types/googlemaps";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import StatusAdvanceButton from "./StatusAdvanceButton";
import { TripStatus } from "./StatusAdvanceButton";
import TripRejectButton from "./TripRejectButton";
import TripCancelButton from "./TripCancelButton";
import TripRatingComponent from "./TripRatingComponent";
import ProfileImage from "./ProfileImage";

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
  const trip = useQuery(
    api.trip.getById,
    tripId ? { tripId: tripId as Id<"trip"> } : "skip"
  );
  // Get the purchaseTrip object
  const purchaseTrip = useQuery(api.purchasetrip.getPurchaseTripByTripId, {
    tripId: tripId as Id<"trip">,
  });
  // Get the truck object from trip
  const truck = useQuery(
    api.truck.getTruckById,
    trip?.truckId ? { truckId: trip.truckId as Id<"truck"> } : "skip"
  );

  const tripClient = useQuery(
    api.users.getUserById,
    purchaseTrip?.userId ? { userId: purchaseTrip.userId } : "skip"
  );

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

  // Google Maps API Section
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

  const [pickupCoords, setPickupCoords] = useState({
    lat: -26.2041,
    lng: 28.0473,
  });
  const [deliveryCoords, setDeliveryCoords] = useState({
    lat: -26.2041,
    lng: 28.0473,
  });

  useEffect(() => {
    if (trip?.originCity) {
      getCityCoordinates(trip.originCity).then(setPickupCoords);
    }
    if (trip?.destinationCity) {
      getCityCoordinates(trip.destinationCity).then(setDeliveryCoords);
    }
  }, [trip?.originCity, trip?.destinationCity]);

  // Map style
  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    position: "relative" as const,
  };

  const tripPrice =
    (trip?.basePrice ?? 0) +
    (trip?.variablePrice ?? 0) * (purchaseTrip?.cargoWeight ?? 0);

  const deleteTrip = useMutation(api.trip.deleteTripById);
  const handleDeleteTrip = async () => {
    try {
      await deleteTrip({ tripId: tripId as Id<"trip"> });
      alert("Trip deleted successfully.");
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete trip:", error);
      alert("Failed to delete trip. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-2 md:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Main Trip Info */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-base-100 rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-primary mb-6">
              {trip?.originCity}{" "}
              <span className="text-base-content/60">to</span>{" "}
              {trip?.destinationCity}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pickup */}
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span className="badge badge-primary badge-sm" />{" "}
                    {trip?.originCity}
                  </h2>
                  <p className="text-base-content/70 text-sm">
                    {departureDateTime && (
                      <span>
                        {departureDateTime.date} at {departureDateTime.time}
                      </span>
                    )}
                  </p>
                </div>
                <fieldset className="mb-4">
                  <legend className="text-base font-medium mb-1">
                    Pickup Address
                  </legend>
                  <p>{trip?.originAddress || "N/A"}</p>
                </fieldset>
                <fieldset>
                  <legend className="text-base font-medium mb-1">
                    Pickup Instructions
                  </legend>
                  <p>{purchaseTrip?.pickupInstructions || "N/A"}</p>
                </fieldset>
              </div>
              {/* Delivery */}
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span className="badge badge-secondary badge-sm" />{" "}
                    {trip?.destinationCity}
                  </h2>
                  <p className="text-base-content/70 text-sm">
                    {arrivalDateTime && (
                      <span>
                        {arrivalDateTime.date} at {arrivalDateTime.time}
                      </span>
                    )}
                  </p>
                </div>
                <fieldset className="mb-4">
                  <legend className="text-base font-medium mb-1">
                    Delivery Address
                  </legend>
                  <p>{trip?.destinationAddress || "N/A"}</p>
                </fieldset>
                <fieldset>
                  <legend className="text-base font-medium mb-1">
                    Delivery Instructions
                  </legend>
                  <p>{purchaseTrip?.deliveryInstructions || "N/A"}</p>
                </fieldset>
              </div>
            </div>
            <div className="divider my-6" />
            <div className="flex justify-end text-base-content/70 text-sm">
              <span>
                Distance:{" "}
                <span className="font-semibold">{distance.toFixed(2)} km</span>
              </span>
            </div>
          </div>

          {/* Cargo Section */}
          <div className="bg-base-100 p-6 rounded-2xl shadow flex flex-col gap-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              Cargo Details
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cargo Weight (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered focus:outline-none focus:ring-0"
                  value={purchaseTrip?.cargoWeight ?? ""}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cargo Description
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-20 focus:outline-none focus:ring-0"
                  value={purchaseTrip?.freightNotes ?? ""}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Truck Details */}
          <div className="bg-base-100 p-6 rounded-2xl shadow flex flex-col gap-4 md:col-span-2">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              Truck Details
            </h3>
            <div className="mb-2 text-base font-medium text-center">
              {truck?.year} {truck?.make} {truck?.model} - {truck?.truckType}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <div className="flex flex-col items-center">
                <span className="text-xs text-base-content/70 mt-1">
                  Length
                </span>
                <span className="font-bold">{truck?.length} m</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-base-content/70 mt-1">Width</span>
                <span className="font-bold">{truck?.width} m</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-base-content/70 mt-1">
                  Height
                </span>
                <span className="font-bold">{truck?.height} m</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-base-content/70 mt-1">
                  Max Load
                </span>
                <span className="font-bold">{truck?.maxLoadCapacity} kg</span>
              </div>
            </div>
          </div>

          {/* Trip Client Section - only show if trip is booked */}
          {trip?.isBooked === true && purchaseTrip && (
            <div className="bg-base-100 p-6 rounded-2xl shadow flex flex-col gap-4 md:col-span-2">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                Trip Client
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ProfileImage
                    fileUrl={tripClient?.profileImageUrl}
                    size={40}
                  />
                  <div>
                    <p className="font-medium">{tripClient?.name}</p>
                    <p className="text-sm text-base-content/70">
                      {tripClient?.email}
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    (window.location.href = `/profiles/${tripClient?._id}`)
                  }
                >
                  View Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Map & Price/Action */}
        <div className="flex flex-col gap-8 h-full">
          {/* Map */}
          <div
            className="bg-base-100 rounded-2xl shadow-xl overflow-hidden"
            style={{ height: "400px" }}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              options={{
                zoomControl: true,
                streetViewControl: true,
                mapTypeControl: true,
                fullscreenControl: true,
                gestureHandling: "greedy",
                clickableIcons: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
              }}
              zoom={7}
              center={pickupCoords}
              onClick={() => {}}
              onLoad={(map) => {
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
                    draggable: true,
                  }}
                  directions={directions}
                />
              )}
            </GoogleMap>
          </div>
          {/* Price & Action */}
          <div className="bg-base-100 rounded-2xl shadow-xl p-6 flex flex-col gap-4">
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
                {purchaseTrip !== null ? (
                  <span>R{purchaseTrip?.amount?.toFixed(2)}</span>
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
                      <div className="w-full mt-4">
                        <TripRatingComponent
                          purchaseTripId={purchaseTrip._id}
                          readOnly={true}
                        />
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
