import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a notification
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("trip"),
      v.literal("booking"),
      v.literal("payout"),
      v.literal("system")
    ),
    message: v.string(),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      message: args.message,
      createdAt: Date.now(),
      read: false,
      meta: args.meta,
    });
  },
});

// Get notifications for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { read: true });
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.delete(notificationId);
  },
});
