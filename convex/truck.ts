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
    departureDate: v.number(),
    arrivalDate: v.number(),
    excludeTripId: v.optional(v.id("trip")),
  },
  handler: async (ctx, args) => {
    const departureTime = args.departureDate;
    const arrivalTime = args.arrivalDate;

    if (arrivalTime <= departureTime) {
      return {
        isAvailable: false,
        error: "Invalid time range (arrival must be after departure)",
        conflictingTrips: [],
      };
    }

    const overlappingTrips = await ctx.db
      .query("trip")
      .filter((q) =>
        q.and(
          q.eq(q.field("truckId"), args.truckId),
          q.neq(q.field("isExpired"), true),
          args.excludeTripId
            ? q.neq(q.field("_id"), args.excludeTripId)
            : q.eq(q.field("_id"), q.field("_id")),
          q.and(
            q.lt(q.field("departureDate"), arrivalTime),
            q.gt(q.field("arrivalDate"), departureTime)
          )
        )
      )
      .collect();

    if (overlappingTrips.length === 0) {
      return { isAvailable: true, conflictingTrips: [] };
    }

    // Helper to fetch "latest" purchaseTrip (add an index in schema for performance)
    async function getLatestPurchaseTrip(tripId: any) {
      // If you add an index (by_tripId_creationTime desc) you can use withIndex + order.
      const pt = await ctx.db
        .query("purchaseTrip")
        .filter((q) => q.eq(q.field("tripId"), tripId))
        .collect();
      if (pt.length === 0) return null;
      // Sort descending by _creationTime to simulate "latest"
      pt.sort((a, b) => b._creationTime - a._creationTime);
      return pt[0];
    }

    const NON_BLOCKING = new Set(["cancelled", "refunded"]);
    const blocking: typeof overlappingTrips = [];
    const nonBlocking: typeof overlappingTrips = [];

    for (const trip of overlappingTrips) {
      if (!trip.isBooked) {
        // Unbooked trips always block (or decide to allow them)
        blocking.push(trip);
        continue;
      }

      const latestPurchase = await getLatestPurchaseTrip(trip._id);

      if (!latestPurchase) {
        // SAFER: treat as blocking (no purchase record but marked booked)
        blocking.push(trip);
        continue;
      }

      const status = String(latestPurchase.status).toLowerCase();

      if (NON_BLOCKING.has(status)) {
        nonBlocking.push(trip); // ignore in availability
      } else {
        blocking.push(trip);
      }
    }

    const isAvailable = blocking.length === 0;

    return {
      isAvailable,
      conflictingTrips: blocking.map((trip) => ({
        _id: trip._id,
        originCity: trip.originCity,
        destinationCity: trip.destinationCity,
        departureDate: trip.departureDate,
        arrivalDate: trip.arrivalDate,
        isBooked: trip.isBooked,
        isExpired: trip.isExpired,
      })),
      ignoredTrips: nonBlocking.map((trip) => ({
        _id: trip._id,
        departureDate: trip.departureDate,
        arrivalDate: trip.arrivalDate,
      })),
      debug: {
        totalOverlap: overlappingTrips.length,
        blocking: blocking.length,
        nonBlocking: nonBlocking.length,
      },
    };
  },
});
