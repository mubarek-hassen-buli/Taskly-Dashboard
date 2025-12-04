import { query } from "./_generated/server";
import { getAuthUserId } from "./users";

/**
 * Debug query to check current user's teams
 */
export const debugTeams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    console.log("Debug - userId:", userId);
    
    if (!userId) {
      return { error: "No user ID", userId: null, teams: [], memberships: [] };
    }

    // Get all team memberships
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    console.log("Debug - memberships:", memberships);

    // Get all teams
    const teams = await Promise.all(
      memberships.map(async (m) => {
        const team = await ctx.db.get(m.teamId);
        return team;
      })
    );

    console.log("Debug - teams:", teams);

    return {
      userId,
      memberships,
      teams: teams.filter(t => t !== null),
    };
  },
});
