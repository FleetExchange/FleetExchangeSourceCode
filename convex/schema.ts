import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// How the database looks

export default defineSchema({
  trip: defineTable({
    source: v.string(),
    destination: v.string(),
    truckDescription: v.string(),
    pickupDate: v.number(),
    deliveryDate: v.number(),
    price: v.number(),
    loadCapacity: v.number(),
    userId: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    is_cancelled: v.optional(v.boolean()),
  }),

  freight: defineTable({
    source: v.string(),
    destination: v.string(),
    freightDescription: v.string(),
    pickupDate: v.number(),
    deliveryDate: v.number(),
    price: v.number(),
    loadWeight: v.number(),
    userId: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    is_cancelled: v.optional(v.boolean()),
  }),

  purchaseTrip: defineTable({
    tripId: v.id("trip"),
    userId: v.string(),
    purchasedAt: v.number(),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    paymentIntentId: v.optional(v.string()),
    amount: v.optional(v.number()),
  })
    .index("by_trip", ["tripId"])
    .index("by_user", ["userId"])
    .index("by_user_trip", ["userId", "tripId"])
    .index("by_payment_intent", ["paymentIntentId"]),

  purchaseFreight: defineTable({
    freightId: v.id("freight"),
    userId: v.string(),
    purchasedAt: v.number(),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    paymentIntentId: v.optional(v.string()),
    amount: v.optional(v.number()),
  })
    .index("by_freight", ["freightId"])
    .index("by_user", ["userId"])
    .index("by_user_freight", ["userId", "freightId"])
    .index("by_payment_intent", ["paymentIntentId"]),

  /*waitingList: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("offered"),
      v.literal("purchased"),
      v.literal("expired")
    ),
    offerExpiresAt: v.optional(v.number()),
  })
    .index("by_event_status", ["eventId", "status"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_user", ["userId"]),*/

  users: defineTable({
    name: v.string(),
    email: v.string(),
    userId: v.string(),
    stripeConnectId: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"]),
});
