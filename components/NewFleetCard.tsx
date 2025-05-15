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
        className="btn btn-soft bg-base-100 outline-none "
        onClick={openModal}
      >
        New Fleet
      </button>
    </>
  );
};

export default NewFleetCard;
