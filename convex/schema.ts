import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { TRUCK_TYPES } from "../shared/truckTypes";

// How the database looks
// All entries have automatic _id fields

export default defineSchema({
  trip: defineTable({
    originCity: v.string(), // Origin city of departure
    originAddress: v.string(), // Will be completed when the client books trip
    destinationCity: v.string(), // Destination of arrival
    destinationAddress: v.string(), // Will be completed when the client books trip
    departureDate: v.number(), // Departure Date
    arrivalDate: v.number(), // Arrival Date
    truckId: v.id("truck"), // Identification of the truck assigned to the trip
    basePrice: v.number(), // Base price for the trip
    KGPrice: v.number(), // Variable amount for each kg
    KMPrice: v.number(), // Variable amount for each km
    userId: v.id("users"), // Company that created trip
    isBooked: v.boolean(), // Has the trip been booked
    isExpired: v.optional(v.boolean()),
  }),

  purchaseTrip: defineTable({
    tripId: v.id("trip"), // id of the trick of the purchase item
    userId: v.id("users"), // id of the user that booked the trip
    purchasedAt: v.number(), // Date & time of purchase
    status: v.union(
      // Status of the trip
      v.literal("Awaiting Confirmation"),
      v.literal("Booked"),
      v.literal("Dispatched"),
      v.literal("Delivered"),
      v.literal("Cancelled"),
      v.literal("Refunded")
    ),
    paymentIntentId: v.optional(v.string()),

    // Cost breakdown
    clientPayable: v.number(), // Final amount of the sale to be paid by the client
    tripTotal: v.number(), // Total cost of the trip as specified by the transporter
    transporterAmount: v.number(), // Amount the transporter will receive after commission
    commissionAmount: v.number(), // Amount the platform will take as commission
    commissionPercentage: v.number(), // Percentage of the commission

    pickupInstructions: v.string(), // Any notes for the transporting company relating to the pickup and delivery of the freight
    deliveryInstructions: v.string(),
    freightNotes: v.string(), // Description of the freight
    cargoWeight: v.number(), // Total weight of the items to be shipped
    distance: v.number(), // Distance of the trip in km after specific addresses has been set
    tripRating: v.optional(v.number()), // Rating of the trip out of 5
    tripRatingComment: v.optional(v.string()), // Comment for the rating
  }),

  users: defineTable({
    clerkId: v.string(),
    role: v.union(
      v.literal("client"),
      v.literal("transporter"),
      v.literal("admin")
    ),
    isApproved: v.boolean(),
    email: v.string(),
    name: v.string(),
    contactNumber: v.string(),
    createdAt: v.optional(v.number()),
    averageRating: v.optional(v.number()), // Average rating out of 5
    ratingCount: v.optional(v.number()),
    about: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()), // Clerk profile image URL
    address: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  fleet: defineTable({
    fleetName: v.string(), // Name of the fleet
    userId: v.id("users"), // The user that owns the fleet 1 to 1 relationship
    trucks: v.array(v.id("truck")), // Array of all trucks in the fleet indexed by thier _id
  }),

  truck: defineTable({
    registration: v.string(), // Identifier for the truck
    make: v.string(), // Name of the truck brand
    model: v.string(), // Model of the truck
    year: v.string(), // Year trick was manufactured
    truckType: v.union(...TRUCK_TYPES.map(v.literal)), // Type of truck
    maxLoadCapacity: v.number(), // Max weight truck can bear
    width: v.number(), // Width of the cargo area
    length: v.number(), // Length of the cargo area
    height: v.number(), // Height of cargo area
  }),

  files: defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    fileId: v.id("_storage"),
    fileType: v.string(),
    fileSize: v.number(),
    uploadedAt: v.number(),
    category: v.optional(v.string()),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("needs_resubmission")
    ),
    verifiedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  payoutAccount: defineTable({
    userId: v.id("users"),
    accountName: v.string(),
    accountNumber: v.string(),
    bankCode: v.string(),
    bankName: v.string(), // Add this
    email: v.optional(v.string()),
    phone: v.optional(v.string()),

    // Paystack integration fields
    paystackRecipientCode: v.string(), // Make required
    recipientId: v.optional(v.string()),
    isVerified: v.boolean(), // Make required

    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  userQueries: defineTable({
    userId: v.id("users"), // Reference to the user who made the query
    queryText: v.string(), // The text of the user's query
    createdAt: v.number(), // Timestamp when the query was created
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("trip"),
      v.literal("booking"),
      v.literal("payment"),
      v.literal("system"),
      v.literal("account"),
      v.literal("paymentRequest")
    ), // Only these types allowed
    message: v.string(),
    createdAt: v.number(),
    read: v.boolean(),
    meta: v.optional(v.any()),
  }).index("by_user", ["userId"]),

  payments: defineTable({
    userId: v.id("users"), // Client who made payment
    transporterId: v.id("users"), // Transporter receiving payment
    tripId: v.id("trip"),
    purchaseTripId: v.id("purchaseTrip"),

    // Paystack fields
    // paystackInitReference = reference returned by transaction.initialize (optional until customer pays)
    paystackInitReference: v.optional(v.string()),
    // paystackReference = final captured transaction reference (optional until captured)
    paystackReference: v.optional(v.string()),

    // Payment request / flow metadata
    paymentRequestUrl: v.optional(v.string()), // authorization_url returned by initialize
    paymentRequestedAt: v.optional(v.number()), // when request was created (ms)
    paymentDeadline: v.optional(v.number()), // timestamp (ms) after which request expires
    paymentAttempts: v.optional(v.number()), // how many charge/init attempts

    // Payment amounts (in ZAR)
    totalAmount: v.number(), // Full amount client pays
    commissionAmount: v.number(), // Your platform commission
    transporterAmount: v.number(), // Amount transporter receives

    // Accounting fields
    gatewayFee: v.optional(v.number()), // gateway fees for the transaction (store after capture)
    refundedAmount: v.optional(v.number()),

    // Payment status (expanded)
    status: v.union(
      v.literal("pending"), // Payment record created but no request yet
      v.literal("payment_requested"), // initialize called, waiting for customer to pay
      v.literal("charged"), // Payment taken from client (capture success)
      v.literal("released"), // Payment sent to transporter
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("refund_failed"),
      v.literal("forfeited") // customer failed to pay within deadline
    ),

    // Transfer tracking
    transferReference: v.optional(v.string()),
    transferredAt: v.optional(v.number()),

    // timestamps
    createdAt: v.number(),
    chargedAt: v.optional(v.number()),
    releasedAt: v.optional(v.number()),
  })
    .index("by_trip", ["tripId"])
    .index("by_purchase_trip", ["purchaseTripId"])
    .index("by_init_reference", ["paystackInitReference"])
    .index("by_reference", ["paystackReference"])
    .index("by_status_deadline", ["status", "paymentDeadline"]),
});
