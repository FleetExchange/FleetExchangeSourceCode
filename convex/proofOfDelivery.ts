import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function validatePdf(mimeType: string, fileSize: number) {
  if (mimeType !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }
  const MAX_BYTES = 15 * 1024 * 1024; // 15MB
  if (fileSize > MAX_BYTES) {
    throw new Error("File too large");
  }
}

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Create a POD for a purchaseTrip (fails if one already exists)
export const create = mutation({
  args: {
    purchaseTripId: v.id("purchaseTrip"),
    fileId: v.id("_storage"),
    fileName: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    validatePdf(args.mimeType, args.fileSize);

    const existing = await ctx.db
      .query("proofOfDelivery")
      .withIndex("by_purchase_trip", (q: any) =>
        q.eq("purchaseTripId", args.purchaseTripId)
      )
      .unique()
      .catch(async () => {
        // If index isn't unique and multiple exist, treat as conflict
        const list = await ctx.db
          .query("proofOfDelivery")
          .withIndex("by_purchase_trip", (q: any) =>
            q.eq("purchaseTripId", args.purchaseTripId)
          )
          .collect();
        if (list.length > 0) return list[0];
        return null;
      });

    if (existing) throw new Error("POD already exists. Use replace.");

    const podId = await ctx.db.insert("proofOfDelivery", {
      purchaseTripId: args.purchaseTripId,
      userId: args.userId,
      fileId: args.fileId,
      fileName: args.fileName,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      uploadedAt: Date.now(),
    });

    const url = await ctx.storage.getUrl(args.fileId);
    return { podId, url };
  },
});

// Get POD for a purchaseTrip (returns null if none)
export const get = query({
  args: { purchaseTripId: v.id("purchaseTrip") },
  handler: async (ctx, { purchaseTripId }) => {
    const pod =
      (await ctx.db
        .query("proofOfDelivery")
        .withIndex("by_purchase_trip", (q: any) =>
          q.eq("purchaseTripId", purchaseTripId)
        )
        .unique()
        .catch(async () => {
          const list = await ctx.db
            .query("proofOfDelivery")
            .withIndex("by_purchase_trip", (q: any) =>
              q.eq("purchaseTripId", purchaseTripId)
            )
            .collect();
          return list[0] ?? null;
        })) ?? null;

    if (!pod) return null;

    const url = await ctx.storage.getUrl(pod.fileId);
    return { ...pod, url };
  },
});

// Replace existing POD (updates file and metadata; creates if missing)
export const replace = mutation({
  args: {
    purchaseTripId: v.id("purchaseTrip"),
    fileId: v.id("_storage"),
    fileName: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    validatePdf(args.mimeType, args.fileSize);

    const existing =
      (await ctx.db
        .query("proofOfDelivery")
        .withIndex("by_purchase_trip", (q: any) =>
          q.eq("purchaseTripId", args.purchaseTripId)
        )
        .unique()
        .catch(async () => {
          const list = await ctx.db
            .query("proofOfDelivery")
            .withIndex("by_purchase_trip", (q: any) =>
              q.eq("purchaseTripId", args.purchaseTripId)
            )
            .collect();
          return list[0] ?? null;
        })) ?? null;

    if (existing) {
      // Optionally delete old file from storage
      try {
        await ctx.storage.delete(existing.fileId);
      } catch {
        // ignore if already gone
      }
      await ctx.db.patch(existing._id, {
        userId: args.userId,
        fileId: args.fileId,
        fileName: args.fileName,
        mimeType: args.mimeType,
        fileSize: args.fileSize,
        uploadedAt: Date.now(),
      });
      const url = await ctx.storage.getUrl(args.fileId);
      return { podId: existing._id, url, replaced: true };
    }

    // If none exists, create new
    const podId = await ctx.db.insert("proofOfDelivery", {
      purchaseTripId: args.purchaseTripId,
      userId: args.userId,
      fileId: args.fileId,
      fileName: args.fileName,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      uploadedAt: Date.now(),
    });
    const url = await ctx.storage.getUrl(args.fileId);
    return { podId, url, replaced: false };
  },
});
