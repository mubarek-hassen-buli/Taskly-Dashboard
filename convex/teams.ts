import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./users";

/**
 * Create a new team.
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    privacy: v.union(v.literal("private"), v.literal("public")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const now = Date.now();

    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      privacy: args.privacy,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
      settings: {
        allowInvites: true,
        requireApproval: false,
      },
    });

    // Add creator as owner
    await ctx.db.insert("teamMembers", {
      teamId,
      userId,
      role: "owner",
      joinedAt: now,
    });

    return teamId;
  },
});

/**
 * List all members of a team.
 */
export const listMembers = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Check if user is a member of this team
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this team");
    }

    // Get all team members
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    return members;
  },
});

/**
 * Get all teams the current user is a member of.
 */
export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const teams = await Promise.all(
      memberships.map(async (m) => {
        const team = await ctx.db.get(m.teamId);
        return team ? { ...team, role: m.role } : null;
      })
    );

    return teams.filter((t) => t !== null);
  },
});

/**
 * Add a member to a team by email.
 * Only owners/admins can add members.
 */
export const addMember = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Unauthorized");

    // Check permissions
    const currentUserMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", currentUserId)
      )
      .unique();

    if (
      !currentUserMembership ||
      (currentUserMembership.role !== "owner" &&
        currentUserMembership.role !== "admin")
    ) {
      throw new Error("You do not have permission to add members");
    }

    // Find the user to add
    const userToAdd = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    if (!userToAdd) {
      throw new Error("User not found. They must sign up first.");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userToAdd._id)
      )
      .unique();

    if (existingMembership) {
      throw new Error("User is already a member of this team");
    }

    await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: userToAdd._id,
      role: args.role,
      joinedAt: Date.now(),
    });

    // Create notification for the added user
    await ctx.db.insert("notifications", {
      userId: userToAdd._id,
      type: "invite",
      title: "New Team Invitation",
      content: `You have been added to the team.`,
      targetId: args.teamId,
      targetType: "team",
      senderId: currentUserId,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * Get a single team by ID
 */
export const get = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.teamId);
  },
});

/**
 * Get user's membership in a team
 */
export const getMembership = query({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .unique();
  },
});

/**
 * Update a team member's role.
 * Only owners/admins can update roles.
 * Owners cannot be modified by others.
 */
export const updateMemberRole = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Unauthorized");

    // Check permissions of the requester
    const requesterMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", currentUserId)
      )
      .unique();

    if (
      !requesterMembership ||
      (requesterMembership.role !== "owner" && requesterMembership.role !== "admin")
    ) {
      throw new Error("You do not have permission to update roles");
    }

    // Get the target member
    const targetMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .unique();

    if (!targetMember) {
      throw new Error("Member not found");
    }

    // Protection rules:
    // 1. Cannot change role of the Owner (only Owner can transfer ownership - not implemented yet)
    if (targetMember.role === "owner") {
      throw new Error("Cannot change role of the Team Owner");
    }

    // 2. Admins cannot change other Admins or Owner
    if (requesterMembership.role === "admin" && (targetMember.role === "admin" || targetMember.role === "owner")) {
       throw new Error("Admins cannot modify other Admins or the Owner");
    }

    await ctx.db.patch(targetMember._id, { role: args.role });
  },
});

/**
 * Remove a member from the team.
 * Only owners/admins can remove members.
 */
export const removeMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Unauthorized");

    // Check permissions of the requester
    const requesterMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", currentUserId)
      )
      .unique();

    if (
      !requesterMembership ||
      (requesterMembership.role !== "owner" && requesterMembership.role !== "admin")
    ) {
      throw new Error("You do not have permission to remove members");
    }

    // Get the target member
    const targetMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .unique();

    if (!targetMember) {
      throw new Error("Member not found");
    }

    // Protection rules:
    // 1. Cannot remove the Owner
    if (targetMember.role === "owner") {
      throw new Error("Cannot remove the Team Owner");
    }

    // 2. Admins cannot remove other Admins or Owner
    if (requesterMembership.role === "admin" && targetMember.role === "admin") {
       throw new Error("Admins cannot remove other Admins");
    }
    
    // 3. User cannot remove themselves (leave team is separate)
    if (targetMember.userId === currentUserId) {
        throw new Error("You cannot remove yourself using this action");
    }

    await ctx.db.delete(targetMember._id);
  },
});
