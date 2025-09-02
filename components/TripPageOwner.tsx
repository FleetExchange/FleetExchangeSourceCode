// components/TripPageOwner.tsx
"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
import { useRouter } from "next/navigation";
import StatusAdvanceButton from "./StatusAdvanceButton";
import { TripStatus } from "./StatusAdvanceButton";
import TripRejectButton from "./TripRejectButton";
import TripCancelButton from "./TripCancelButton";
import TripRatingComponent from "./TripRatingComponent";
import ProfileImage from "./ProfileImage";
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
  Trash2,
  Phone,
  Mail,
} from "lucide-react";
import {
  formatDateInSAST,
  formatTimeInSAST,
  formatDateTimeInSAST,
  formatFullDateTimeInSAST,
} from "@/utils/dateUtils";
import { useUser } from "@clerk/nextjs";

interface TripPageClientProps {
  tripId: string;
}

const TripPageOwner: React.FC<TripPageClientProps> = ({ tripId }) => {
  const router = useRouter();
  // Get the logged in user identity
  const { user } = useUser();

  // Get user's Convex ID
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "skip",
  })?._id;

  if (!userId) {
    return;
  }
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

  const [pickupCoords, setPickupCoords] = useState({
    lat: -26.2041,
    lng: 28.0473,
  });
  const [deliveryCoords, setDeliveryCoords] = useState({
    lat: -26.2041,
    lng: 28.0473,
  });

  // Function to get city coordinates using Google Places API
  const getCityCoordinates = async (cityName: string) => {
    try {
      const results = await getGeocode({
        address: `${cityName}, South Africa`,
      });
      const { lat, lng } = await getLatLng(results[0]);
      return { lat, lng };
    } catch (error) {
      console.error("Error getting city coordinates:", error);
      // Return default coordinates (Johannesburg) if geocoding fails
      return { lat: -26.2041, lng: 28.0473 };
    }
  };

  useEffect(() => {
    if (trip?.originCity) {
      getCityCoordinates(trip.originCity).then(setPickupCoords);
    }
    if (trip?.destinationCity) {
      getCityCoordinates(trip.destinationCity).then(setDeliveryCoords);
    }
  }, [trip?.originCity, trip?.destinationCity]);

  useEffect(() => {
    if (purchaseTrip) {
      setDeliveryAddress(trip?.destinationAddress || "");
      setPickupAddress(trip?.originAddress || "");
      setDistance(purchaseTrip.distance || 0);
    }
  }, [
    purchaseTrip?._id,
    trip?.destinationAddress,
    trip?.originAddress,
    purchaseTrip?.distance,
  ]);

  // Pricing calculations
  const KMPrice = (trip?.KMPrice ?? 0) * distance;
  const KGPrice = (trip?.KGPrice ?? 0) * (purchaseTrip?.cargoWeight ?? 0);
  const tripPriceWithoutFees = (trip?.basePrice ?? 0) + KMPrice + KGPrice;
  const platformCommision = tripPriceWithoutFees * 0.05; // Assuming a 5% fee
  const issuerPayout = tripPriceWithoutFees - platformCommision;

  const deleteTrip = useMutation(api.trip.deleteTripById);
  const handleDeleteTrip = async () => {
    try {
      await deleteTrip({ tripId: tripId as Id<"trip"> });
      alert("Trip deleted successfully.");
      window.location.href = "/myTrips";
    } catch (error) {
      console.error("Failed to delete trip:", error);
      alert("Failed to delete trip. Please try again.");
    }
  };

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
                  Trip Management
                </h1>
                <p className="text-base-content/60 mt-1">
                  Manage your trip and track its progress • Times in SAST
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
                        <div className="p-3 bg-base-100 border border-base-300 rounded-lg text-sm">
                          {trip?.originAddress || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Instructions
                          </span>
                        </label>
                        <div className="p-3 bg-base-100 border border-base-300 rounded-lg text-sm min-h-[3rem]">
                          {purchaseTrip?.pickupInstructions || "N/A"}
                        </div>
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
                        <div className="p-3 bg-base-100 border border-base-300 rounded-lg text-sm">
                          {trip?.destinationAddress || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Instructions
                          </span>
                        </label>
                        <div className="p-3 bg-base-100 border border-base-300 rounded-lg text-sm min-h-[3rem]">
                          {purchaseTrip?.deliveryInstructions || "N/A"}
                        </div>
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
                      Weight and description of cargo
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
                    <div className="p-3 bg-base-200/50 border border-base-300 rounded-lg text-sm font-medium">
                      {purchaseTrip?.cargoWeight ?? "N/A"} kg
                    </div>
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
                    <div className="p-3 bg-base-200/50 border border-base-300 rounded-lg text-sm min-h-[3rem]">
                      {purchaseTrip?.freightNotes ?? "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-warning/10 rounded-lg border border-warning/20">
                    <Truck className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content">
                      Vehicle Information
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Your truck specifications
                    </p>
                  </div>
                </div>

                <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
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
              </div>

              {/* Trip Client Section - only show if trip is booked */}
              {trip?.isBooked === true && purchaseTrip && tripClient && (
                <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-info/10 rounded-lg border border-info/20">
                      <User className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-base-content">
                        Trip Client
                      </h3>
                      <p className="text-sm text-base-content/60">
                        Customer information
                      </p>
                    </div>
                  </div>

                  <div className="bg-base-200/50 border border-base-300 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <ProfileImage
                            fileUrl={tripClient?.profileImageUrl}
                            size={48}
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-base-100"></div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-base-content">
                            {tripClient?.name}
                          </h4>

                          <p className="text-sm text-base-content/60">
                            {tripClient?.email}
                          </p>
                        </div>
                      </div>
                      <button
                        className="btn btn-outline btn-sm gap-2"
                        onClick={() =>
                          (window.location.href = `/profiles/${tripClient?._id}`)
                        }
                      >
                        <User className="w-4 h-4" />
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                              pickupAddress ||
                              `${trip?.originCity}, South Africa`,
                            destination:
                              deliveryAddress ||
                              `${trip?.destinationCity}, South Africa`,
                            travelMode: google.maps.TravelMode.DRIVING,
                          }}
                          callback={(response, status) => {
                            if (response !== null && status === "OK") {
                              setDirections(response);
                              const distanceInKm =
                                response.routes?.[0]?.legs?.[0]?.distance
                                  ?.value != null
                                  ? response.routes[0].legs[0].distance.value /
                                    1000
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
              </div>

              {/* Price Breakdown & Actions */}
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
                      {purchaseTrip ? "Trip cost details" : "Pricing structure"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Show only basic pricing if no purchaseTrip */}
                  {!purchaseTrip ? (
                    <>
                      {/* Base Price */}
                      {trip &&
                        typeof trip.basePrice === "number" &&
                        trip.basePrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-base-content/70">
                              Base Price:
                            </span>
                            <span className="font-medium">
                              R{trip.basePrice.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* KM Price Rate */}
                      {trip &&
                        typeof trip.KMPrice === "number" &&
                        trip.KMPrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-base-content/70">
                              Per Kilometer:
                            </span>
                            <span className="font-medium">
                              R{trip.KMPrice.toFixed(2)}/km
                            </span>
                          </div>
                        )}

                      {/* KG Price Rate */}
                      {trip &&
                        typeof trip.KGPrice === "number" &&
                        trip.KGPrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-base-content/70">
                              Per Kilogram:
                            </span>
                            <span className="font-medium">
                              R{trip.KGPrice.toFixed(2)}/kg
                            </span>
                          </div>
                        )}

                      <div className="bg-info/10 border border-info/20 rounded-lg p-3 mt-4">
                        <p className="text-xs text-base-content/60 text-center">
                          Final price will be calculated based on actual
                          distance and cargo weight
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Full breakdown when purchaseTrip exists */}
                      {trip &&
                        typeof trip.basePrice === "number" &&
                        trip.basePrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-base-content/70">
                              Base Price:
                            </span>
                            <span className="font-medium">
                              R{trip.basePrice.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {trip &&
                        typeof trip.KGPrice === "number" &&
                        trip.KGPrice > 0 &&
                        (purchaseTrip?.cargoWeight ?? 0) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-base-content/70">
                              Weight Cost:
                            </span>
                            <span>
                              R{trip.KGPrice.toFixed(2)} ×
                              {purchaseTrip?.cargoWeight}kg = R
                              {KGPrice.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {trip &&
                        typeof trip.KMPrice === "number" &&
                        trip.KMPrice > 0 &&
                        distance > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-base-content/70">
                              Distance Cost:
                            </span>
                            <span>
                              R{trip.KMPrice.toFixed(2)} × {distance.toFixed(1)}
                              km = R{KMPrice.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* Subtotal */}
                      {purchaseTrip.tripTotal > 0 && (
                        <div className="flex justify-between text-sm border-t border-base-300 pt-3">
                          <span className="text-base-content/70 font-medium">
                            Subtotal:
                          </span>
                          <span className="font-medium">
                            R{purchaseTrip.tripTotal.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Platform Commission */}
                      {purchaseTrip.commissionAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-base-content/70">
                            Platform Commission (5%):
                          </span>
                          <span className="text-error font-medium">
                            - R{purchaseTrip.commissionAmount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Final Payout */}
                      <div className="border-t border-base-300 pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-base-content">
                            Your Earnings:
                          </span>
                          <span className="text-success">
                            R{purchaseTrip.transporterAmount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/60 text-right mt-1">
                          Amount you receive after commission
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {!trip?.isBooked ? (
                    // Trip not booked - show delete button
                    <button
                      onClick={handleDeleteTrip}
                      className="btn btn-error btn-wide gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Trip
                    </button>
                  ) : !purchaseTrip ? (
                    // Trip marked as booked but no purchaseTrip found (edge case)
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-center">
                      <p className="text-sm text-base-content/70">
                        Trip booking data not found
                      </p>
                    </div>
                  ) : purchaseTrip.status === "Delivered" ? (
                    // Delivered - show rating and support info
                    <div className="space-y-4">
                      <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-success font-semibold">
                          <Star className="w-5 h-5 fill-success" />
                          <span>Trip Delivered</span>
                        </div>
                      </div>

                      <TripRatingComponent
                        purchaseTripId={purchaseTrip._id}
                        readOnly={true}
                      />

                      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                        <p className="text-sm text-base-content/70 text-center">
                          For any queries, refunds, or assistance:
                        </p>
                        <div className="flex flex-col gap-2 mt-2">
                          <a
                            href="tel:+27000000000"
                            className="btn btn-outline btn-sm gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            0800 123 456
                          </a>
                          <a
                            href="mailto:support@freightconnect.com"
                            className="btn btn-outline btn-sm gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            Support Email
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : purchaseTrip.status === "Awaiting Confirmation" ? (
                    // Awaiting Confirmation - show accept/reject buttons
                    <div className="space-y-3">
                      <StatusAdvanceButton
                        currentStatus={purchaseTrip.status as TripStatus}
                        purchaseTripId={purchaseTrip._id}
                      />
                      <TripRejectButton
                        purchaseTripId={purchaseTrip._id}
                        tripId={trip._id}
                        currentStatus={purchaseTrip.status}
                      />
                    </div>
                  ) : purchaseTrip.status === "Booked" ? (
                    // Booked - show cancel and status advance
                    <div className="space-y-3">
                      <StatusAdvanceButton
                        currentStatus={purchaseTrip.status as TripStatus}
                        purchaseTripId={purchaseTrip._id}
                      />
                      <TripCancelButton
                        userId={userId}
                        tripId={trip._id}
                        currentStatus={purchaseTrip.status}
                      />
                    </div>
                  ) : purchaseTrip.status === "Dispatched" ? (
                    // Dispatched - only status advance (no cancel)
                    <div className="space-y-3">
                      <StatusAdvanceButton
                        currentStatus={purchaseTrip.status as TripStatus}
                        purchaseTripId={purchaseTrip._id}
                      />
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-center">
                        <p className="text-sm text-base-content/70">
                          Trip is in transit - cannot be cancelled
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Other statuses - show status and basic actions
                    <>
                      <StatusAdvanceButton
                        currentStatus={purchaseTrip.status as TripStatus}
                        purchaseTripId={purchaseTrip._id}
                      />
                      <TripCancelButton
                        userId={userId}
                        tripId={trip._id}
                        currentStatus={purchaseTrip.status}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPageOwner;
