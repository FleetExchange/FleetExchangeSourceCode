"use client";

import TripPageClient from "@/components/TripPageClient";
import { useSearchParams } from "next/navigation";

const page = () => {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");

  return <div>{tripId && <TripPageClient tripId={tripId} />}</div>;
};

export default page;
