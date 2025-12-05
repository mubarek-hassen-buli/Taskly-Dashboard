import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./users";

/**
 * Generate a short-lived upload URL for posting a file.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Save attachment metadata after successful upload.
 */
export const saveAttachment = mutation({
  args: {
    taskId: v.id("tasks"),
    storageId: v.id("_storage"),
    name: v.string(),
    size: v.number(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Verify access (simplified: check if user is in the team of the task's project)
    const project = await ctx.db.get(task.projectId);
    if (!project) throw new Error("Project not found");

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", project.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) throw new Error("Unauthorized");

    await ctx.db.insert("attachments", {
      taskId: args.taskId,
      uploadedBy: userId,
      name: args.name,
      size: args.size,
      type: args.type,
      storageId: args.storageId,
      uploadedAt: Date.now(),
    });

    // Update task attachment count
    await ctx.db.patch(args.taskId, {
      attachmentsCount: task.attachmentsCount + 1,
    });
  },
});

/**
 * List attachments for a task with download URLs.
 */
export const listByTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const task = await ctx.db.get(args.taskId);
    if (!task) return [];

    // Verify access
    const project = await ctx.db.get(task.projectId);
    if (!project) return [];

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", project.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) return [];

    const attachments = await ctx.db
      .query("attachments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    // Get download URLs for each attachment
    const attachmentsWithUrls = await Promise.all(
      attachments.map(async (attachment) => {
        const url = await ctx.storage.getUrl(attachment.storageId);
        return {
          ...attachment,
          url,
        };
      })
    );

    return attachmentsWithUrls;
  },
});

/**
 * Remove an attachment.
 */
export const removeAttachment = mutation({
  args: {
    attachmentId: v.id("attachments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const attachment = await ctx.db.get(args.attachmentId);
    if (!attachment) throw new Error("Attachment not found");

    const task = await ctx.db.get(attachment.taskId);
    if (!task) throw new Error("Task not found");

    // Verify access
    const project = await ctx.db.get(task.projectId);
    if (!project) throw new Error("Project not found");

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", project.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) throw new Error("Unauthorized");

    // Delete from storage
    await ctx.storage.delete(attachment.storageId);

    // Delete attachment record
    await ctx.db.delete(args.attachmentId);

    // Update task attachment count
    await ctx.db.patch(attachment.taskId, {
      attachmentsCount: Math.max(0, task.attachmentsCount - 1),
    });
  },
});
