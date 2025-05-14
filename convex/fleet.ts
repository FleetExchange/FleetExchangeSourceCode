import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getFleetForCurrentUser = query({
  args: {
    userId: v.string(), // userId passed from frontend
  },
  handler: async (ctx, { userId }) => {
    // Check if the userId exists
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Query user by Clerk's userId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId)) // Query user by userId
      .first();

    if (!user) {
      throw new Error("User not found in Convex DB");
    }

    // Now that we have the user, query their fleets
    return await ctx.db
      .query("fleet")
      .filter((q) => q.eq(q.field("userId"), user._id)) // Query fleets by user ID
      .collect();
  },
});

// Get all trucks belonging to a specific fleet
export const getTrucksForFleet = query({
  args: {
    fleetId: v.id("fleet"),
  },
  handler: async (ctx, { fleetId }) => {
    const fleet = await ctx.db.get(fleetId); // get the fleet by ID
    if (!fleet) {
      return []; // or throw an error
    }
    return fleet.trucks; // ✅ this is an array of truck IDs
  },
});
