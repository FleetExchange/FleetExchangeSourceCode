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
    variablePrice: v.number(), // Variable amount for each kg
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
    amount: v.number(), // Final amount of the sale
    pickupInstructions: v.string(), // Any notes for the transporting company relating to the pickup and delivery of the freight
    deliveryInstructions: v.string(),
    freightNotes: v.string(), // Description of the freight
    cargoWeight: v.number(), // Total weight of the items to be shipped
    tripRating: v.optional(v.number()), // Rating of the trip out of 5
    tripRatingComment: v.optional(v.string()), // Comment for the rating
  }),

  freightRequest: defineTable({
    originCity: v.string(), // Origin city of departure
    destinationCity: v.string(), // Destination of arrival
    freightDescription: v.string(), // Description of what needs to be shipped
    departureDate: v.number(), // Departure Date
    arrivalDate: v.number(), // Arrival Date
    loadWeight: v.number(), // Total weight of the items to be shipped
    userId: v.id("users"), // Creator of freight request
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
    createdAt: v.optional(v.number()), // Make this optional
    averageRating: v.optional(v.number()), // Average rating of the user
    ratingCount: v.optional(v.number()), // Number of ratings received by the user
    about: v.optional(v.string()), // About section for the user
    profileImageFileId: v.optional(v.id("_storage")), // profile image
    address: v.optional(v.string()), // Address of the user
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
  }).index("by_user", ["userId"]),
});
