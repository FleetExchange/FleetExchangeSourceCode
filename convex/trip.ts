// ** DISCLAIMER **
// TIME FILTERS ONLY WORK WITH GMT+2
//

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { cronJobs } from "convex/server";

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
      depTime: v.string(),
      arrDate: v.string(),
      arrTime: v.string(),
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

    // Apply latest arrival, overrride if specific date exists
    if (searchTerm.arrival) {
      const latestArrival = new Date(searchTerm.arrival);
      latestArrival.setHours(23, 59, 59, 999); // Set to end of day

      trips = trips.filter(
        (trip) =>
          trip.arrivalDate && new Date(trip.arrivalDate) <= latestArrival
      );
    }

    // Create a arrival Date object set to a default and update time part based on the filters
    // If specific time is give, 1 hour window is applied both sides
    if (filterTerm.arrDate) {
      if (filterTerm.arrTime) {
        const [hours, minutes] = filterTerm.arrTime.split(":").map(Number);
        const arrivalDate = new Date(filterTerm.arrDate);
        arrivalDate.setHours(hours, minutes, 0, 0);

        const windowStart = new Date(arrivalDate);
        windowStart.setHours(hours - 3, minutes, 0, 0);

        const windowEnd = new Date(arrivalDate);
        windowEnd.setHours(hours - 1, minutes, 59, 999);

        trips = trips.filter((trip) => {
          const arr = new Date(trip.arrivalDate);
          return arr >= windowStart && arr <= windowEnd;
        });
      } else {
        const startOfDay = new Date(filterTerm.arrDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(filterTerm.arrDate);
        endOfDay.setHours(23, 59, 59, 999);

        trips = trips.filter((trip) => {
          const arr = new Date(trip.arrivalDate);
          return arr >= startOfDay && arr <= endOfDay;
        });
      }
    }

    // Create a departure Date object set to a default and update time part based on the filters
    // If specific time is give, 1 hour window is applied both sides
    if (filterTerm.depDate) {
      if (filterTerm.depTime) {
        const [hours, minutes] = filterTerm.depTime.split(":").map(Number);
        const depDate = new Date(filterTerm.depDate);
        depDate.setHours(hours, minutes, 0, 0);

        const windowStart = new Date(depDate);
        windowStart.setHours(hours - 3, minutes, 0, 0);

        const windowEnd = new Date(depDate);
        windowEnd.setHours(hours - 1, minutes, 59, 999);

        trips = trips.filter((trip) => {
          const arr = new Date(trip.departureDate);
          return arr >= windowStart && arr <= windowEnd;
        });
      } else {
        const startOfDay = new Date(filterTerm.depDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(filterTerm.depDate);
        endOfDay.setHours(23, 59, 59, 999);

        trips = trips.filter((trip) => {
          const arr = new Date(trip.departureDate);
          return arr >= startOfDay && arr <= endOfDay;
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

    // make sure trip isExpire != true
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
export const createTrip = mutation({
  args: {
    userId: v.id("users"),
    truckId: v.id("truck"),
    originCity: v.string(),
    originAddress: v.string(),
    destinationCity: v.string(),
    destinationAddress: v.string(),
    departureDate: v.string(),
    arrivalDate: v.string(),
    basePrice: v.number(),
    KMPrice: v.number(),
    KGPrice: v.number(),
    isBooked: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trip", {
      userId: args.userId,
      truckId: args.truckId,
      originCity: args.originCity,
      originAddress: args.originAddress,
      destinationCity: args.destinationCity,
      destinationAddress: args.destinationAddress,
      departureDate: Date.parse(args.departureDate),
      arrivalDate: Date.parse(args.arrivalDate),
      basePrice: args.basePrice,
      KMPrice: args.KMPrice,
      KGPrice: args.KGPrice,
      isBooked: args.isBooked,
    });
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
      .filter((q) => q.eq(q.field("truckId"), args.truckId))
      .collect();

    return trips;
  },
});
