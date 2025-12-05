import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { getAuthUserId } from "./users";
import { api } from "./_generated/api";

/**
 * Send team invitation email
 */
export const sendInvitation = action({
  args: {
    email: v.string(),
    teamId: v.id("teams"),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.runQuery(api.users.getAuthUserIdQuery);
    if (!userId) throw new Error("Unauthorized");

    // Get team details
    const team = await ctx.runQuery(api.teams.get, { teamId: args.teamId });
    if (!team) throw new Error("Team not found");

    // Get inviter details
    const inviter = await ctx.runQuery(api.users.get, { userId });
    if (!inviter) throw new Error("Inviter not found");

    // Check if inviter has permission (must be admin or owner)
    const membership = await ctx.runQuery(api.teams.getMembership, {
      teamId: args.teamId,
      userId,
    });

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      throw new Error("Only admins and owners can invite members");
    }

    // Check if user already exists
    const existingUser = await ctx.runQuery(api.users.getByEmail, { email: args.email });
    
    // Create invitation token
    const invitationId = await ctx.runMutation(api.invitations.create, {
      email: args.email,
      teamId: args.teamId,
      role: args.role,
      invitedBy: userId,
      fullName: args.fullName,
    });

    // Generate invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invitationId}`;

    // Send email using Resend
    try {
      const { Resend } = await import('resend');
      const { render } = await import('@react-email/render');
      const { TeamInviteEmail } = await import('../emails/team-invite');
      
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailHtml = await render(TeamInviteEmail({
        inviterName: inviter.name,
        inviterEmail: inviter.email,
        teamName: team.name,
        inviteLink,
        role: args.role.charAt(0).toUpperCase() + args.role.slice(1),
      }));

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Taskly <onboarding@resend.dev>',
        to: args.email,
        subject: `You're invited to join ${team.name} on Taskly`,
        html: emailHtml,
      });

      return { success: true, invitationId };
    } catch (error: any) {
      console.error('Failed to send invitation email:', error);
      throw new Error(`Failed to send invitation: ${error.message}`);
    }
  },
});

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

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(args.invitationId, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", invitation.teamId).eq("userId", userId)
      )
      .unique();

    if (existingMembership) {
      throw new Error("You are already a member of this team");
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

    return { success: true, teamId: invitation.teamId };
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
