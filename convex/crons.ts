import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { useQuery } from "convex/react";
import { Id } from "./_generated/dataModel";

const crons = cronJobs();
crons.interval(
  "markExpiredTrips",
  { minutes: 15 }, // Runs every 15 minutes
  internal.crons.markExpiredTrips
);

// Cron job for trip reminders in the next 24 hours
crons.interval(
  "sendTripReminders",
  { hours: 6 }, // Runs every 6 hours to catch trips
  internal.crons.sendTripReminders
);

// Cron job for trip confirm delivery in the last 3 hours
crons.interval(
  "confirmDeliveryReminders",
  { hours: 1 }, // Runs every 1 hours to catch trips
  internal.crons.confirmDeliveryReminders
);

// Cron job to delete notifications older than 10 days
crons.interval(
  "deleteOldNotifications",
  { hours: 24 }, // Runs 24 hours to delete old notifications
  internal.crons.deleteOldNotifications
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
          q.eq(q.field("isExpired"), false),
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

// New function for trip reminders
export const sendTripReminders = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const tomorrow = now + 24 * 60 * 60 * 1000; // 24 hours from now

    // Find trips departing tomorrow (between 24-48 hours from now)
    const upcomingTrips = await ctx.db
      .query("trip")
      .filter((q) =>
        q.and(
          q.eq(q.field("isBooked"), true), // Only booked trips
          q.gte(q.field("departureDate"), now),
          q.lt(q.field("departureDate"), tomorrow)
        )
      )
      .collect();

    // get the purchaseTrip objec that coincides with the trip
    const tripIds = upcomingTrips.map((trip) => trip._id as Id<"trip">);
    const purchasedTrips = useQuery(api.purchasetrip.getPurchaseTripByIdArray, {
      tripIds: tripIds.length > 0 ? tripIds : [],
    });

    const filteredPurchaseTrips =
      purchasedTrips?.filter(
        (trip) => trip.status !== "Cancelled" && trip.status !== "Refunded"
      ) ?? [];

    // for each purch trip departing in next 24
    for (const purchTrip of filteredPurchaseTrips) {
      // Check if reminder already sent to transporter
      const trip = upcomingTrips.find((t) => t._id === purchTrip.tripId);

      if (!trip) continue; // Skip if trip not found

      const existingReminderTransporter = await ctx.db
        .query("notifications")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), trip.userId),
            q.eq(q.field("type"), "trip"),
            q.eq(q.field("meta"), {
              tripId: purchTrip._id,
              action: "trip_reminder",
            })
          )
        )
        .first();

      // if reminder not sent, create a new reminder
      if (!existingReminderTransporter) {
        // Create reminder notification
        await ctx.runMutation(api.notifications.createNotification, {
          userId: trip.userId,
          type: "trip",
          message: `Reminder: Your trip to ${trip.destinationCity} departs tomorrow at ${new Date(trip.departureDate).toLocaleString()}`,
          meta: {
            tripId: trip._id,
            action: "trip_reminder",
          },
        });
      }

      // Check if reminder already sent to client

      const existingReminderClient = await ctx.db
        .query("notifications")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), purchTrip.userId),
            q.eq(q.field("type"), "booking"),
            q.eq(q.field("meta"), {
              tripId: trip._id,
              action: "booking_reminder",
            })
          )
        )
        .first();

      // if reminder not sent, create a new reminder
      if (!existingReminderClient) {
        // Create reminder notification
        await ctx.runMutation(api.notifications.createNotification, {
          userId: purchTrip.userId,
          type: "booking",
          message: `Reminder: Your booking to ${trip.destinationCity} departs tomorrow at ${new Date(trip.departureDate).toLocaleString()}`,
          meta: {
            tripId: trip._id,
            action: "booking_reminder",
          },
        });
      }
    }
    console.log(`Sent ${upcomingTrips.length} trip reminders`);
  },
});

// New function for trip confirm delivery reminders
export const confirmDeliveryReminders = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const threeHoursAgo = now - 3 * 60 * 60 * 1000; // 3 hours ago

    // Find trips delivered in past 3 hours
    const deliveredTrips = await ctx.db
      .query("trip")
      .filter((q) =>
        q.and(
          q.eq(q.field("isBooked"), true), // Only booked trips
          q.gte(q.field("departureDate"), threeHoursAgo),
          q.lt(q.field("departureDate"), now)
        )
      )
      .collect();

    // get the purchaseTrip objec that coincides with the trip
    const tripIds = deliveredTrips.map((trip) => trip._id as Id<"trip">);
    const purchasedTrips = useQuery(api.purchasetrip.getPurchaseTripByIdArray, {
      tripIds: tripIds.length > 0 ? tripIds : [],
    });

    const filteredPurchaseTrips =
      purchasedTrips?.filter(
        (trip) => trip.status !== "Cancelled" && trip.status !== "Refunded"
      ) ?? [];

    // for each purch trip ddelivered in the last 3 hours
    for (const purchTrip of filteredPurchaseTrips) {
      // Check if reminder already sent to transporter
      const trip = deliveredTrips.find((t) => t._id === purchTrip.tripId);

      if (!trip) continue; // Skip if trip not found

      const existingReminder = await ctx.db
        .query("notifications")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), trip.userId),
            q.eq(q.field("type"), "trip"),
            q.eq(q.field("meta"), {
              tripId: purchTrip._id,
              action: "confirmDelivery_reminder",
            })
          )
        )
        .first();

      // if reminder not sent, create a new reminder
      if (!existingReminder) {
        // Create reminder notification
        await ctx.runMutation(api.notifications.createNotification, {
          userId: trip.userId,
          type: "trip",
          message: `Reminder: Confirm delivery of trip to ${trip.destinationCity} that arrived at ${new Date(trip.arrivalDate).toLocaleString()}. Trips have to be confirmed for payment to be released.`,
          meta: {
            tripId: trip._id,
            action: "confirmDelivery_reminder",
          },
        });
      }
    }
    console.log(
      `Sent ${filteredPurchaseTrips.length} trip confirm delivery reminders`
    );
  },
});

export const deleteOldNotifications = internalMutation({
  handler: async (ctx) => {
    const currentDate = new Date().getTime();
    const tenDaysAgo = currentDate - 10 * 24 * 60 * 60 * 1000; // 10 days ago

    // Query for notifications older than 10 days
    const oldNotifications = await ctx.db
      .query("notifications")
      .filter((q) => q.lt(q.field("createdAt"), tenDaysAgo))
      .collect();

    // Delete each old notification
    for (const notification of oldNotifications) {
      await ctx.db.delete(notification._id);
    }
    console.log(`Deleted ${oldNotifications.length} old notifications`);
  },
});

export default crons;
