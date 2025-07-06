"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { CiRuler } from "react-icons/ci";
import { FaLongArrowAltRight } from "react-icons/fa";
import { BsTruck } from "react-icons/bs";
import { BsBoxSeam } from "react-icons/bs";
import Link from "next/link";
import { IoPersonOutline } from "react-icons/io5";

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

  return (
    <div className=" pointer-events-none flex flex-col rounded-xl border border-base-300 bg-base-100 px-5 py-3 shadow transition-all duration-300 hover:shadow-xl mb-8">
      {/* Avatar & Name of company & Price */}
      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-row  items-center avatar avatar-placeholder gap-2">
          <div className="bg-neutral text-neutral-content w-8 rounded-full">
            <span className="text-xs">
              <IoPersonOutline />
            </span>
          </div>
          <h3 className="text-sm">{tripOwner?.name}</h3>
        </div>

        <div className="flex justify-end badge badge-info rounded-2xl">
          From R{trip?.basePrice}
        </div>
      </div>

      <div className="mt-4 flex flex-row justify-evenly">
        <div className="flex flex-col items-center">
          <p className="text-2xl">{trip?.originCity}</p>
          <p className="text-sm">
            {trip?.departureDate
              ? new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).format(new Date(trip?.departureDate))
              : "No Date"}
          </p>
        </div>
        <div className="flex justify-center items-center">
          <FaLongArrowAltRight />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-2xl">{trip?.destinationCity}</p>
          <p className="text-sm">
            {trip?.arrivalDate
              ? new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).format(new Date(trip?.arrivalDate))
              : "No Date"}
          </p>
        </div>
      </div>

      <hr className="border-t border-base-300 mt-4 mb-4"></hr>

      <div className="flex flex-row justify-between items-center gap-6 w-full">
        {/* Truck Info Card */}
        <div className="bg-base-200 rounded-lg p-4 flex flex-row justify-between gap-6 w-full">
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <BsTruck className="text-primary" />
            <span className="font-medium text-base-content text-xs">Type</span>
            <span className="text-sm break-words">{truck?.truckType}</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <BsBoxSeam className="text-primary" />
            <span className="font-medium text-base-content text-xs">
              Payload
            </span>
            <span className="text-sm break-words">
              {truck?.maxLoadCapacity} KG
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <CiRuler className="text-primary" />
            <span className="font-medium text-base-content text-xs">Width</span>
            <span className="text-sm break-words">{truck?.width} m</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <CiRuler className="text-primary" />
            <span className="font-medium text-base-content text-xs">
              Length
            </span>
            <span className="text-sm break-words">{truck?.length} m</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <CiRuler className="text-primary" />
            <span className="font-medium text-base-content text-xs">
              Height
            </span>
            <span className="text-sm break-words">{truck?.height} m</span>
          </div>
        </div>

        {/* View Trip Button */}
        <Link
          href={{
            pathname: "/tripClient",
            query: {
              tripId: tripId as string,
            },
          }}
        >
          <button className="pointer-events-auto btn btn-primary text-sm">
            View Trip
          </button>
        </Link>
      </div>
    </div>
  );
}
