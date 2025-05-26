"use client";

import TripPageOwner from "@/components/TripPageOwner";
import { useSearchParams } from "next/navigation";

const page = () => {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");

  return <div>{tripId && <TripPageOwner tripId={tripId} />}</div>;
};

export default page;
