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
      <p onClick={openModal}>New Fleet</p>
    </>
  );
};

export default NewFleetCard;
