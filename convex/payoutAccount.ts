import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create payout account
export const createPayoutAccount = mutation({
  args: {
    userId: v.id("users"),
    accountName: v.string(),
    accountNumber: v.string(),
    bankCode: v.string(),
    bankName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    paystackRecipientCode: v.string(),
    recipientId: v.optional(v.string()),
    isVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if user already has a payout account
    const existingAccount = await ctx.db
      .query("payoutAccount")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingAccount) {
      throw new Error("User already has a payout account");
    }

    return await ctx.db.insert("payoutAccount", {
      userId: args.userId,
      accountName: args.accountName,
      accountNumber: args.accountNumber,
      bankCode: args.bankCode,
      bankName: args.bankName,
      email: args.email,
      phone: args.phone,
      paystackRecipientCode: args.paystackRecipientCode,
      recipientId: args.recipientId,
      isVerified: args.isVerified,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get payout account by user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payoutAccount")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Delete payout account by user
export const deleteByUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("payoutAccount")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (account) {
      await ctx.db.delete(account._id);
    }
  },
});
