import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "./users";

/**
 * Get tasks for the calendar view.
 * Returns tasks that have a due date within the specified range (or all if no range).
 * Also filters by team.
 */
export const getTasks = query({
  args: {
    teamId: v.id("teams"),
    start: v.optional(v.number()), // Epoch millis
    end: v.optional(v.number()),   // Epoch millis
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

    // 1. Get all projects for this team
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    
    const projectIds = new Set(projects.map(p => p._id));

    // 2. Fetch tasks. 
    // Ideally we'd have an index on `by_team_and_dueDate`, but tasks are linked to projects, not teams directly.
    // We can query by `by_due_date` and filter in memory for the team's projects.
    // Or query by `by_project` for each project.
    
    // Given the "Calendar Integration" requirement, querying by due date is most efficient if we have a global view.
    // But we need to restrict to the team.
    
    // Strategy: Use `by_due_date` index if range is provided, then filter by projectIds.
    
    let tasksQuery;
    
    if (args.start && args.end) {
        tasksQuery = ctx.db.query("tasks").withIndex("by_due_date", (q) => 
            q.gte("dueDate", args.start!).lte("dueDate", args.end!)
        );
    } else {
        // Fallback if no date range (though calendar usually has one)
        // We might just fetch recent tasks or all tasks with due dates
        tasksQuery = ctx.db.query("tasks").filter(q => q.neq(q.field("dueDate"), undefined));
    }

    const tasks = await tasksQuery.collect();

    // Filter for tasks belonging to the team's projects
    const teamTasks = tasks.filter(t => t.projectId && projectIds.has(t.projectId));

    return teamTasks;
  },
});
