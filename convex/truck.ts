import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
