import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { TRUCK_TYPES } from "../shared/truckTypes";

// Get all trucks
export const getTruck = query({
  args: {},
  handler: async (ctx) => {
    const truck = await ctx.db.query("truck").collect();

    return truck;
  },
});

// get by Id
export const getTruckById = query({
  args: { truckId: v.id("truck") },
  handler: async (ctx, { truckId }) => {
    return await ctx.db.get(truckId);
  },
});

export const getTruckByIdArray = query({
  args: {
    truckIds: v.array(v.id("truck")),
  },
  handler: async (ctx, { truckIds }) => {
    const trucks = await Promise.all(truckIds.map((id) => ctx.db.get(id)));
    return trucks.filter((truck) => truck !== null); // Remove any nulls if trucks were deleted
  },
});

// Create New fleet
export const newTruck = mutation({
  args: {
    registration: v.string(), // Identifier for the truck
    make: v.string(), // Name of the truck brand
    model: v.string(), // Model of the truck
    year: v.string(), // Year truck was manufactured
    truckType: v.union(...TRUCK_TYPES.map(v.literal)), // Restrict to valid truck types
    maxLoadCapacity: v.number(), // Max weight truck can bear
    width: v.number(), // Width of the cargo area
    length: v.number(), // Length of the cargo area
    height: v.number(), // Height of cargo area
  },
  handler: async (
    ctx,
    {
      registration,
      make,
      model,
      year,
      truckType,
      maxLoadCapacity,
      width,
      length,
      height,
    }
  ) => {
    const newTruckId = await ctx.db.insert("truck", {
      registration,
      make,
      model,
      year,
      truckType,
      maxLoadCapacity,
      width,
      length,
      height,
    });

    return newTruckId;
  },
});
