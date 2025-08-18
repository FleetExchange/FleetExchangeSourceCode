"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ArrowRight,
  Truck,
  Package,
  Calendar,
  Clock,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import ProfileImage from "@/components/ProfileImage";

export default function TripCard({ tripId }: { tripId: Id<"trip"> }) {
  const router = useRouter();
  const trip = useQuery(api.trip.getById, { tripId });

  //Consts for referencing
  const tripOwner = useQuery(
    api.users.getUserById,
    trip?.userId ? { userId: trip.userId } : "skip"
  );

  const truck = useQuery(
    api.truck.getTruckById,
    trip?.truckId ? { truckId: trip.truckId } : "skip"
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | number) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatTime = (date: string | number) => {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(date));
  };

  if (!trip || !tripOwner || !truck) {
    return (
      <div className="bg-base-100 rounded-xl border border-base-300 p-4 animate-pulse">
        <div className="h-24 bg-base-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-xl shadow-lg border border-base-300 overflow-hidden transition-all duration-200 hover:shadow-xl cursor-pointer">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 p-4">
        <div className="flex items-center justify-between">
          {/* Transporter Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <ProfileImage fileUrl={tripOwner?.profileImageUrl} size={40} />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-base-content">
                {tripOwner?.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-base-content/60">
                <Star className="w-3 h-3 fill-warning text-warning" />
                <span>{tripOwner?.averageRating}</span>
              </div>
            </div>
          </div>

          {/* Price Badge */}
          <div className="bg-success/10 border border-success/20 rounded-lg px-3 py-1">
            <p className="text-sm font-bold text-success">
              {trip.basePrice
                ? formatCurrency(trip.basePrice)
                : trip.KMPrice
                  ? `${formatCurrency(trip.KMPrice)} per km`
                  : `${formatCurrency(trip.KGPrice)} per kg`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Route */}
        <div className="grid grid-cols-5 gap-2 items-center mb-4">
          {/* Origin */}
          <div className="col-span-2">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-xs text-base-content/60">From</span>
            </div>
            <h4 className="text-sm font-bold text-base-content truncate">
              {trip.originCity}
            </h4>
            <div className="text-xs text-base-content/60">
              {formatDate(trip.departureDate)} •{" "}
              {formatTime(trip.departureDate)}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-info" />
          </div>

          {/* Destination */}
          <div className="col-span-2 text-right">
            <div className="flex items-center gap-1 mb-1 justify-end">
              <span className="text-xs text-base-content/60">To</span>
              <MapPin className="w-3 h-3 text-success" />
            </div>
            <h4 className="text-sm font-bold text-base-content truncate">
              {trip.destinationCity}
            </h4>
            <div className="text-xs text-base-content/60">
              {formatDate(trip.arrivalDate)} • {formatTime(trip.arrivalDate)}
            </div>
          </div>
        </div>

        {/* Truck Specs - Compact */}
        <div className="bg-base-200/30 border border-base-300 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-base-content">
                {truck.truckType}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-base-content/60">
              <span>Max payload: {truck.maxLoadCapacity}kg</span>
              <span>
                Dimensions: {truck.width}×{truck.length}×{truck.height}m
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={{
            pathname: "/tripClient",
            query: {
              tripId: tripId as string,
            },
          }}
        >
          <button className="btn btn-primary btn-sm w-full gap-2 hover:bg-primary-focus transition-all duration-200">
            <Package className="w-4 h-4" />
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}
