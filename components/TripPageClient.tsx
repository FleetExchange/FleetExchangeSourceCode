import React, { useState } from "react";

const TripPageClient = (tripId: string) => {
  const [booked, setBooked] = useState(false);

  return (
    <>
      <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full">
        <div className="row-span-2 col-span-2 bg-blue-400">
          <div className="flex flex-col gap-4 p-2">
            <h1>Trip: tripID: Src to Destination</h1>
            <div className="flex flex-row gap-2 justify-evenly">
              <div>
                <h2>Source City</h2>
                <p>Departure Date</p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Pickup Address?</legend>
                  <input
                    type="text"
                    className="input"
                    placeholder="Type here"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="$$fieldset-legend">
                    Pickup Instructions
                  </legend>
                  <textarea
                    className="textarea h-24"
                    placeholder="Type here"
                  ></textarea>
                </fieldset>
              </div>
              <div className="border-1 border-base-300"></div>
              <div>
                <h2>Destination City</h2>
                <p>Arrival Date</p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Delivery Address?</legend>
                  <input
                    type="text"
                    className="input"
                    placeholder="Type here"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="$$fieldset-legend">
                    Delivery Instructions
                  </legend>
                  <textarea
                    className="textarea h-24"
                    placeholder="Type here"
                  ></textarea>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
        <div className="row-span-2 bg-green-300"></div>
        <div className="col-span-2 bg-yellow-300">
          <div className="flex flex-row justify-evenly gap-4">
            <div className="grid grid-cols-2">
              <p>Length: </p>
              <p>Width: </p>
              <p>Height: </p>
              <p>Payload: </p>
            </div>
            <div>
              <p> Truck Info</p>
              <p> Truck Type</p>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Cargo Weight</legend>
                <input
                  type="number"
                  className="input"
                  placeholder="Type here"
                />
              </fieldset>
            </div>
            <div>
              <fieldset className="fieldset">
                <legend className="$$fieldset-legend">Cargo Description</legend>
                <textarea
                  className="textarea h-24"
                  placeholder="Type here"
                ></textarea>
              </fieldset>
            </div>
          </div>
        </div>
        <div className="bg-pink-400 p-4">
          <p>Base Price:</p>
          <p>Variable Price per KM:</p>
          <p>Variable Price per KG:</p>
          <p>Total:</p>
          {booked ? (
            <button className="btn btn-error">Cancel Booking</button>
          ) : (
            <button className="btn btn-primary">Book Trip</button>
          )}
        </div>
      </div>
    </>
  );
};

export default TripPageClient;
