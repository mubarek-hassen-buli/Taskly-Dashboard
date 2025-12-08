import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./users";
import { notifyTeam } from "./notifications";

/**
 * Create a new task.
 */
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(
      v.literal("Low Priority"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("Urgent")
    ),
    status: v.union(
      v.literal("To Do"),
      v.literal("In Progress"),
      v.literal("Under Review"),
      v.literal("Completed")
    ),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    assigneeIds: v.array(v.id("users")),
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

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      projectId: args.projectId,
      status: args.status,
      priority: args.priority,
      startDate: args.startDate,
      dueDate: args.dueDate,
      progress: 0,
      attachmentsCount: 0,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Handle assignees
    if (args.assigneeIds.length > 0) {
      await Promise.all(
        args.assigneeIds.map(async (assigneeId) => {
          await ctx.db.insert("taskAssignees", {
            taskId,
            userId: assigneeId,
            assignedBy: userId,
            assignedAt: Date.now(),
          });

          // Notify assignee
          if (assigneeId !== userId) {
            await ctx.db.insert("notifications", {
              userId: assigneeId,
              type: "task_assigned",
              title: "New Task Assignment",
              content: `You have been assigned to task: ${args.title}`,
              targetId: taskId,
              targetType: "task",
              senderId: userId,
              isRead: false,
              createdAt: Date.now(),
            });
          }
        })
      );
    }

    // Log activity
    await ctx.db.insert("activityLog", {
      userId,
      action: "created",
      entityType: "task",
      entityId: taskId,
      teamId: project.teamId,
      projectId: args.projectId,
      createdAt: Date.now(),
    });

    // Notify Team
    await notifyTeam(ctx, project.teamId, {
      type: "task_created",
      title: "New Task Created",
      content: `New task in ${project.name}: ${args.title}`,
      targetId: taskId,
      targetType: "task",
      senderId: userId,
    });

    return taskId;
  },
});

/**
 * List tasks for a project with assignee details.
 */
export const list = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    // Check team membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", project.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Enrich tasks with assignees
    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        const assigneeRecords = await ctx.db
          .query("taskAssignees")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect();

        const assignees = await Promise.all(
          assigneeRecords.map(async (r) => {
            const user = await ctx.db.get(r.userId);
            return user;
          })
        );

        return {
          ...task,
          assignees: assignees.filter((u) => u !== null),
        };
      })
    );

    return tasksWithAssignees;
  },
});

/**
 * List all tasks for a team (across all projects).
 */
export const listByTeam = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify team membership
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

    const projectIds = projects.map(p => p._id);

    if (projectIds.length === 0) return [];

    // 2. Get tasks for these projects
    const tasks = await Promise.all(
        projectIds.map((projectId) => 
            ctx.db
                .query("tasks")
                .withIndex("by_project", q => q.eq("projectId", projectId))
                .collect()
        )
    );

    const allTasks = tasks.flat();

    // 3. Enrich with assignees
    const tasksWithAssignees = await Promise.all(
      allTasks.map(async (task) => {
        const assigneeRecords = await ctx.db
          .query("taskAssignees")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect();

        const assignees = await Promise.all(
          assigneeRecords.map(async (r) => {
            const user = await ctx.db.get(r.userId);
            return user;
          })
        );

        return {
          ...task,
          assignees: assignees.filter((u) => u !== null),
        };
      })
    );

    return tasksWithAssignees;
  },
});

/**
 * Update task status.
 */
export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("To Do"),
      v.literal("In Progress"),
      v.literal("Under Review"),
      v.literal("Completed")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const project = await ctx.db.get(task.projectId);
    if (!project) throw new Error("Project not found");

    // Check team membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", project.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) throw new Error("Unauthorized");

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "Completed") {
      updates.completedAt = Date.now();
      updates.progress = 100;
    }

    await ctx.db.patch(args.taskId, updates);

    // Log activity
    await ctx.db.insert("activityLog", {
      userId,
      action: "updated_status",
      entityType: "task",
      entityId: args.taskId,
      details: { from: task.status, to: args.status },
      teamId: project.teamId,
      projectId: task.projectId,
      createdAt: Date.now(),
    });

    // Notify Team
    await notifyTeam(ctx, project.teamId, {
      type: "task_status_change",
      title: "Task Status Updated",
      content: `Task "${task.title}" is now ${args.status}`,
      targetId: args.taskId,
      targetType: "task",
      senderId: userId,
    });
  },
});

/**
 * Update a task.
 */
export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("To Do"),
        v.literal("In Progress"),
        v.literal("Under Review"),
        v.literal("Completed")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("Low Priority"),
        v.literal("Medium"),
        v.literal("High"),
        v.literal("Urgent")
      )
    ),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
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

    // Update task
    await ctx.db.patch(args.taskId, {
      ...(args.title && { title: args.title }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.status && { status: args.status }),
      ...(args.priority && { priority: args.priority }),
      ...(args.dueDate !== undefined && { dueDate: args.dueDate }),
      updatedAt: Date.now(),
    });

    return args.taskId;
  },
});

/**
 * Delete a task.
 */
export const remove = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
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

    // Delete task assignees
    const assignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    await Promise.all(assignees.map((a) => ctx.db.delete(a._id)));

    // Delete task
    await ctx.db.delete(args.taskId);

    // Notify Team
    await notifyTeam(ctx, project.teamId, {
      type: "task_deleted",
      title: "Task Deleted",
      content: `Task "${task.title}" was deleted.`,
      targetId: args.taskId,
      targetType: "task",
      senderId: userId,
    });
  },
});


