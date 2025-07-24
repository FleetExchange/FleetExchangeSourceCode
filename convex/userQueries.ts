import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addUserQuery = mutation({
  args: {
    query: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userQuery = await ctx.db.insert("userQueries", {
      queryText: args.query,
      userId: args.userId as Id<"users">,
      createdAt: Date.now(),
    });

    return userQuery;
  },
});
