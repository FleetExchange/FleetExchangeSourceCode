import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { TRUCK_TYPES } from "../shared/truckTypes";

// Get all trucks
export const getTruck = query({
  args: {},
  handler: async (ctx) => {
    const truck = await ctx.db.query("truck").collect();

    return truck;
  },
});

// get by Id
export const getTruckById = query({
  args: { truckId: v.union(v.id("truck"), v.literal("skip")) },
  handler: async (ctx, args) => {
    if (args.truckId === "skip") return null;
    return await ctx.db.get(args.truckId);
  },
});

export const getTruckByIdArray = query({
  args: {
    truckIds: v.array(v.id("truck")),
  },
  handler: async (ctx, { truckIds }) => {
    const trucks = await Promise.all(truckIds.map((id) => ctx.db.get(id)));
    return trucks.filter((truck) => truck !== null); // Remove any nulls if trucks were deleted
  },
});

// Create New Truck
export const newTruck = mutation({
  args: {
    registration: v.string(), // Identifier for the truck
    make: v.string(), // Name of the truck brand
    model: v.string(), // Model of the truck
    year: v.string(), // Year truck was manufactured
    truckType: v.union(...TRUCK_TYPES.map(v.literal)), // Restrict to valid truck types
    maxLoadCapacity: v.number(), // Max weight truck can bear
    width: v.number(), // Width of the cargo area
    length: v.number(), // Length of the cargo area
    height: v.number(), // Height of cargo area
  },
  handler: async (
    ctx,
    {
      registration,
      make,
      model,
      year,
      truckType,
      maxLoadCapacity,
      width,
      length,
      height,
    }
  ) => {
    const newTruckId = await ctx.db.insert("truck", {
      registration,
      make,
      model,
      year,
      truckType,
      maxLoadCapacity,
      width,
      length,
      height,
    });

    return newTruckId;
  },
});

// Mutation to edit the truck
export const editTruck = mutation({
  args: {
    truckId: v.id("truck"),
    registration: v.string(), // Identifier for the truck
    make: v.string(), // Name of the truck brand
    model: v.string(), // Model of the truck
    year: v.string(), // Year trick was manufactured
    truckType: v.union(...TRUCK_TYPES.map(v.literal)), // Type of truck
    maxLoadCapacity: v.number(), // Max weight truck can bear
    width: v.number(), // Width of the cargo area
    length: v.number(), // Length of the cargo area
    height: v.number(), // Height of cargo area
  },
  handler: async (ctx, args) => {
    const truck = await ctx.db
      .query("truck")
      .filter((q) => q.eq(q.field("_id"), args.truckId))
      .first();
    if (truck) {
      await ctx.db.patch(truck._id, {
        registration: args.registration.trim(),
        make: args.make.trim(),
        model: args.model.trim(),
        year: args.year.trim(),
        truckType: args.truckType,
        maxLoadCapacity: args.maxLoadCapacity,
        width: args.width,
        length: args.length,
        height: args.height,
      });
      return truck._id;
    }
  },
});

// Mutation to delete a fleet
export const deleteTruck = mutation({
  args: {
    truckId: v.id("truck"),
  },
  handler: async (ctx, { truckId }) => {
    const existingTruck = await ctx.db
      .query("truck")
      .filter((q) => q.eq(q.field("_id"), truckId))
      .first();

    if (existingTruck) {
      await ctx.db.delete(existingTruck._id);
      return existingTruck._id;
    }
  },
});

// convex/truck.ts
export const isTruckAvailable = query({
  args: {
    truckId: v.id("truck"),
    departureDate: v.number(), // Accept timestamps directly
    arrivalDate: v.number(), // Accept timestamps directly
    excludeTripId: v.optional(v.id("trip")),
  },
  handler: async (ctx, args) => {
    const departureTime = args.departureDate; // Already a timestamp
    const arrivalTime = args.arrivalDate; // Already a timestamp

    console.log("🔍 Checking truck availability:", {
      truckId: args.truckId,
      requestedPeriod: {
        departure: new Date(args.departureDate).toISOString(),
        arrival: new Date(args.arrivalDate).toISOString(),
        departureTime,
        arrivalTime,
      },
      excludeTripId: args.excludeTripId,
    });

    // Get ALL trips for this truck first for debugging
    const allTrucksTrips = await ctx.db
      .query("trip")
      .filter((q) => q.eq(q.field("truckId"), args.truckId))
      .collect();

    console.log(
      "🔍 All trips for this truck:",
      allTrucksTrips.map((trip) => ({
        _id: trip._id,
        departureDate: trip.departureDate,
        arrivalDate: trip.arrivalDate,
        isExpired: trip.isExpired,
        isBooked: trip.isBooked,
      }))
    );

    // Find conflicting trips
    const conflictingTrips = await ctx.db
      .query("trip")
      .filter((q) =>
        q.and(
          q.eq(q.field("truckId"), args.truckId),
          q.neq(q.field("isExpired"), true), // Not expired
          // Exclude the current trip if editing
          args.excludeTripId
            ? q.neq(q.field("_id"), args.excludeTripId)
            : q.eq(q.field("_id"), q.field("_id")), // Always true
          // Simplified overlap check: two ranges overlap if start1 < end2 AND start2 < end1
          q.and(
            q.lt(q.field("departureDate"), arrivalTime),
            q.gt(q.field("arrivalDate"), departureTime)
          )
        )
      )
      .collect();

    console.log("🔍 Conflicting trips found:", conflictingTrips.length);

    return {
      isAvailable: conflictingTrips.length === 0,
      conflictingTrips: conflictingTrips.map((trip) => ({
        _id: trip._id,
        originCity: trip.originCity,
        destinationCity: trip.destinationCity,
        departureDate: trip.departureDate,
        arrivalDate: trip.arrivalDate,
        isBooked: trip.isBooked,
        isExpired: trip.isExpired,
      })),
    };
  },
});
