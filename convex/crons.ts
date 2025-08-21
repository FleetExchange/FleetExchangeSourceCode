import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { useQuery } from "convex/react";
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

export const markExpiredTrips = internalMutation({
  handler: async (ctx) => {
    const currentDate = new Date().getTime();

    console.log(
      `🔍 Checking for expired trips at ${new Date(currentDate).toISOString()}`
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
        console.log(`✅ Marked trip ${trip._id} as expired`);
      } catch (error) {
        console.error(`❌ Failed to update trip ${trip._id}:`, error);
      }
    }

    console.log(
      `✅ Successfully updated ${updatedCount}/${expiredTrips.length} expired trips`
    );
    return updatedCount;
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

    // Get all purchaseTrips and filter in memory since we can't use arrays in eq()
    const allPurchaseTrips = await ctx.db.query("purchaseTrip").collect();
    const purchasedTrips = allPurchaseTrips.filter((trip) =>
      tripIds.includes(trip.tripId)
    );

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

    // Get all purchaseTrips and filter in memory since we can't use arrays in eq()
    const allPurchaseTrips = await ctx.db.query("purchaseTrip").collect();
    const purchasedTrips = allPurchaseTrips.filter((trip) =>
      tripIds.includes(trip.tripId)
    );

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

export const cleanupAbandonedBookings = internalMutation({
  handler: async (ctx) => {
    const cutoffTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago
    let cleanupCount = 0;

    // Find payments with pending status older than 15 minutes
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
      } catch (error) {
        console.error("Failed to cleanup abandoned booking:", error);
      }
    }

    console.log(`✅ Cleaned up ${cleanupCount} abandoned bookings`);
    return cleanupCount;
  },
});

export const expiredUnconfirmedTrips = internalMutation({
  handler: async (ctx) => {
    const currentDate = new Date().getTime();

    // Query for trip that are awaitng confirmation that have passed their departure date

    // Find purchase Trips that are awaiting confirmation
    const purchaseTrips = await ctx.db
      .query("purchaseTrip")
      .filter((q) => q.eq(q.field("status"), "Awaiting Confirmation"))
      .collect();

    // Extract trip IDs from purchase trips
    const tripIds = purchaseTrips.map((trip) => trip.tripId as Id<"trip">);

    // Find the trip objects that match the purchase trip IDs and that are expired
    if (tripIds.length === 0) {
      console.log("No unconfirmed trips found");
      return 0; // No trips to update
    }

    let updatedCount = 0;
    for (const tripId of tripIds) {
      const trip = await ctx.db.get(tripId);
      if (trip && trip.departureDate < currentDate && !trip.isExpired) {
        // Refund the booking
        const payment = useQuery(api.payments.getPaymentByTrip, {
          tripId,
        });

        if (payment && payment.paystackReference) {
          // 3. Refund the payment
          const refundResponse = await fetch("/api/paystack/refund", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: payment.paystackReference,
            }),
          });

          if (refundResponse.ok) {
            // Update payment status
            await ctx.db.patch(payment._id, { status: "refunded" });

            // 5. Notify client
            await ctx.runMutation(api.notifications.createNotification, {
              userId: payment.userId,
              type: "payment",
              message:
                "Your payment has been refunded as the trip was not confirmed.",
              meta: { tripId, action: "payment_refunded" },
            });

            console.log("Trip rejected and payment refunded successfully");
          }

          // Delete the payment
          await ctx.db.delete(payment._id);
        }

        // Delete the purchase trip
        const purchaseTrip = purchaseTrips.find((pt) => pt.tripId === tripId);
        if (purchaseTrip) {
          await ctx.db.delete(purchaseTrip._id);
        }

        // Update the trip to mark it as expired
        await ctx.db.patch(trip._id, { isExpired: true, isBooked: false });
        updatedCount++;
        console.log(`Marked unconfrimed trip ${trip._id} as expired`);
      }
    }

    return updatedCount;
  },
});

export default crons;
