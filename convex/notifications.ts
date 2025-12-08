import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./users";

/**
 * List all notifications for the current user.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_created_at", (q) => q.eq("userId", userId))
      .order("desc") // Newest first
      .take(50); // Limit to last 50

    return notifications;
  },
});

/**
 * Mark a specific notification as read.
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Invalid notification");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });
  },
});

/**
 * Mark all notifications as read for current user.
 */
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .collect();

    await Promise.all(
      unread.map((n) =>
        ctx.db.patch(n._id, {
          isRead: true,
          readAt: Date.now(),
        })
      )
    );
  },
});

/**
 * Clear (delete) all notifications for current user.
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const all = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    await Promise.all(all.map((n) => ctx.db.delete(n._id)));
  },
});

/**
 * Delete a single notification.
 */
export const remove = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Invalid notification");
    }

    await ctx.db.delete(args.notificationId);
  },
});

/**
 * INTERNAL HELPER: Create a notification.
 * Not exported as a public mutation to prevent client-side spamming.
 * Should be called by other mutations.
 */
export async function createNotification(
  ctx: any,
  {
    userId, // Recipient
    type,
    title,
    content,
    targetId,
    targetType,
    senderId,
  }: {
    userId: string; // ID string
    type: string;
    title: string;
    content: string;
    targetId?: string;
    targetType?: string;
    senderId?: string;
  }
) {
  // normalize ID just in case
  const normalizedUserId = ctx.db.normalizeId("users", userId);
  if(!normalizedUserId) return;

  await ctx.db.insert("notifications", {
    userId: normalizedUserId,
    type: type as any,
    title,
    content,
    targetId,
    targetType,
    senderId: senderId ? ctx.db.normalizeId("users", senderId) : undefined,
    isRead: false,
    createdAt: Date.now(),
  });
}

/**
 * INTERNAL HELPER: Notify entire team (except sender).
 */
export async function notifyTeam(
  ctx: any,
  teamId: string, // ID string
  notification: {
    type: string;
    title: string;
    content: string;
    targetId?: string;
    targetType?: string;
    senderId?: string;
  }
) {
  const normalizedTeamId = ctx.db.normalizeId("teams", teamId);
  if(!normalizedTeamId) return;

  const members = await ctx.db
    .query("teamMembers")
    .withIndex("by_team", (q: any) => q.eq("teamId", normalizedTeamId))
    .collect();

  // Filter out sender if provided
  const recipients = members.filter((m: any) => m.userId !== notification.senderId);

  await Promise.all(
    recipients.map((member: any) =>
      createNotification(ctx, {
        userId: member.userId,
        ...notification,
      })
    )
  );
}
