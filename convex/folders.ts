import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./users";

/**
 * Create a new folder in a team.
 */
export const create = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
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

    // Get highest order to append
    const existingFolders = await ctx.db
      .query("folders")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    
    const order = existingFolders.length > 0 
      ? Math.max(...existingFolders.map(f => f.order)) + 1 
      : 0;

    const folderId = await ctx.db.insert("folders", {
      name: args.name,
      teamId: args.teamId,
      color: args.color,
      icon: args.icon,
      order,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return folderId;
  },
});

/**
 * List folders for a team.
 */
export const list = query({
  args: {
    teamId: v.id("teams"),
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

    return await ctx.db
      .query("folders")
      .withIndex("by_team_and_order", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});
