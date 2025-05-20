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
            <span className="text-xs">WT</span>
          </div>
          <h3 className="text-sm">{tripOwner?.name}</h3>
        </div>

        <div className="flex justify-end badge badge-soft badge-success rounded-2xl">
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
                }).format(new Date(trip?.departureDate))
              : "No Date"}
          </p>
        </div>
      </div>

      <hr className="border-t border-base-200 mt-4 mb-4"></hr>

      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-6">
          <div className=" flex flex-col">
            <div className="flex flex-row items-center gap-2">
              <BsTruck />
              <p className="text-sm">Truck Type: {truck?.truckType}</p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <BsBoxSeam />
              <p className="text-sm">
                Payload Capacity: {truck?.maxLoadCapacity} KG
              </p>
            </div>
          </div>

          <div className=" flex flex-col">
            <div className="flex flex-row items-center gap-2">
              <CiRuler />
              <p className="text-sm">Width: {truck?.width} m</p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <CiRuler />
              <p className="text-sm">Length: {truck?.length} m</p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <CiRuler />
              <p className="text-sm">Height: {truck?.height} m</p>
            </div>
          </div>
        </div>

        <Link
          href={{
            pathname: "/trip",
            query: {
              tripId: tripId as string,
            },
          }}
        >
          <button className="pointer-events-auto btn btn-primary">
            View Trip
          </button>
        </Link>
      </div>
    </div>
  );
}
