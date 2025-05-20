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
      <p onClick={openModal}>Edit Fleet</p>
    </>
  );
};

export default EditFleetCard;
