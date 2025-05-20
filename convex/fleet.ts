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

// Create New fleet
export const newFleet = mutation({
  args: {
    fleetName: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, { fleetName, userId }) => {
    const newFleetId = await ctx.db.insert("fleet", {
      fleetName,
      userId,
      trucks: [],
    });

    return newFleetId;
  },
});

// Mutation to edit the name of a fleet
export const editFleet = mutation({
  args: {
    fleetId: v.id("fleet"),
    fleetName: v.string(),
  },
  handler: async (ctx, { fleetName, fleetId }) => {
    const existingFleet = await ctx.db
      .query("fleet")
      .filter((q) => q.eq(q.field("_id"), fleetId))
      .first();

    if (existingFleet) {
      await ctx.db.patch(existingFleet._id, {
        fleetName,
      });
      return existingFleet._id;
    }
  },
});

// Mutation to delete a fleet
export const deleteFleet = mutation({
  args: {
    fleetId: v.id("fleet"),
  },
  handler: async (ctx, { fleetId }) => {
    const existingFleet = await ctx.db
      .query("fleet")
      .filter((q) => q.eq(q.field("_id"), fleetId))
      .first();

    if (existingFleet) {
      await ctx.db.delete(existingFleet._id);
      return existingFleet._id;
    }
  },
});

// Mutation to add a truck to a fleet
export const addTruckToFleet = mutation({
  args: {
    fleetId: v.id("fleet"),
    truckId: v.id("truck"),
  },
  handler: async (ctx, { fleetId, truckId }) => {
    const existingFleet = await ctx.db
      .query("fleet")
      .filter((q) => q.eq(q.field("_id"), fleetId))
      .first();

    if (existingFleet) {
      await ctx.db.patch(existingFleet._id, {
        trucks: [...existingFleet.trucks, truckId],
      });
      return existingFleet._id;
    }
  },
});

// Mutation to remove a truck from a fleet
export const removeTruckFromFleet = mutation({
  args: {
    fleetId: v.id("fleet"),
    truckId: v.id("truck"),
  },
  handler: async (ctx, { fleetId, truckId }) => {
    const existingFleet = await ctx.db
      .query("fleet")
      .filter((q) => q.eq(q.field("_id"), fleetId))
      .first();

    if (existingFleet) {
      await ctx.db.patch(existingFleet._id, {
        trucks: existingFleet.trucks.filter((id) => id !== truckId), // Remove the truckId
      });
      return existingFleet._id;
    }
  },
});

// Mutation change the fleet a truck belongs to
export const changeTruckFleet = mutation({
  args: {
    fleetId: v.id("fleet"),
    truckId: v.id("truck"),
    userFleet: v.array(v.id("fleet")),
  },
  handler: async (ctx, { fleetId, truckId, userFleet }) => {
    // Find the current fleet that contains the truck
    const currentFleet = await ctx.db
      .query("fleet")
      .collect()
      .then((fleets) => fleets.find((fleet) => fleet.trucks.includes(truckId)));

    // Get the target fleet
    const targetFleet = await ctx.db
      .query("fleet")
      .filter((q) => q.eq(q.field("_id"), fleetId))
      .first();

    if (!targetFleet) {
      throw new Error(`Target fleet with ID ${fleetId} not found.`);
    }

    // If truck is already in the target fleet, return early
    if (targetFleet.trucks.includes(truckId)) {
      return targetFleet._id;
    }

    try {
      // First, remove the truck from its current fleet if it exists
      if (currentFleet) {
        await ctx.db.patch(currentFleet._id, {
          trucks: currentFleet.trucks.filter((id) => id !== truckId),
        });
      }

      // Then, add the truck to the new fleet
      await ctx.db.patch(targetFleet._id, {
        trucks: [...targetFleet.trucks, truckId],
      });

      return targetFleet._id;
    } catch (error) {
      console.error("Error changing truck fleet:", error);
      throw new Error("Failed to change truck fleet");
    }
  },
});
