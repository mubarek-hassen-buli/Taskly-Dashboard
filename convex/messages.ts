import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./users";
import { paginationOptsValidator } from "convex/server";

/**
 * Send a message to a team or channel.
 */
export const send = mutation({
  args: {
    teamId: v.id("teams"),
    content: v.string(),
    channelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Check team membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this team");
    }

    const messageId = await ctx.db.insert("messages", {
      teamId: args.teamId,
      userId,
      content: args.content,
      channelId: args.channelId,
      isEdited: false,
      isDeleted: false,
      createdAt: Date.now(),
    });

    // Notify mentioned users (basic implementation)
    // In a real app, you'd parse args.content for @mentions
    // For now, we'll skip complex parsing to keep it simple as per instructions

    return messageId;
  },
});

/**
 * List messages for a team (or channel).
 * Returns the most recent messages first.
 */
export const list = query({
  args: {
    teamId: v.id("teams"),
    channelId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check team membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) return [];

    const limit = args.limit ?? 50;

    let messagesQuery = ctx.db
      .query("messages")
      .withIndex("by_team_and_created_at", (q) => 
        q.eq("teamId", args.teamId)
      );

    // If channelId is provided, we might need a different index or filter
    // The schema has .index("by_channel", ["channelId"]), but that doesn't include teamId or sort by time efficiently
    // For now, we'll filter in memory if channelId is used, or rely on the team index if channelId is null
    // Ideally, schema should have .index("by_team_channel_created", ["teamId", "channelId", "createdAt"])
    
    // Since we strictly follow the provided schema, we'll use what we have.
    // If channelId is provided, we filter.
    
    const messages = await messagesQuery.order("desc").take(limit);

    const filteredMessages = args.channelId 
      ? messages.filter(m => m.channelId === args.channelId)
      : messages.filter(m => !m.channelId); // Default to "general" if no channel

    // Enrich with sender details
    const messagesWithSender = await Promise.all(
      filteredMessages.map(async (msg) => {
        const sender = await ctx.db.get(msg.userId);
        return {
          ...msg,
          sender,
        };
      })
    );

    return messagesWithSender.reverse(); // Return oldest first for chat UI
  },
});
