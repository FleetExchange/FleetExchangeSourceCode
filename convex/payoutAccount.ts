import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
