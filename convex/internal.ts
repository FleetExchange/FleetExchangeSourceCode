import { query } from "./_generated/server";
import { v } from "convex/values";

export const getNotificationById = query({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getUserByIdSafe = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return (await ctx.db.get(userId)) ?? null;
  },
});
