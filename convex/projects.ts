import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./users";

/**
 * Create a new project.
 */
export const create = mutation({
  args: {
    teamId: v.id("teams"),
    folderId: v.optional(v.id("folders")),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
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

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      teamId: args.teamId,
      folderId: args.folderId,
      color: args.color,
      icon: args.icon,
      status: "active",
      startDate: args.startDate,
      dueDate: args.dueDate,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      userId,
      action: "created",
      entityType: "project",
      entityId: projectId,
      teamId: args.teamId,
      projectId: projectId,
      createdAt: Date.now(),
    });

    return projectId;
  },
});

/**
 * List projects for a team.
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
      .query("projects")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

/**
 * Update project status.
 */
export const updateStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Check team membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", project.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this team");
    }

    await ctx.db.patch(args.projectId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      userId,
      action: "updated_status",
      entityType: "project",
      entityId: args.projectId,
      details: { status: args.status },
      teamId: project.teamId,
      projectId: args.projectId,
      createdAt: Date.now(),
    });
  },
});
