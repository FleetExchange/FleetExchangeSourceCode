"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";

interface StatusAdvanceButtonProps {
  currentStatus:
    | "Awaiting Confirmation"
    | "Booked"
    | "Dispatched"
    | "Delivered";
  purchaseTripId: Id<"purchaseTrip">;
}

const StatusAdvanceButton = ({
  currentStatus,
  purchaseTripId,
}: StatusAdvanceButtonProps) => {
  const updateStatus = useMutation(api.purchasetrip.updatePurchaseTripStatus);

  const getNextStatus = (
    current: "Awaiting Confirmation" | "Booked" | "Dispatched" | "Delivered"
  ): "Awaiting Confirmation" | "Booked" | "Dispatched" | "Delivered" => {
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
      const nextStatus = getNextStatus(currentStatus);
      await updateStatus({
        purchaseTripId,
        newStatus: nextStatus,
      });
    } catch (error) {
      console.error("Failed to advance status:", error);
    }
  };

  // Don't show button if status is already Delivered
  if (currentStatus === "Delivered") {
    return null;
  }

  return (
    <button
      onClick={handleAdvanceStatus}
      className="btn btn-primary btn-sm flex flex-col items-center gap-1 py-2 h-auto min-h-[3rem]"
    >
      <span className="text-xs opacity-80">
        Current Status: {currentStatus}
      </span>
      <span className="font-medium">
        Advance to {getNextStatus(currentStatus)}
      </span>
    </button>
  );
};

export default StatusAdvanceButton;
