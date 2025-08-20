import { createPortal } from "react-dom";
import React, { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Plus, Truck, CheckCircle, AlertTriangle } from "lucide-react";

interface Fleet {
  _id: Id<"fleet">;
  fleetName: string;
}

const NewFleetModal = ({ fleets }: { fleets: Fleet[] }) => {
  const [name, setName] = useState("");
  const [returnMessage, setReturnMessage] = useState("");

  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const clerkId = user!.id;
  // User Id in Convex
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkId,
  })?._id;

  const createFleet = useMutation(api.fleet.newFleet);
  const handleCreate = async () => {
    const nameExists = fleets.some(
      (fleet) => fleet.fleetName.toLowerCase() === name.trim().toLowerCase()
    );

    if (nameExists) {
      setReturnMessage("You already have a fleet with that name.");
      return;
    }

    setReturnMessage("");

    try {
      if (userId) {
        await createFleet({ fleetName: name.trim(), userId });
        setReturnMessage("Fleet Created.");
        setName(""); // Clear input after successful creation
      }
    } catch (err) {
      console.error("Failed to create fleet:", err);
      setReturnMessage("Something went wrong. Please try again.");
    }
  };

  const getMessageStyle = () => {
    if (returnMessage.includes("Fleet Created")) {
      return "text-success";
    } else if (returnMessage.includes("already have")) {
      return "text-warning";
    } else if (returnMessage.includes("went wrong")) {
      return "text-error";
    }
    return "text-base-content/60";
  };

  const getMessageIcon = () => {
    if (returnMessage.includes("Fleet Created")) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    } else if (returnMessage.includes("already have")) {
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    } else if (returnMessage.includes("went wrong")) {
      return <AlertTriangle className="w-4 h-4 text-error" />;
    }
    return null;
  };

  return createPortal(
    <dialog id="NewFleetModal" className="modal">
      <div className="modal-box w-full max-w-[500px] bg-base-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-base-content">
                Create New Fleet
              </h3>
              <p className="text-sm text-base-content/60">
                Add a new fleet to organize your vehicles
              </p>
            </div>
          </div>
        </div>

        {/* Fleet Name Input */}
        <div className="bg-base-200/50 border border-base-300 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-base-content">Fleet Details</h4>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content">
              Fleet Name
            </label>
            <input
              type="text"
              className="input input-bordered w-full focus:outline-none focus:border-primary"
              placeholder="Enter the name of your new fleet"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-base-content/60">
              Choose a unique name to identify this fleet
            </p>
          </div>
        </div>

        {/* Return Message */}
        {returnMessage && (
          <div
            className={`alert mb-4 ${
              returnMessage.includes("Fleet Created")
                ? "alert-success"
                : returnMessage.includes("already have")
                  ? "alert-warning"
                  : returnMessage.includes("went wrong")
                    ? "alert-error"
                    : "alert-info"
            }`}
          >
            <div className="flex items-start gap-2">
              {getMessageIcon()}
              <span className="text-sm">{returnMessage}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
          <button
            className="btn btn-primary gap-2"
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            <Plus className="w-4 h-4" />
            Create Fleet
          </button>
          <form method="dialog">
            <button className="btn btn-outline">Close</button>
          </form>
        </div>

        {/* Fleet Count Info */}
        <div className="bg-info/5 border border-info/20 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-info/10 rounded border border-info/20">
              <Truck className="w-4 h-4 text-info" />
            </div>
            <div>
              <h4 className="font-medium text-base-content mb-1">
                Fleet Organization
              </h4>
              <p className="text-sm text-base-content/60">
                You currently have {fleets.length} fleet
                {fleets.length !== 1 ? "s" : ""}. Organize your vehicles into
                fleets for better management and tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </dialog>,
    document.body
  );
};

export default NewFleetModal;
