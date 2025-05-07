import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all freights and trips
export const getTrip = query({
  args: {},
  handler: async (ctx) => {
    const trips = await ctx.db.query("trip").collect();

    return trips;
  },
});

// get by Id
export const getById = query({
  args: { tripId: v.id("trip") },
  handler: async (ctx, { tripId }) => {
    return await ctx.db.get(tripId);
  },
});
