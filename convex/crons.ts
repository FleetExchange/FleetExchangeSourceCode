import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const crons = cronJobs();

crons.interval(
  "markExpiredTrips",
  { minutes: 5 }, // Runs every 5 minutes
  internal.crons.markExpiredTrips
);

crons.interval(
  "expiredUnconfirmedTrips",
  { minutes: 5 }, // Runs every 5 minutes
  internal.crons.expiredUnconfirmedTrips
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

// Cleanup abandoned bookings
crons.interval(
  "cleanupAbandonedBookings",
  { minutes: 10 }, // Every 10 minutes
  internal.crons.cleanupAbandonedBookings
);

// Helper function to format dates in SAST for cron job logs and notifications
const formatDateTimeInSAST = (dateInput: string | number | Date) => {
  const date = new Date(dateInput);

  const sastDate = date.toLocaleDateString("en-ZA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Africa/Johannesburg",
  });

  const sastTime = date.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Johannesburg",
  });

  return {
    date: sastDate,
    time: sastTime,
    fullDateTime: `${sastDate} at ${sastTime}`,
  };
};

export const markExpiredTrips = internalMutation({
  handler: async (ctx) => {
    const currentDate = new Date().getTime();
    const currentSAST = formatDateTimeInSAST(currentDate);

    console.log(
      `🔍 Checking for expired trips at ${currentSAST.fullDateTime} (SAST)`
    );

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

    console.log(`📊 Found ${expiredTrips.length} potentially expired trips`);

    // Update each expired trip
    let updatedCount = 0;
    for (const trip of expiredTrips) {
      try {
        await ctx.db.patch(trip._id, {
          isExpired: true,
        });
        updatedCount++;

        const tripDeparture = formatDateTimeInSAST(trip.departureDate);
        console.log(
          `✅ Marked trip ${trip._id} as expired (was scheduled for ${tripDeparture.fullDateTime} SAST)`
        );
      } catch (error) {
        console.error(`❌ Failed to update trip ${trip._id}:`, error);
      }
    }

    console.log(
      `✅ Successfully updated ${updatedCount}/${expiredTrips.length} expired trips at ${currentSAST.fullDateTime} (SAST)`
    );
    return updatedCount;
  },
});

// New function for trip reminders
export const sendTripReminders = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const tomorrow = now + 24 * 60 * 60 * 1000; // 24 hours from now
    const nowSAST = formatDateTimeInSAST(now);
    let count = 0;

    console.log(
      `📧 Checking for trip reminders at ${nowSAST.fullDateTime} (SAST)`
    );

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

    // get the purchaseTrip object that coincides with the trip
    const tripIds = upcomingTrips.map((trip) => trip._id as Id<"trip">);

    // Get all purchaseTrips and filter in memory since we can't use arrays in eq()
    const allPurchaseTrips = await ctx.db.query("purchaseTrip").collect();
    const purchasedTrips = allPurchaseTrips.filter((trip) =>
      tripIds.includes(trip.tripId)
    );

    const filteredPurchaseTrips =
      purchasedTrips?.filter(
        (trip) =>
          trip.status !== "Cancelled" &&
          trip.status !== "Refunded" &&
          trip.status !== "Awaiting Confirmation"
      ) ?? [];

    // for each purchase trip departing in next 24
    for (const purchTrip of filteredPurchaseTrips) {
      // Check if reminder already sent to transporter
      const trip = upcomingTrips.find((t) => t._id === purchTrip.tripId);

      if (!trip) continue; // Skip if trip not found

      const tripDeparture = formatDateTimeInSAST(trip.departureDate);

      const existingReminderTransporter = await ctx.db
        .query("notifications")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), trip.userId),
            q.eq(q.field("type"), "trip"),
            q.eq(q.field("meta"), {
              tripId: trip._id,
              action: "trip_reminder",
            })
          )
        )
        .first();

      // if reminder not sent, create a new reminder
      if (!existingReminderTransporter) {
        // Create reminder notification with SAST formatted time
        count++;
        await ctx.runMutation(api.notifications.createNotification, {
          userId: trip.userId,
          type: "trip",
          message: `Reminder: Your trip to ${trip.destinationCity} departs tomorrow at ${tripDeparture.fullDateTime} (SAST)`,
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
        // Create reminder notification with SAST formatted time
        await ctx.runMutation(api.notifications.createNotification, {
          userId: purchTrip.userId,
          type: "booking",
          message: `Reminder: Your booking to ${trip.destinationCity} departs tomorrow at ${tripDeparture.fullDateTime} (SAST)`,
          meta: {
            tripId: trip._id,
            action: "booking_reminder",
          },
        });
      }
    }
    console.log(
      `📧 Sent ${count} trip reminders at ${nowSAST.fullDateTime} (SAST)`
    );
  },
});

// New function for trip confirm delivery reminders
export const confirmDeliveryReminders = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const threeHoursAgo = now - 3 * 60 * 60 * 1000; // 3 hours ago
    const nowSAST = formatDateTimeInSAST(now);
    let count = 0;

    console.log(
      `🚚 Checking for delivery confirmation reminders at ${nowSAST.fullDateTime} (SAST)`
    );

    // Find trips delivered in past 3 hours
    const deliveredTrips = await ctx.db
      .query("trip")
      .filter((q) =>
        q.and(
          q.eq(q.field("isBooked"), true), // Only booked trips
          q.gte(q.field("arrivalDate"), threeHoursAgo), // Changed to arrivalDate
          q.lt(q.field("arrivalDate"), now)
        )
      )
      .collect();

    // get the purchaseTrip object that coincides with the trip
    const tripIds = deliveredTrips.map((trip) => trip._id as Id<"trip">);

    // Get all purchaseTrips and filter in memory since we can't use arrays in eq()
    const allPurchaseTrips = await ctx.db.query("purchaseTrip").collect();
    const purchasedTrips = allPurchaseTrips.filter((trip) =>
      tripIds.includes(trip.tripId)
    );

    const filteredPurchaseTrips =
      purchasedTrips?.filter((trip) => trip.status === "Dispatched") ?? [];

    // for each purchase trip delivered in the last 3 hours
    for (const purchTrip of filteredPurchaseTrips) {
      // Check if reminder already sent to transporter
      const trip = deliveredTrips.find((t) => t._id === purchTrip.tripId);

      if (!trip) continue; // Skip if trip not found

      const tripArrival = formatDateTimeInSAST(trip.arrivalDate);

      const existingReminder = await ctx.db
        .query("notifications")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), trip.userId),
            q.eq(q.field("type"), "trip"),
            q.eq(q.field("meta"), {
              tripId: trip._id,
              action: "confirmDelivery_reminder",
            })
          )
        )
        .first();

      // if reminder not sent, create a new reminder
      if (!existingReminder) {
        // Create reminder notification with SAST formatted time
        count++;
        await ctx.runMutation(api.notifications.createNotification, {
          userId: trip.userId,
          type: "trip",
          message: `Reminder: Confirm delivery of trip to ${trip.destinationCity} that arrived at ${tripArrival.fullDateTime} (SAST). Trips have to be confirmed for payment to be released.`,
          meta: {
            tripId: trip._id,
            action: "confirmDelivery_reminder",
          },
        });
      }
    }
    console.log(
      `🚚 Sent ${count} trip confirm delivery reminders at ${nowSAST.fullDateTime} (SAST)`
    );
  },
});

export const deleteOldNotifications = internalMutation({
  handler: async (ctx) => {
    const currentDate = new Date().getTime();
    const tenDaysAgo = currentDate - 10 * 24 * 60 * 60 * 1000; // 10 days ago
    const currentSAST = formatDateTimeInSAST(currentDate);
    const tenDaysAgoSAST = formatDateTimeInSAST(tenDaysAgo);

    console.log(
      `🗑️ Deleting notifications older than ${tenDaysAgoSAST.fullDateTime} (SAST) at ${currentSAST.fullDateTime} (SAST)`
    );

    // Query for notifications older than 10 days
    const oldNotifications = await ctx.db
      .query("notifications")
      .filter((q) => q.lt(q.field("createdAt"), tenDaysAgo))
      .collect();

    // Delete each old notification
    for (const notification of oldNotifications) {
      await ctx.db.delete(notification._id);
    }
    console.log(
      `🗑️ Deleted ${oldNotifications.length} old notifications at ${currentSAST.fullDateTime} (SAST)`
    );
  },
});

export const cleanupAbandonedBookings = internalMutation({
  handler: async (ctx) => {
    const cutoffTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago
    const currentSAST = formatDateTimeInSAST(Date.now());
    const cutoffSAST = formatDateTimeInSAST(cutoffTime);
    let cleanupCount = 0;

    console.log(
      `🧹 Cleaning up abandoned bookings older than ${cutoffSAST.fullDateTime} (SAST) at ${currentSAST.fullDateTime} (SAST)`
    );

    // Find payments with pending status older than 10 minutes
    const abandonedPayments = await ctx.db
      .query("payments")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "pending"),
          q.lt(q.field("createdAt"), cutoffTime)
        )
      )
      .collect();

    // Cleanup each abandoned payment and its related records
    for (const payment of abandonedPayments) {
      try {
        // Find related purchase trip
        const purchaseTrip = await ctx.db
          .query("purchaseTrip")
          .filter((q) => q.eq(q.field("_id"), payment.purchaseTripId))
          .first();

        if (purchaseTrip) {
          // Set trip as not booked (available again)
          await ctx.runMutation(api.trip.setTripCancelled, {
            tripId: purchaseTrip.tripId,
          });

          // Delete purchase trip
          await ctx.db.delete(purchaseTrip._id);
        }

        // Delete payment
        await ctx.db.delete(payment._id);
        cleanupCount++;

        const paymentCreatedSAST = formatDateTimeInSAST(payment.createdAt);
        console.log(
          `🧹 Cleaned up abandoned payment created at ${paymentCreatedSAST.fullDateTime} (SAST)`
        );
      } catch (error) {
        console.error("Failed to cleanup abandoned booking:", error);
      }
    }

    console.log(
      `🧹 Cleaned up ${cleanupCount} abandoned bookings at ${currentSAST.fullDateTime} (SAST)`
    );
    return cleanupCount;
  },
});

export const expiredUnconfirmedTrips = internalMutation({
  handler: async (ctx) => {
    const currentDate = new Date().getTime();
    const currentSAST = formatDateTimeInSAST(currentDate);

    console.log(
      `⏰ Checking for expired unconfirmed trips at ${currentSAST.fullDateTime} (SAST)`
    );

    // Find purchase Trips that are awaiting confirmation
    const purchaseTrips = await ctx.db
      .query("purchaseTrip")
      .filter((q) => q.eq(q.field("status"), "Awaiting Confirmation"))
      .collect();

    // Extract trip IDs from purchase trips
    const tripIds = purchaseTrips.map((trip) => trip.tripId as Id<"trip">);

    if (tripIds.length === 0) {
      console.log(
        `⏰ No unconfirmed trips found at ${currentSAST.fullDateTime} (SAST)`
      );
      return 0;
    }

    let updatedCount = 0;
    for (const tripId of tripIds) {
      const trip = await ctx.db.get(tripId);
      if (trip && trip.departureDate < currentDate && !trip.isExpired) {
        try {
          const tripDeparture = formatDateTimeInSAST(trip.departureDate);

          const payment = await ctx.db
            .query("payments")
            .filter((q) => q.eq(q.field("tripId"), tripId))
            .first();

          if (payment && payment.paystackReference) {
            // Schedule the refund processing action to run immediately
            await ctx.scheduler.runAfter(0, api.payments.processRefund, {
              paystackReference: payment.paystackReference,
              paymentId: payment._id,
              userId: payment.userId,
              tripId: tripId,
            });
          }

          // Delete the purchase trip
          const purchaseTrip = purchaseTrips.find((pt) => pt.tripId === tripId);
          if (purchaseTrip) {
            await ctx.db.delete(purchaseTrip._id);
          }

          // Update the trip to mark it as expired
          await ctx.db.patch(trip._id, { isExpired: true, isBooked: false });
          updatedCount++;
          console.log(
            `⏰ Marked unconfirmed trip ${trip._id} as expired (was scheduled for ${tripDeparture.fullDateTime} SAST)`
          );
        } catch (error) {
          console.error(`❌ Failed to process expired trip ${tripId}:`, error);
        }
      }
    }

    console.log(
      `⏰ Processed ${updatedCount} expired unconfirmed trips at ${currentSAST.fullDateTime} (SAST)`
    );
    return updatedCount;
  },
});

export default crons;
