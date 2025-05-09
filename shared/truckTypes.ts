export const TRUCK_TYPES = ["Flatbed", "Flatbed + crane"] as const;
export type TruckType = (typeof TRUCK_TYPES)[number];
