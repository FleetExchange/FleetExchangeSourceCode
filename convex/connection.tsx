import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all freights and trips
export const getConnection = query({
  args: {},
  handler: async (ctx) => {
    const trips = await ctx.db.query("trip").collect();
    const freights = await ctx.db.query("freight").collect();

    return { trips, freights };
  },
});
