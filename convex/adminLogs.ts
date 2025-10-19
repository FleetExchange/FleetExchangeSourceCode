import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createAdminLog = mutation({
  args: {
    userEnvolved: v.id("users"), // note: matches schema field name
    action: v.string(),
    details: v.string(),
  },
  handler: async (ctx, { userEnvolved, action, details }) => {
    const _id = await ctx.db.insert("adminLogs", {
      createdAt: Date.now(),
      userEnvolved,
      action,
      details,
      resolved: false,
    });
    return _id;
  },
});
