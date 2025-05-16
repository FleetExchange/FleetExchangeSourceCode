import { createPortal } from "react-dom";
import React, { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel"; // adjust import path
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { query } from "@/convex/_generated/server";

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

  return createPortal(
    <dialog id="EditFleetModal" className="modal">
      <div className="modal-box w-[500px] bg-base-200">
        <div className="flex flex-col mx-auto gap-4">
          <h3 className="font-bold text-lg">Edit Fleet</h3>
          <select
            defaultValue={userFleet}
            onChange={handleFleetChange}
            className="select"
          >
            {UserFleets.map((fleet: { _id: string; fleetName: string }) => (
              <option key={fleet._id} value={fleet._id}>
                {fleet.fleetName}
              </option>
            ))}
          </select>
          <fieldset className="fieldset">
            <input
              type="text"
              className="input focus:outline-none focus:ring-0"
              placeholder="Enter The New Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {returnMessage && (
              <p className="text-neutral text-sm mt-1">{returnMessage}</p>
            )}
          </fieldset>
          <div className="modal-action">
            <div className="flex flex-row gap-2 justify-between">
              <button className="btn btn-primary border-1" onClick={handleEdit}>
                Edit
              </button>
              <button
                className="btn btn-primary border-1"
                onClick={handleDelete}
              >
                Delete
              </button>
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </dialog>,
    document.body
  );
};

export default EditFleetModal;
