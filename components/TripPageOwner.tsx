import React from "react";
interface TripPageClientProps {
  tripId: string;
}

const TripPageOwner: React.FC<TripPageClientProps> = ({ tripId }) => {
  return (
    <div>
      <p>Trip page owner</p>
    </div>
  );
};

export default TripPageOwner;
