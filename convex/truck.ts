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
