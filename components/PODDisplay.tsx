"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { FileText, Eye } from "lucide-react";

type Props = {
  purchaseTripId: Id<"purchaseTrip">;
  className?: string;
  hideIfMissing?: boolean; // if true, render nothing when no POD
  label?: string; // override label text
  size?: "sm" | "md"; // controls btn size
};

const PODDisplay: React.FC<Props> = ({
  purchaseTripId,
  className,
  hideIfMissing,
  label,
  size = "sm",
}) => {
  const pod = useQuery(api.proofOfDelivery.get, { purchaseTripId });

  // Loading state
  if (pod === undefined) {
    return (
      <button
        type="button"
        className={`btn btn-outline ${size === "sm" ? "btn-sm" : ""} gap-2 ${className || ""}`}
        disabled
      >
        <span className="loading loading-spinner loading-xs" />
        Loading POD…
      </button>
    );
  }

  // No POD yet
  if (pod === null) {
    if (hideIfMissing) return null;
    return (
      <button
        type="button"
        className={`btn btn-outline ${size === "sm" ? "btn-sm" : ""} gap-2 opacity-60 cursor-not-allowed ${className || ""}`}
        disabled
        aria-disabled
        title="Proof of Delivery not available"
      >
        <FileText className="w-4 h-4" />
        POD Unavailable
      </button>
    );
  }

  // POD available
  const url = pod.url;
  const text = label || "View Proof of Delivery";

  return (
    <a
      href={url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-outline ${size === "sm" ? "btn-sm" : ""} gap-2 ${className || ""}`}
      aria-label="Open Proof of Delivery PDF"
    >
      <FileText className="w-4 h-4" />
      {text}
      <Eye className="w-3.5 h-3.5 opacity-70" />
    </a>
  );
};

export default PODDisplay;
