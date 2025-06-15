import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Serverside Queries
// Methods to handle interfacing with the DB in terms of actions

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.union(v.string(), v.literal("skip")) },
  handler: async (ctx, { clerkId }) => {
    if (clerkId === "skip") return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const updateUser = mutation({
  args: {
    userId: v.string(), // Clerk ID
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, name, email }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name,
        email,
      });
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", {
      clerkId: userId,
      name,
      email,
      role: "client", // Default role for new users
      isApproved: false, // Default approval status
      createdAt: Date.now(), // Current timestamp
    });

    return newUserId;
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(
      v.literal("client"),
      v.literal("transporter"),
      v.literal("admin")
    ),
    isApproved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) throw new Error("User not found");
    return await ctx.db.patch(user._id, {
      role: args.role,
      isApproved: args.isApproved,
    });
  },
});

export const createUserFromClerk = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("client"), v.literal("transporter")),
  },
  handler: async (ctx, { userId, name, email, role }) => {
    return await ctx.db.insert("users", {
      clerkId: userId,
      name,
      email,
      role,
      isApproved: false,
      createdAt: Date.now(),
    });
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
