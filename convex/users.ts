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
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("client"), v.literal("transporter")),
    contactNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        role: args.role,
        contactNumber: args.contactNumber,
      });
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", {
      clerkId: args.userId,
      name: args.name,
      email: args.email,
      role: args.role,
      isApproved: false,
      createdAt: Date.now(),
      contactNumber: args.contactNumber,
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
    contactNumber: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Creating user with role:", args.role); // Debug log
    return await ctx.db.insert("users", {
      clerkId: args.userId,
      name: args.name,
      email: args.email,
      role: args.role,
      isApproved: false,
      createdAt: Date.now(),
      contactNumber: args.contactNumber,
    });
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getUsersByIds = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    if (args.userIds.length === 0) return [];

    const users = await Promise.all(args.userIds.map((id) => ctx.db.get(id)));

    return users.filter((user) => user !== null);
  },
});

export const updateUserRating = mutation({
  args: {
    userId: v.id("users"),
    rating: v.number(),
  },
  handler: async (ctx, { userId, rating }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const ratingCount = user.ratingCount || 0;

    // Calculate new average rating
    const newAverageRating =
      ((user.averageRating || 0) * (user.ratingCount || 0) + rating) /
      (ratingCount || 1);

    return await ctx.db.patch(userId, {
      averageRating: newAverageRating,
      ratingCount: (user.ratingCount || 0) + 1,
    });
  },
});
