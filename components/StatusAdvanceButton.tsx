"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { useState } from "react";

export type TripStatus =
  | "Awaiting Confirmation"
  | "Booked"
  | "Dispatched"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

interface StatusAdvanceButtonProps {
  currentStatus: TripStatus;
  purchaseTripId: Id<"purchaseTrip">;
}

const StatusAdvanceButton = ({
  currentStatus,
  purchaseTripId,
}: StatusAdvanceButtonProps) => {
  const [status, setStatus] = useState<TripStatus>(currentStatus);
  const updateStatus = useMutation(api.purchasetrip.updatePurchaseTripStatus);

  // Add query to keep status in sync
  const purchaseTrip = useQuery(api.purchasetrip.getPurchaseTrip, {
    purchaseTripId,
  });

  // Update local state when database changes
  React.useEffect(() => {
    if (purchaseTrip?.status) {
      setStatus(purchaseTrip.status as TripStatus);
    }
  }, [purchaseTrip?.status]);

  const getNextStatus = (current: TripStatus): TripStatus => {
    switch (current) {
      case "Awaiting Confirmation":
        return "Booked";
      case "Booked":
        return "Dispatched";
      case "Dispatched":
        return "Delivered";
      case "Delivered":
      default:
        return current;
    }
  };

  const handleAdvanceStatus = async () => {
    try {
      const nextStatus = getNextStatus(status);
      await updateStatus({
        purchaseTripId,
        newStatus: nextStatus,
      });
      setStatus(nextStatus); // Update local state immediately
    } catch (error) {
      console.error("Failed to advance status:", error);
    }
  };

  // Don't show button if status is already Delivered
  if (status === "Delivered") {
    return null;
  }

  if (status === "Cancelled") {
    return (
      <div className="py-2 px-4 rounded bg-red-100 text-red-700 text-center font-semibold">
        This trip has been <span className="font-bold">Cancelled</span>.
      </div>
    );
  }
  if (status === "Refunded") {
    return (
      <div className="py-2 px-4 rounded bg-yellow-100 text-yellow-700 text-center font-semibold">
        This trip has been <span className="font-bold">Refunded</span>.
      </div>
    );
  }
  return (
    <button
      onClick={handleAdvanceStatus}
      className="btn btn-primary btn-sm flex flex-col items-center gap-1 py-2 h-auto min-h-[3rem]"
    >
      <span className="text-xs opacity-80">Current Status: {status}</span>
      <span className="font-medium">Advance to {getNextStatus(status)}</span>
    </button>
  );
};

export default StatusAdvanceButton;
