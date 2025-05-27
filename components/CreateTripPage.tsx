"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useState } from "react";

const CreateTripPage = () => {
  // Get Id of the user creating the trip
  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const clerkId = user!.id;
  // User Id in Convex
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkId,
  })?._id;

  // Declare all fields
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [truckId, setTruckId] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [variablePrice, setVariablePrice] = useState(0);

  return <div className="flex flex-col p-4"></div>;
};

export default CreateTripPage;
