import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./users";

/**
 * Universal search across tasks, projects, and team members
 * Returns results categorized by type
 */
export const searchAll = query({
  args: {
    q: v.string(),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { tasks: [], projects: [], members: [] };

    // Verify team membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) return { tasks: [], projects: [], members: [] };

    const searchTerm = args.q.toLowerCase().trim();

    // If empty search, return empty results (or could return recent items)
    if (!searchTerm) {
      return { tasks: [], projects: [], members: [] };
    }

    // Search Tasks
    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const projectIds = allProjects.map((p) => p._id);

    const tasksPromises = projectIds.map((projectId) =>
      ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .collect()
    );

    const allTasksArrays = await Promise.all(tasksPromises);
    const allTasks = allTasksArrays.flat();

    const matchedTasks = allTasks
      .filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10); // Limit to 10 results

    // Enrich tasks with project info
    const tasksWithProjects = await Promise.all(
      matchedTasks.map(async (task) => {
        const project = await ctx.db.get(task.projectId);
        return { ...task, projectName: project?.name };
      })
    );

    // Search Projects
    const matchedProjects = allProjects
      .filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm) ||
          project.description?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10);

    // Search Team Members
    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const membersWithDetails = await Promise.all(
      teamMembers.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return user ? { ...user, role: member.role } : null;
      })
    );

    const matchedMembers = membersWithDetails
      .filter(
        (member) =>
          member &&
          (member.name?.toLowerCase().includes(searchTerm) ||
            member.email?.toLowerCase().includes(searchTerm) ||
            member.role?.toLowerCase().includes(searchTerm))
      )
      .filter((m) => m !== null)
      .slice(0, 10);

    return {
      tasks: tasksWithProjects,
      projects: matchedProjects,
      members: matchedMembers,
    };
  },
});

/**
 * Quick search for tasks only (optimized for speed)
 */
export const searchTasks = query({
  args: {
    q: v.string(),
    projectId: v.optional(v.id("projects")),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) return [];

    const searchTerm = args.q.toLowerCase().trim();
    if (!searchTerm) return [];

    let tasks;
    if (args.projectId) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
    } else {
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
        .collect();

      const tasksPromises = projects.map((p) =>
        ctx.db
          .query("tasks")
          .withIndex("by_project", (q) => q.eq("projectId", p._id))
          .collect()
      );

      const tasksArrays = await Promise.all(tasksPromises);
      tasks = tasksArrays.flat();
    }

    return tasks
      .filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 20);
  },
});
