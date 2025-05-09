"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LuMapPinHouse } from "react-icons/lu";
import { LuMapPin } from "react-icons/lu";
import { FaLongArrowAltRight } from "react-icons/fa";
import { BsTruck } from "react-icons/bs";
import { BsBoxSeam } from "react-icons/bs";

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
    <div
      onClick={() => router.push(`/event/${tripId}`)}
      className="flex w-[350px] flex-col rounded-xl border border-base-300 bg-base-100 px-5 py-3 shadow transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex flex-row justify-between items-center gap-2">
        <h3 className="text-sm">
          {tripOwner?.logo}
          {tripOwner?.companyName}
        </h3>
        <div className="flex justify-end badge badge-soft badge-success rounded-2xl">
          From R{trip?.basePrice}
        </div>
      </div>

      <div className="w-[300px] mt-4 flex flex-row justify-between">
        <div>
          <LuMapPinHouse />
          <h3>{trip?.originCity}</h3>
          <h3 className="text-sm">
            {trip?.departureDate
              ? new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(trip?.departureDate))
              : "No Date"}
          </h3>
        </div>
        <div>
          <FaLongArrowAltRight />
        </div>
        <div className="flex flex-col items-end">
          <LuMapPin />
          <h3 className="text-right">{trip?.destinationCity}</h3>
          <h3 className="text-sm">
            {trip?.arrivalDate
              ? new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(trip?.arrivalDate))
              : "No Date"}
          </h3>
        </div>
      </div>

      <hr className="border-t border-base-200 mt-4 mb-4"></hr>
      <div className="flex flex-row items-center gap-2">
        <BsTruck />
        <p className="text-sm">Truck Type: {truck?.truckType}</p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <BsBoxSeam />
        <p className="text-sm">Payload Capacity: {truck?.maxLoadCapacity} KG</p>
      </div>
    </div>
  );
}
