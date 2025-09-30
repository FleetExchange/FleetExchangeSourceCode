import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const crons = cronJobs();

crons.interval(
  "markExpiredTrips",
  { minutes: 1 }, // Runs every minute
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

// Check if payment is past due and mark as forfeited and cleanup
crons.interval(
  "forfeitUnpaidBookings",
  { minutes: 10 }, // Runs every 10 minutes
  internal.crons.forfeitUnpaidBookings
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

        // Send notifications for each expired trip
        await ctx.runMutation(api.notifications.createNotification, {
          userId: trip.userId,
          type: "trip",
          message: `Your trip to ${trip.destinationCity} has been marked as expired as it was not booked before the departure date.`,
          meta: {
            tripId: trip._id,
            action: "trip_expired",
          },
        });

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

export const expiredUnconfirmedTrips = internalMutation({
  handler: async (ctx) => {
    const currentDate = Date.now();
    const currentSAST = formatDateTimeInSAST(currentDate);

    console.log(
      `⏰ Checking for expired unconfirmed trips at ${currentSAST.fullDateTime} (SAST)`
    );

    // Find purchaseTrips that are awaiting confirmation
    const purchaseTrips = await ctx.db
      .query("purchaseTrip")
      .filter((q) => q.eq(q.field("status"), "Awaiting Confirmation"))
      .collect();

    if (purchaseTrips.length === 0) {
      console.log(
        `⏰ No unconfirmed trips found at ${currentSAST.fullDateTime} (SAST)`
      );
      return 0;
    }

    // Safety: limit work per run to avoid long-running cron jobs
    const BATCH_LIMIT = 100;
    const toProcess = purchaseTrips.slice(0, BATCH_LIMIT);

    let updatedCount = 0;
    for (const purchaseTrip of toProcess) {
      try {
        // Defensive: ensure IDs exist
        if (!purchaseTrip || !purchaseTrip.tripId) {
          console.warn("Skipping invalid purchaseTrip entry", purchaseTrip);
          continue;
        }

        // Load the trip and verify it has passed and is not already expired
        const trip = await ctx.db.get(purchaseTrip.tripId as Id<"trip">);
        if (!trip) {
          console.warn(
            `Trip ${purchaseTrip.tripId} not found for purchaseTrip ${purchaseTrip._id}`
          );
          continue;
        }
        if (!(trip.departureDate < currentDate) || trip.isExpired) {
          // Not expired yet or already handled
          continue;
        }

        const tripDeparture = formatDateTimeInSAST(trip.departureDate);

        // Find the payment specifically for this purchaseTrip + trip
        const payment = await ctx.db
          .query("payments")
          .filter((q) =>
            q.and(
              q.eq(q.field("tripId"), trip._id),
              q.eq(q.field("purchaseTripId"), purchaseTrip._id)
            )
          )
          .first();

        // Safety checks before deleting financial records:
        // - If a payment exists and is in a terminal charged/refunded state, skip destructive cleanup and log
        const terminalPayment =
          payment &&
          ["charged", "refunded", "forfeited"].includes(payment.status);
        if (payment && terminalPayment) {
          console.warn(
            `Skipping cleanup for purchaseTrip ${purchaseTrip._id} because payment ${payment._id} is in terminal state (${payment.status}). Manual review required.`
          );
          continue;
        }

        // Delete payment (only if safe: not charged/refunded)
        if (payment) {
          try {
            await ctx.db.delete(payment._id);
            console.log(
              `🧹 Deleted payment ${payment._id} for expired unconfirmed trip (created at ${formatDateTimeInSAST(payment.createdAt).fullDateTime})`
            );
          } catch (err) {
            console.error(`Failed to delete payment ${payment._id}:`, err);
            // Continue to next item - avoid half-steps
            continue;
          }
        }

        // Delete the purchaseTrip (safe: payment removed or absent)
        try {
          await ctx.db.delete(purchaseTrip._id);
        } catch (err) {
          console.error(
            `Failed to delete purchaseTrip ${purchaseTrip._id}:`,
            err
          );
          // If we couldn't delete the purchaseTrip, do not mark the trip expired to avoid inconsistent state
          continue;
        }

        // Mark the trip as expired / not booked
        try {
          await ctx.db.patch(trip._id, { isExpired: true, isBooked: false });
          updatedCount++;
          console.log(
            `⏰ Marked unconfirmed trip ${trip._id} as expired (was scheduled for ${tripDeparture.fullDateTime} SAST)`
          );
        } catch (err) {
          console.error(`Failed to patch trip ${trip._id} after cleanup:`, err);
        }
      } catch (error) {
        console.error(
          `❌ Failed to process expired purchaseTrip ${purchaseTrip._id}:`,
          error
        );
      }
    }

    if (purchaseTrips.length > BATCH_LIMIT) {
      console.log(
        `⏰ Processed ${toProcess.length} expired unconfirmed trips (batch limit ${BATCH_LIMIT}). More remain and will be processed in subsequent runs.`
      );
    } else {
      console.log(
        `⏰ Processed ${updatedCount} expired unconfirmed trips at ${currentSAST.fullDateTime} (SAST)`
      );
    }

    return updatedCount;
  },
});

export const forfeitUnpaidBookings = internalMutation({
  handler: async (ctx) => {
    // 1 Get all payments with status 'payment_requested' and past paymentDeadline
    const payments = await ctx.db
      .query("payments")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "payment_requested"),
          q.lt(q.field("paymentDeadline"), Date.now())
        )
      )
      .collect();

    // 2. For each payment, mark as forfeited, delete purchaseTrip, set trip to not booked
    for (const payment of payments) {
      try {
        if (!payment || !payment._id) {
          console.warn("Skipping invalid payment entry", payment);
          continue;
        }

        // Ensure still payment_requested (idempotency guard)
        const freshPayment = await ctx.db.get(payment._id);
        if (!freshPayment || freshPayment.status !== "payment_requested") {
          console.log(
            `Skipping payment ${payment._id} because status is ${freshPayment?.status}`
          );
          continue;
        }

        if (!payment.purchaseTripId || !payment.tripId) {
          console.warn(
            `Skipping payment ${payment._id} due to missing related ids`
          );
          continue;
        }

        // Get related records directly
        const purchaseTrip = await ctx.db.get(payment.purchaseTripId);
        const trip = await ctx.db.get(payment.tripId);

        if (!purchaseTrip || !trip) {
          console.warn(
            `⚠️ Skipping payment ${payment._id} due to missing related records`
          );
          continue;
        }

        // Remove the URL from the notification Meta
        // Delete payment notification if it exists
        await ctx.runMutation(
          api.notifications.deletePaymentNotificationForTrip,
          {
            userId: trip.userId as Id<"users">,
            paymentId: payment._id as Id<"payments">,
            purchTripId: purchaseTrip._id as Id<"purchaseTrip">,
          }
        );

        // Mark payment forfeited & related updates
        await ctx.db.patch(payment._id, {
          status: "forfeited",
          paymentRequestUrl: undefined,
          purchaseTripId: undefined,
        }); // remove the link so UI can't use it
        await ctx.db.delete(purchaseTrip._id);
        await ctx.db.patch(trip._id, {
          isBooked: false,
          destinationAddress: "",
          originAddress: "",
        });

        console.log(
          `⚠️ Forfeited payment ${payment._id}, set purchase trip ${purchaseTrip._id} to cancelled, and set trip ${trip._id} to not booked`
        );

        // notify
        await ctx.runMutation(api.notifications.createNotification, {
          userId: trip.userId,
          type: "trip",
          message: `Your trip to ${trip.destinationCity} has been marked as expired due to non-payment by the client. The trip is now available for booking again.`,
          meta: { tripId: trip._id, action: "payment_forfeited" },
        });

        await ctx.runMutation(api.notifications.createNotification, {
          userId: purchaseTrip.userId,
          type: "booking",
          message:
            "Your booking has been forfeited due to non-payment within the deadline. Please book again if you still need the service.",
          meta: { tripId: trip._id, action: "payment_forfeited" },
        });
      } catch (err) {
        console.error("Error processing forfeited payment", payment._id, err);
      }
    }
    return { ok: true };
  },
});

export default crons;
