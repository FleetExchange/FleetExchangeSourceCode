import { Settings } from "lucide-react";
import React from "react";

const openModal = () => {
  const modal = document.getElementById(
    "EditFleetModal"
  ) as HTMLDialogElement | null;
  if (modal) {
    modal.showModal();
  } else {
    console.error("Modal element not found");
  }
};

const EditFleetCard = () => {
  return (
    <button
      className="flex items-center gap-3 w-full text-left"
      onClick={() => openModal()}
    >
      <div className="p-1.5 rounded-md bg-info/10 group-hover:bg-info-content/20">
        <Settings className="w-4 h-4 text-info group-hover:text-info-content" />
      </div>
      <div>
        <div className="font-medium">Edit Fleet</div>
        <div className="text-xs text-base-content/60 group-hover:text-info-content/80">
          Modify or remove fleet settings
        </div>
      </div>
    </button>
  );
};

export default EditFleetCard;
