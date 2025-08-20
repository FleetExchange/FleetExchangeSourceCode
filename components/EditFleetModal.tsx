import { createPortal } from "react-dom";
import React, { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Edit, Trash2, Truck, AlertTriangle, CheckCircle } from "lucide-react";

interface Fleet {
  _id: Id<"fleet">;
  fleetName: string;
}

const EditFleetModal = ({ UserFleets }: { UserFleets: Fleet[] }) => {
  // Name to change
  const [name, setName] = useState("");
  //Return Message
  const [returnMessage, setReturnMessage] = useState("");

  // Set the current selected fleet from selector
  const [userFleet, setUserFleet] = useState<string | undefined>(undefined);
  // Handle when the selected fleet changes
  const handleFleetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserFleet(event.target.value);
  };
  useEffect(() => {
    if (UserFleets && UserFleets.length > 0) {
      setUserFleet(UserFleets[0]._id);
    }
  }, [UserFleets]);

  // Hooks to edit the fleet
  const editFleet = useMutation(api.fleet.editFleet);
  const handleEdit = async () => {
    const nameExists = UserFleets.some(
      (fleet) => fleet.fleetName.toLowerCase() === name.trim().toLowerCase()
    );

    if (nameExists) {
      setReturnMessage("You already have a fleet with that name.");
      return;
    }

    setReturnMessage("");

    try {
      const payload: any = { fleetName: name.trim() };

      if (userFleet) {
        payload.fleetId = userFleet as Id<"fleet">;
      }

      await editFleet(payload);
      setReturnMessage("Fleet Edited.");
    } catch (err) {
      console.error("Failed to edit fleet:", err);
      setReturnMessage("Something went wrong. Please try again.");
    }
  };

  // Hooks to delete a fleet
  const deleteFleet = useMutation(api.fleet.deleteFleet);
  const fleetId = userFleet as Id<"fleet"> | undefined;

  const trucksInFleet = useQuery(
    api.fleet.getTrucksForFleet,
    fleetId ? { fleetId } : "skip"
  );

  const handleDelete = async () => {
    try {
      if (!fleetId) return;

      if (trucksInFleet && trucksInFleet.length > 0) {
        setReturnMessage(
          "IMPORTANT: Assign all trucks in the fleet to another fleet or delete them before deleting the fleet!"
        );
        return;
      }

      await deleteFleet({ fleetId });
      setReturnMessage("Fleet Deleted.");
    } catch (err) {
      console.error("Failed to delete fleet:", err);
      setReturnMessage("Something went wrong. Please try again.");
    }
  };

  const getMessageStyle = () => {
    if (
      returnMessage.includes("Fleet Edited") ||
      returnMessage.includes("Fleet Deleted")
    ) {
      return "text-success";
    } else if (
      returnMessage.includes("IMPORTANT") ||
      returnMessage.includes("already have")
    ) {
      return "text-warning";
    } else if (returnMessage.includes("went wrong")) {
      return "text-error";
    }
    return "text-base-content/60";
  };

  const getMessageIcon = () => {
    if (
      returnMessage.includes("Fleet Edited") ||
      returnMessage.includes("Fleet Deleted")
    ) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    } else if (
      returnMessage.includes("IMPORTANT") ||
      returnMessage.includes("already have")
    ) {
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    } else if (returnMessage.includes("went wrong")) {
      return <AlertTriangle className="w-4 h-4 text-error" />;
    }
    return null;
  };

  return createPortal(
    <dialog id="EditFleetModal" className="modal">
      <div className="modal-box w-full max-w-[500px] bg-base-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Edit className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-base-content">
                Edit Fleet
              </h3>
              <p className="text-sm text-base-content/60">
                Modify or remove your fleet configuration
              </p>
            </div>
          </div>
        </div>

        {/* Fleet Selection */}
        <div className="bg-base-200/50 border border-base-300 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-base-content">Select Fleet</h4>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose fleet to edit</span>
            </label>
            <select
              value={userFleet || ""}
              onChange={handleFleetChange}
              className="select select-bordered focus:outline-none focus:border-primary"
            >
              {UserFleets.map((fleet: { _id: string; fleetName: string }) => (
                <option key={fleet._id} value={fleet._id}>
                  {fleet.fleetName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fleet Name Input */}
        <div className="bg-base-200/50 border border-base-300 rounded-lg p-4 mb-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">New Fleet Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered focus:outline-none focus:border-primary"
              placeholder="Enter the new fleet name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Return Message */}
        {returnMessage && (
          <div
            className={`alert mb-4 ${
              returnMessage.includes("Fleet Edited") ||
              returnMessage.includes("Fleet Deleted")
                ? "alert-success"
                : returnMessage.includes("IMPORTANT") ||
                    returnMessage.includes("already have")
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
        <div className="flex justify-between gap-3 pt-4 border-t border-base-300">
          <div className="flex gap-3">
            <button
              className="btn btn-primary gap-2"
              onClick={handleEdit}
              disabled={!name.trim()}
            >
              <Edit className="w-4 h-4" />
              Save Changes
            </button>
            <button className="btn btn-error gap-2" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
              Delete Fleet
            </button>
          </div>
          <form method="dialog">
            <button className="btn btn-outline">Close</button>
          </form>
        </div>

        {/* Warning for Delete */}
        {trucksInFleet && trucksInFleet.length > 0 && (
          <div className="alert alert-warning mt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <div>
                <p className="text-sm font-medium">Cannot delete fleet</p>
                <p className="text-xs text-warning/80">
                  This fleet contains {trucksInFleet.length} truck(s). Please
                  reassign or remove all trucks before deleting.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </dialog>,
    document.body
  );
};

export default EditFleetModal;
