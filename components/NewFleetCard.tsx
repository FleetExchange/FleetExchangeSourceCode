import { Plus } from "lucide-react";
import React from "react";

const openModal = () => {
  const modal = document.getElementById(
    "NewFleetModal"
  ) as HTMLDialogElement | null;
  if (modal) {
    modal.showModal();
  } else {
    console.error("Modal element not found");
  }
};

const NewFleetCard = () => {
  return (
    <>
      <button
        className="flex items-center gap-3 w-full text-left"
        onClick={() => openModal()}
      >
        <div className="p-1.5 rounded-md bg-success/10 group-hover:bg-success-content/20">
          <Plus className="w-4 h-4 text-success group-hover:text-success-content" />
        </div>
        <div>
          <div className="font-medium">Create Fleet</div>
          <div className="text-xs text-base-content/60 group-hover:text-success-content/80">
            Add a new fleet configuration
          </div>
        </div>
      </button>
    </>
  );
};

export default NewFleetCard;
