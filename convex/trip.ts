// ** DISCLAIMER **
// TIME FILTERS ONLY WORK WITH GMT+2
//

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

// Get a trip that adheres to searchterms and filters
export const getTrip = query({
  args: {
    searchTerm: v.object({
      from: v.string(),
      to: v.string(),
      arrival: v.string(),
    }),
    filterTerm: v.object({
      depDate: v.string(),
      arrDate: v.string(),
      truckType: v.string(),
      width: v.string(),
      length: v.string(),
      height: v.string(),
      payload: v.string(),
    }),
  },
  handler: async (ctx, { searchTerm, filterTerm }) => {
    let trips = await ctx.db
      .query("trip")
      .filter((q) => q.eq(q.field("isBooked"), false))
      .collect();

    if (searchTerm.from) {
      trips = trips.filter((trip) =>
        trip.originCity?.toLowerCase().includes(searchTerm.from.toLowerCase())
      );
    }

    if (searchTerm.to) {
      trips = trips.filter((trip) =>
        trip.destinationCity
          ?.toLowerCase()
          .includes(searchTerm.to.toLowerCase())
      );
    }

    // Apply latest arrival, override if specific date exists
    if (searchTerm.arrival) {
      const latestArrival = new Date(searchTerm.arrival);
      latestArrival.setHours(23, 59, 59, 999); // Set to end of day

      trips = trips.filter(
        (trip) =>
          trip.arrivalDate && new Date(trip.arrivalDate) <= latestArrival
      );
    }

    // Filter by arrival date - entire day range
    if (filterTerm.arrDate) {
      // Convert string timestamp to number for comparison
      const arrDateTimestamp = parseInt(filterTerm.arrDate, 10);

      if (!isNaN(arrDateTimestamp)) {
        // arrDate from frontend is already end of day timestamp
        trips = trips.filter((trip) => {
          return trip.arrivalDate && trip.arrivalDate <= arrDateTimestamp;
        });
      }
    }

    // Filter by departure date - entire day range
    if (filterTerm.depDate) {
      // Convert string timestamp to number for comparison
      const depDateTimestamp = parseInt(filterTerm.depDate, 10);

      if (!isNaN(depDateTimestamp)) {
        // depDate from frontend is start of day timestamp
        trips = trips.filter((trip) => {
          return trip.departureDate && trip.departureDate >= depDateTimestamp;
        });
      }
    }

    // Filter for type of truck
    if (filterTerm.truckType && filterTerm.truckType !== "Any") {
      const trucks = await ctx.db.query("truck").collect();
      const truckMap = new Map(trucks.map((truck) => [truck._id, truck]));

      trips = trips.filter((trip) => {
        const truck = trip.truckId ? truckMap.get(trip.truckId) : null;
        return truck && truck.truckType === filterTerm.truckType;
      });
    }

    // Filter for Width
    if (filterTerm.width) {
      const trucks = await ctx.db.query("truck").collect();
      const truckMap = new Map(trucks.map((truck) => [truck._id, truck]));

      trips = trips.filter((trip) => {
        const truck = trip.truckId ? truckMap.get(trip.truckId) : null;
        return truck && truck.width === Number(filterTerm.width);
      });
    }

    // Filter for Length
    if (filterTerm.length) {
      const trucks = await ctx.db.query("truck").collect();
      const truckMap = new Map(trucks.map((truck) => [truck._id, truck]));

      trips = trips.filter((trip) => {
        const truck = trip.truckId ? truckMap.get(trip.truckId) : null;
        return truck && truck.length === Number(filterTerm.length);
      });
    }

    // Filter for height
    if (filterTerm.height) {
      const trucks = await ctx.db.query("truck").collect();
      const truckMap = new Map(trucks.map((truck) => [truck._id, truck]));

      trips = trips.filter((trip) => {
        const truck = trip.truckId ? truckMap.get(trip.truckId) : null;
        return truck && truck.height === Number(filterTerm.height);
      });
    }

    // Filter for Payload Capacity
    if (filterTerm.payload) {
      const trucks = await ctx.db.query("truck").collect();
      const truckMap = new Map(trucks.map((truck) => [truck._id, truck]));

      trips = trips.filter((trip) => {
        const truck = trip.truckId ? truckMap.get(trip.truckId) : null;
        return truck && truck.maxLoadCapacity === Number(filterTerm.payload);
      });
    }

    // Make sure trip isExpired != true
    trips = trips.filter((trip) => {
      return trip.isExpired != true;
    });

    return trips;
  },
});

// get by Id
export const getById = query({
  args: { tripId: v.id("trip") },
  handler: async (ctx, { tripId }) => {
    return await ctx.db.get(tripId);
  },
});

// Set trip booked
export const setTripBooked = mutation({
  args: { tripId: v.id("trip") },
  handler: async (ctx, { tripId }) => {
    const trip = await ctx.db.get(tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    await ctx.db.patch(tripId, {
      isBooked: true,
    });

    return trip._id;
  },
});

// Set trip adresses
export const setTripAddresses = mutation({
  args: {
    tripId: v.id("trip"),
    originAdress: v.string(),
    destinationAddress: v.string(),
  },
  handler: async (ctx, { tripId, originAdress, destinationAddress }) => {
    const trip = await ctx.db.get(tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    await ctx.db.patch(tripId, {
      originAddress: originAdress,
      destinationAddress: destinationAddress,
    });

    return trip._id;
  },
});

// Set trip cancelled
export const setTripCancelled = mutation({
  args: { tripId: v.id("trip") },
  handler: async (ctx, { tripId }) => {
    const trip = await ctx.db.get(tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    await ctx.db.patch(tripId, {
      isBooked: false,
      originAddress: "",
      destinationAddress: "",
    });

    return trip._id;
  },
});

// Get trip by Id array
export const getTripByIdArray = query({
  args: {
    tripIds: v.array(v.id("trip")),
  },
  handler: async (ctx, { tripIds }) => {
    const trips = await Promise.all(tripIds.map((id) => ctx.db.get(id)));
    return trips.filter((trip) => trip !== null); // Remove any nulls if trips were deleted
  },
});

// Get trips by IssuerID
export const getTripsByIssuerId = query({
  args: { issuerId: v.union(v.id("users"), v.literal("skip")) },
  handler: async (ctx, args) => {
    if (args.issuerId === "skip") return [];

    return await ctx.db
      .query("trip")
      .filter((q) => q.eq(q.field("userId"), args.issuerId))
      .collect();
  },
});

// Delete trip by Id
export const deleteTripById = mutation({
  args: { tripId: v.id("trip") },
  handler: async (ctx, { tripId }) => {
    const trip = await ctx.db.get(tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Delete the trip
    await ctx.db.delete(tripId);

    return trip._id;
  },
});

// Create trip mutation
// Create trip mutation
export const createTrip = mutation({
  args: {
    userId: v.id("users"),
    truckId: v.id("truck"),
    originCity: v.string(),
    destinationCity: v.string(),
    departureDate: v.string(),
    arrivalDate: v.string(),
    basePrice: v.number(),
    KMPrice: v.number(),
    KGPrice: v.number(),
    isBooked: v.boolean(),
    originAddress: v.string(),
    destinationAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // Convert string timestamps to numbers
    const departureTimestamp = parseInt(args.departureDate, 10);
    const arrivalTimestamp = parseInt(args.arrivalDate, 10);

    // Validate the timestamps
    if (isNaN(departureTimestamp) || isNaN(arrivalTimestamp)) {
      throw new Error("Invalid date format provided");
    }

    if (arrivalTimestamp <= departureTimestamp) {
      throw new Error("Arrival date must be after departure date");
    }

    // Double-check truck availability on the backend (pass numeric timestamps)
    const availability = await ctx.runQuery(api.truck.isTruckAvailable, {
      truckId: args.truckId,
      departureDate: departureTimestamp, // Pass numeric timestamp
      arrivalDate: arrivalTimestamp,
    });

    if (!availability.isAvailable) {
      throw new Error(
        `Truck is not available during the selected time period. Conflicts with ${availability.conflictingTrips.length} existing trip(s).`
      );
    }

    // Create the trip if truck is available
    const tripId = await ctx.db.insert("trip", {
      userId: args.userId,
      truckId: args.truckId,
      originCity: args.originCity,
      destinationCity: args.destinationCity,
      departureDate: departureTimestamp, // Store as number (UTC timestamp)
      arrivalDate: arrivalTimestamp, // Store as number (UTC timestamp)
      basePrice: args.basePrice,
      KMPrice: args.KMPrice,
      KGPrice: args.KGPrice,
      isBooked: args.isBooked,
      originAddress: args.originAddress,
      destinationAddress: args.destinationAddress,
      isExpired: false,
    });

    return tripId;
  },
});

// get trips by truckId that have upcomming trips
export const getTripsByTruckId = query({
  args: { truckId: v.id("truck") },
  handler: async (ctx, args) => {
    const currentDate = new Date().getTime();

    const trips = await ctx.db
      .query("trip")
      .filter((q) =>
        q.and(
          q.eq(q.field("isExpired"), false),
          q.or(
            // Check for upcoming trips
            q.gt(q.field("departureDate"), currentDate),
            // Check for trips in progress (between departure and arrival)
            q.and(
              q.lte(q.field("departureDate"), currentDate),
              q.gte(q.field("arrivalDate"), currentDate)
            )
          )
        )
      )
      .filter((q) => q.eq(q.field("truckId"), args.truckId))
      .collect();

    return trips;
  },
});
