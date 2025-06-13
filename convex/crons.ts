import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const crons = cronJobs();
crons.interval(
  "markExpiredTrips",
  { minutes: 15 }, // Runs every 15 minutes
  internal.crons.markExpiredTrips
);

export const markExpiredTrips = internalMutation({
  handler: async (ctx) => {
    const currentDate = new Date().getTime();

    // Query for unbooked trips that have passed their departure date
    const expiredTrips = await ctx.db
      .query("trip")
      .filter((q) =>
        q.and(
          q.eq(q.field("isBooked"), false),
          q.lt(q.field("departureDate"), currentDate)
        )
      )
      .collect();

    // Update each expired trip
    for (const trip of expiredTrips) {
      await ctx.db.patch(trip._id, {
        isExpired: true,
      });
    }
    console.log(`Updated ${expiredTrips.length} expired trips`);
  },
});

export default crons;
