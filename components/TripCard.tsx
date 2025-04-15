"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import {
  CalendarDays,
  MapPin,
  Ticket,
  Check,
  CircleArrowRight,
  LoaderCircle,
  XCircle,
  PencilIcon,
  StarIcon,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TripCard({ tripId }: { tripId: Id<"trip"> }) {
  const { user } = useUser();
  const router = useRouter();
  const trip = useQuery(api.trip.getById, { tripId });
  // Does the user have the trip
  const userTrips = useQuery(api.purchasetrip.getUserPurchaseForTrip, {
    tripId,
    userId: user?.id ?? "",
  });

  const isPastTrip = trip?.pickupDate < Date.now();

  const isEventOwner = user?.id === trip?.userId;

  const renderTicketStatus = () => {
    if (!user) return null;

    if (isEventOwner) {
      return (
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/seller/events/${tripId}/edit`);
            }}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Edit Event
          </button>
        </div>
      );
    }

    if (userTrips) {
      return (
        <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">
              You have trip order!
            </span>
          </div>
          <button
            onClick={() => router.push(`/tickets/${userTrips._id}`)}
            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-medium shadow-sm transition-colors duration-200 flex items-center gap-1"
          >
            View your order
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      onClick={() => router.push(`/event/${tripId}`)}
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden relative ${
        isPastTrip ? "opacity-75 hover:opacity-100" : ""
      }`}
    >
      <div className={`p-6`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex flex-col items-start gap-2">
              {isEventOwner && (
                <span className="inline-flex items-center gap-1 bg-blue-600/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <StarIcon className="w-3 h-3" />
                  Your Event
                </span>
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                {trip?.destination}
              </h2>
            </div>
            {isPastTrip && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                Past Event
              </span>
            )}
          </div>

          {/* Price Tag */}

          <div className="flex flex-col items-end gap-2 ml-4">
            <span
              className={`px-4 py-1.5 font-semibold rounded-full ${
                isPastTrip
                  ? "bg-gray-50 text-gray-500"
                  : "bg-green-50 text-green-700"
              }`}
            >
              £{trip?.price.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{trip?.source}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span>
              {new Date(trip?.pickupDate).toLocaleDateString()}{" "}
              {isPastTrip && "(Ended)"}
            </span>
          </div>
        </div>

        <p className="mt-4 text-gray-600 text-sm line-clamp-2">
          {trip?.truckDescription}
        </p>

        <div onClick={(e) => e.stopPropagation()}>
          {!isPastTrip && renderTicketStatus()}
        </div>
      </div>
    </div>
  );
}
