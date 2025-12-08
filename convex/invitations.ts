import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "./users";
import { notifyTeam } from "./notifications";

/**
 * Create invitation record
 */
export const create = mutation({
  args: {
    email: v.string(),
    teamId: v.id("teams"),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
    invitedBy: v.id("users"),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if invitation already exists and is still valid
    const existing = await ctx.db
      .query("invitations")
      .withIndex("by_email_and_team", (q) =>
        q.eq("email", args.email).eq("teamId", args.teamId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existing) {
      // Update existing invitation
      await ctx.db.patch(existing._id, {
        role: args.role,
        invitedBy: args.invitedBy,
        fullName: args.fullName,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      return existing._id;
    }

    // Create new invitation
    const invitationId = await ctx.db.insert("invitations", {
      email: args.email,
      teamId: args.teamId,
      role: args.role,
      invitedBy: args.invitedBy,
      fullName: args.fullName,
      status: "pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return invitationId;
  },
});

/**
 * Get invitation by ID
 */
export const get = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    // Check if expired
    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(args.invitationId, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    return invitation;
  },
});

/**
 * Accept invitation
 */
export const accept = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    // Check if user is already a member (might have already accepted)
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", invitation.teamId).eq("userId", userId)
      )
      .unique();

    if (existingMembership) {
      // User is already a member, just return success
      return { success: true, teamId: invitation.teamId, alreadyMember: true };
    }

    // Check invitation status
    if (invitation.status === "accepted") {
      throw new Error("This invitation has already been accepted by someone else");
    }

    if (invitation.status === "expired") {
      throw new Error("This invitation has expired");
    }

    if (invitation.status === "cancelled") {
      throw new Error("This invitation has been cancelled");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(args.invitationId, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    // Add user to team
    await ctx.db.insert("teamMembers", {
      teamId: invitation.teamId,
      userId,
      role: invitation.role,
      joinedAt: Date.now(),
    });

    // Mark invitation as accepted
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
      acceptedBy: userId,
      acceptedAt: Date.now(),
    });

    // Notify the team about the new member
    const user = await ctx.db.get(userId as Id<"users">);
    const userName = (user && user.name) || (user && user.email) || "A new member";
    
    await notifyTeam(ctx, invitation.teamId, {
      type: "member_added",
      title: "New Team Member",
      content: `${userName} joined the team.`,
      targetId: invitation.teamId,
      targetType: "team",
      senderId: userId,
    });

    return { success: true, teamId: invitation.teamId, alreadyMember: false };
  },
});

/**
 * List pending invitations for a team
 */
export const listByTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Verify user is admin or owner
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      throw new Error("Only admins and owners can view invitations");
    }

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return invitations;
  },
});
