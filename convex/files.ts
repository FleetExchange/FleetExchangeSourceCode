// convex/files.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upload a new file
export const uploadFile = mutation({
  args: {
    userId: v.id("users"),
    fileName: v.string(),
    fileId: v.id("_storage"),
    fileType: v.string(),
    fileSize: v.number(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fileRecord = await ctx.db.insert("files", {
      ...args,
      uploadedAt: Date.now(),
    });

    return fileRecord;
  },
});

// Get all files for a user
export const getUserFiles = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get files by category for a user
export const getFilesByCategory = query({
  args: {
    userId: v.id("users"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

// Get a specific file by ID
export const getFileById = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

// Update file metadata (rename, change category, etc.)
export const updateFile = mutation({
  args: {
    fileId: v.id("files"),
    fileName: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { fileId, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error("No valid updates provided");
    }

    await ctx.db.patch(fileId, cleanUpdates);
    return await ctx.db.get(fileId);
  },
});

// Replace a file (upload new version, delete old)
export const replaceFile = mutation({
  args: {
    fileId: v.id("files"),
    newFileId: v.id("_storage"),
    fileName: v.optional(v.string()),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const existingFile = await ctx.db.get(args.fileId);
    if (!existingFile) {
      throw new Error("File not found");
    }

    // Delete old file from storage
    await ctx.storage.delete(existingFile.fileId);

    // Update the file record with new file data
    await ctx.db.patch(args.fileId, {
      fileId: args.newFileId,
      fileName: args.fileName || existingFile.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedAt: Date.now(),
    });

    return await ctx.db.get(args.fileId);
  },
});

// Delete a file completely
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Delete from storage
    await ctx.storage.delete(file.fileId);

    // Delete from database
    await ctx.db.delete(args.fileId);

    return { success: true, deletedFile: file };
  },
});

// Delete all files for a user
export const deleteAllUserFiles = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userFiles = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Delete all files from storage and database
    for (const file of userFiles) {
      await ctx.storage.delete(file.fileId);
      await ctx.db.delete(file._id);
    }

    return { success: true, deletedCount: userFiles.length };
  },
});

// Delete files by category for a user
export const deleteFilesByCategory = mutation({
  args: {
    userId: v.id("users"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();

    // Delete all matching files
    for (const file of files) {
      await ctx.storage.delete(file.fileId);
      await ctx.db.delete(file._id);
    }

    return { success: true, deletedCount: files.length };
  },
});

// Get file URL for download/display
export const getFileUrl = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    return await ctx.storage.getUrl(file.fileId);
  },
});
