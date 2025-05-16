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
    <>
      <button
        className="btn btn-soft bg-base-100 outline-none "
        onClick={openModal}
      >
        Edit Fleet
      </button>
    </>
  );
};

export default EditFleetCard;
