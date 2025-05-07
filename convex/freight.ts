import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all freights and trips
export const getFreight = query({
  args: {},
  handler: async (ctx) => {
    const freight = await ctx.db.query("freight").collect();

    return freight;
  },
});

// get by Id
export const getById = query({
  args: { freightId: v.id("freight") },
  handler: async (ctx, { freightId }) => {
    return await ctx.db.get(freightId);
  },
});
