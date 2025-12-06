"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Send team invitation email using EmailJS
 * This action runs in Node.js environment to use EmailJS library
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
    
    // Create invitation token using mutation
    const invitationId = await ctx.runMutation(api.invitations.create, {
      email: args.email,
      teamId: args.teamId,
      role: args.role,
      invitedBy: userId,
      fullName: args.fullName,
    });

    // Generate invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invitationId}`;

    // Send email using EmailJS REST API
    try {
      const serviceId = process.env.EMAILJS_SERVICE_ID;
      const templateId = process.env.EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.EMAILJS_PUBLIC_KEY;
      const privateKey = process.env.EMAILJS_PRIVATE_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS configuration is incomplete. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY in Convex dashboard.');
      }

      console.log('Sending invitation email to:', args.email);
      console.log('Team:', team.name);
      console.log('Role:', args.role);

      // Prepare template parameters
      const templateParams = {
        to_email: args.email,
        to_name: args.fullName || args.email.split('@')[0],
        inviter_name: inviter.name,
        inviter_email: inviter.email,
        team_name: team.name,
        invite_link: inviteLink,
        role: args.role.charAt(0).toUpperCase() + args.role.slice(1),
        role_description: getRoleDescription(args.role),
      };

      console.log('Template params:', JSON.stringify(templateParams, null, 2));

      // Use EmailJS REST API directly
      const emailData = {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: templateParams,
      };

      console.log('Sending to EmailJS API...');

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('EmailJS API error:', errorText);
        throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
      }

      const result = await response.text();
      console.log('Email sent successfully:', result);

      return { 
        success: true, 
        invitationId, 
        emailStatus: response.status,
        emailText: result 
      };
    } catch (error: any) {
      console.error('Failed to send invitation email:', error);
      console.error('Error details:', error.message);
      throw new Error(`Failed to send invitation: ${error.message || 'Unknown error'}`);
    }
  },
});

/**
 * Get role description for email template
 */
function getRoleDescription(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'You will have full control over the workspace, including creating, updating, and deleting tasks, inviting members, and managing roles.';
    case 'member':
      return 'You can create tasks, update or delete tasks assigned to you, and participate in team conversations.';
    case 'viewer':
      return 'You can view all tasks but cannot create, update, or delete any tasks.';
    default:
      return 'You have been invited to join the team.';
  }
}
