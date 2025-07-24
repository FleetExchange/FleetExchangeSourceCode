import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create payout account
export const createPayoutAccount = mutation({
  args: {
    userId: v.id("users"),
    accountName: v.string(),
    accountNumber: v.string(),
    bankCode: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payoutAccount", {
      userId: args.userId,
      accountName: args.accountName,
      accountNumber: args.accountNumber,
      bankCode: args.bankCode,
      email: args.email,
      phone: args.phone,
      createdAt: Date.now(),
    });
  },
});

// Get payout account by user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("payoutAccount")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
  },
});

// Delete payout account by user
export const deleteByUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const account = await ctx.db
      .query("payoutAccount")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (account) {
      await ctx.db.delete(account._id);
    }
  },
});
