import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Serverside Queries
// Methods to handle interfacing with the DB in terms of actions

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});
