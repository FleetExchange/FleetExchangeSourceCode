import { createPortal } from "react-dom";
import React, { useState } from "react";
import { Id } from "@/convex/_generated/dataModel"; // adjust import path
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface Fleet {
  _id: Id<"fleet">;
  fleetName: string;
}

const NewFleetModal = ({ fleets }: { fleets: Fleet[] }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Get the logged in user identity
  const { user } = useUser();
  // This is the Clerk user ID
  const clerkId = user!.id;
  // User Id in Convex
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkId,
  })?._id;

  const createFleet = useMutation(api.fleet.newFleet); // ✅ Hook at top level
  const handleCreate = async () => {
    const nameExists = fleets.some(
      (fleet) => fleet.fleetName.toLowerCase() === name.trim().toLowerCase()
    );

    if (nameExists) {
      setError("You already have a fleet with that name.");
      return;
    }

    setError("");

    try {
      await createFleet({ fleetName: name.trim(), userId }); // ✅ Call mutation
      // Optionally reset state or close modal
    } catch (err) {
      console.error("Failed to create fleet:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return createPortal(
    <dialog id="NewFleetModal" className="modal">
      <div className="modal-box w-[500px] bg-base-200">
        <div className="flex flex-col mx-auto gap-4">
          <h3 className="font-bold text-lg">New Fleet</h3>
          <fieldset className="fieldset">
            <input
              type="text"
              className="input focus:outline-none focus:ring-0"
              placeholder="Enter the name of your new fleet"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </fieldset>
          <div className="modal-action">
            <div className="flex flex-row gap-2 justify-between">
              <button className="btn btn-primary" onClick={handleCreate}>
                Create
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

export default NewFleetModal;
