import { useQuery } from "convex/react";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Create a notification and schedule its email
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("trip"),
      v.literal("booking"),
      v.literal("payment"),
      v.literal("system"),
      v.literal("account"),
      v.literal("paymentRequest")
    ),
    message: v.string(),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      message: args.message,
      createdAt: Date.now(),
      read: false,
      meta: args.meta,
    });

    // Fire-and-forget: render & send email in an action
    await ctx.scheduler.runAfter(0, api.emails.sendForNotification, {
      notificationId: id,
    });

    return id;
  },
});

// Get notifications for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { read: true });
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.delete(notificationId);
  },
});

// Delete payment notification for a specific trip and user
export const deletePaymentNotificationForTrip = mutation({
  args: {
    userId: v.id("users"),
    paymentId: v.id("payments"),
    purchTripId: v.id("purchaseTrip"),
  },
  handler: async (ctx, { userId, paymentId, purchTripId }) => {
    const paymentNotifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("type"), "paymentRequest"))
      .filter((q) => q.eq(q.field("meta.paymentId"), paymentId))
      .filter((q) => q.eq(q.field("meta.purchaseTripId"), purchTripId))
      .collect();

    for (const notif of paymentNotifications) {
      await ctx.db.delete(notif._id);
    }
  },
});

// Check Transporter Account for account setup
export const checkTransporterAccountSetup = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Check if the transporter has a payout account
    const validPayout = await ctx.runQuery(api.payoutAccount.getByUser, {
      userId,
    });

    if (!validPayout) {
      // Check if payout notification already exists and is unread
      const existingPayoutNotif = await ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("type"), "payment"))
        .filter((q) => q.eq(q.field("read"), false))
        .first();

      if (!existingPayoutNotif) {
        await ctx.runMutation(api.notifications.createNotification, {
          userId,
          type: "payment",
          message: "Please set up your payout account to receive payments.",
          meta: { action: "setup_payout" },
        });
      }
    } else {
      // If payout account exists, mark any existing payout notifications as read
      const payoutNotifications = await ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("type"), "payment"))
        .filter((q) => q.eq(q.field("read"), false))
        .collect();

      for (const notif of payoutNotifications) {
        await ctx.db.patch(notif._id, { read: true });
      }
    }

    // Check documents
    const companyReg = await ctx.runQuery(api.files.getFilesByCategory, {
      userId,
      category: "companyReg",
    });
    const directorId = await ctx.runQuery(api.files.getFilesByCategory, {
      userId,
      category: "directorId",
    });
    const terms = await ctx.runQuery(api.files.getFilesByCategory, {
      userId,
      category: "transporterTerms",
    });
    const insurance = await ctx.runQuery(api.files.getFilesByCategory, {
      userId,
      category: "insurance",
    });
    const roadworthy = await ctx.runQuery(api.files.getFilesByCategory, {
      userId,
      category: "roadworthy",
    });
    const professionalLicense = await ctx.runQuery(
      api.files.getFilesByCategory,
      {
        userId,
        category: "professionalLicense",
      }
    );
    const operatingLicense = await ctx.runQuery(api.files.getFilesByCategory, {
      userId,
      category: "operatingLicense",
    });

    if (
      !(
        terms?.length > 0 &&
        insurance?.length > 0 &&
        companyReg?.length > 0 &&
        directorId?.length > 0 &&
        professionalLicense?.length > 0 &&
        operatingLicense?.length > 0 &&
        roadworthy?.length > 0
      )
    ) {
      //debug
      console.log(
        terms?.length,
        insurance?.length,
        companyReg?.length,
        directorId?.length,
        professionalLicense?.length,
        operatingLicense?.length,
        roadworthy?.length
      );

      // Check if document notification already exists and is unread
      const existingDocNotif = await ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("type"), "account"))
        .filter((q) => q.eq(q.field("read"), false))
        .first();

      if (!existingDocNotif) {
        await ctx.runMutation(api.notifications.createNotification, {
          userId,
          type: "account",
          message:
            "Please ensure all required documents are uploaded under the account page.",
          meta: { action: "upload_documents" },
        });
      }
    } else {
      // If all documents exist, mark any existing document notifications as read
      const docNotifications = await ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("type"), "account"))
        .filter((q) => q.eq(q.field("read"), false))
        .collect();

      for (const notif of docNotifications) {
        await ctx.db.patch(notif._id, { read: true });
      }
    }
  },
});

// Check Client Account for account setup
export const checkClientAccountSetup = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Check documents
    const directorId = await ctx.runQuery(api.files.getFilesByCategory, {
      userId,
      category: "directorId",
    });

    const companyReg = await ctx.runQuery(api.files.getFilesByCategory, {
      userId,
      category: "companyReg",
    });

    if (!(directorId?.length > 0 && companyReg?.length > 0)) {
      // Check if document notification already exists and is unread
      const existingDocNotif = await ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("type"), "account"))
        .filter((q) => q.eq(q.field("read"), false))
        .first();

      if (!existingDocNotif) {
        await ctx.runMutation(api.notifications.createNotification, {
          userId,
          type: "account",
          message:
            "Please ensure all required documents are uploaded under the account page.",
          meta: { action: "upload_documents" },
        });
      }
    } else {
      // If all documents exist, mark any existing document notifications as read
      const docNotifications = await ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("type"), "account"))
        .filter((q) => q.eq(q.field("read"), false))
        .collect();

      for (const notif of docNotifications) {
        await ctx.db.patch(notif._id, { read: true });
      }
    }
  },
});
