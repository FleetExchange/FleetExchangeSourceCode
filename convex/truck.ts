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
    departureDate: v.string(),
    arrivalDate: v.string(),
    excludeTripId: v.optional(v.id("trip")), // For editing existing trips
  },
  handler: async (ctx, args) => {
    const departureTime = new Date(args.departureDate).getTime();
    const arrivalTime = new Date(args.arrivalDate).getTime();

    // Find all active trips for this truck that overlap with the requested dates
    const conflictingTrips = await ctx.db
      .query("trip")
      .filter((q) =>
        q.and(
          q.eq(q.field("truckId"), args.truckId),
          q.eq(q.field("isExpired"), false),
          // Exclude the current trip if editing
          args.excludeTripId
            ? q.neq(q.field("_id"), args.excludeTripId)
            : q.eq(1, 1),
          // Check for date overlap using four conditions:
          // 1. New trip starts during existing trip
          // 2. New trip ends during existing trip
          // 3. New trip encompasses existing trip
          // 4. Existing trip encompasses new trip
          q.or(
            q.and(
              q.lte(q.field("departureDate"), departureTime),
              q.gte(q.field("arrivalDate"), departureTime)
            ),
            q.and(
              q.lte(q.field("departureDate"), arrivalTime),
              q.gte(q.field("arrivalDate"), arrivalTime)
            ),
            q.and(
              q.gte(q.field("departureDate"), departureTime),
              q.lte(q.field("arrivalDate"), arrivalTime)
            ),
            q.and(
              q.lte(q.field("departureDate"), departureTime),
              q.gte(q.field("arrivalDate"), arrivalTime)
            )
          )
        )
      )
      .collect();

    return {
      isAvailable: conflictingTrips.length === 0,
      conflictingTrips: conflictingTrips.map((trip) => ({
        _id: trip._id,
        originCity: trip.originCity,
        destinationCity: trip.destinationCity,
        departureDate: trip.departureDate,
        arrivalDate: trip.arrivalDate,
        isBooked: trip.isBooked,
      })),
    };
  },
});
