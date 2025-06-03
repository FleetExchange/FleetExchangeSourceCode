export const TRUCK_TYPES = [
  "Flatbed",
  "Flatbed + crane",
  "Box Truck",
  "Refrigerated Truck",
  "Semi-Trailer",
  "Lowbed",
  "Tipper",
  "Tanker",
  "Logging Truck",
  "Container Truck",
  "Side Lifter",
  "Rigid Truck",
  "Curtainside",
  "Livestock Carrier",
  "Car Carrier",
  "Dropside",
] as const;
export type TruckType = (typeof TRUCK_TYPES)[number];
