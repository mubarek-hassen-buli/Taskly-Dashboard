import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Syncs the authenticated user to the `users` table.
 * Should be called after login/signup.
 */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called store without authentication present");
    }

    if (!identity.email) {
      throw new Error("User identity missing email");
    }

    // Check if we've already stored this user by email
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .unique();

    const now = Date.now();

    if (user !== null) {
      // Update existing user if needed
      // For password auth, we might not get new info on login, but we update timestamps
      if (user.name !== identity.name && identity.name) {
          await ctx.db.patch(user._id, {
            name: identity.name,
            updatedAt: now,
            lastActiveAt: now,
          });
      } else {
          await ctx.db.patch(user._id, {
            lastActiveAt: now,
          });
      }
      return user._id;
    }

    // Create new user
    // Note: For password auth, 'name' might need to be set via a separate profile update 
    // if not provided during signup flow (Convex Auth Password provider usually handles email/password).
    // We'll default name to the email prefix or "User" if not present.
    const name = identity.name || identity.email!.split("@")[0];

    const newUserId = await ctx.db.insert("users", {
      name: name,
      email: identity.email!,
      avatar: identity.pictureUrl || "",
      // Don't set role here - force user through profile setup
      status: "Online",
      theme: "light",
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
      notifications: {
        email: true,
        push: true,
        desktop: true,
      },
    });

    return newUserId;
  },
});

/**
 * Returns the current logged-in user's profile.
 */
/**
 * Returns the current logged-in user's profile.
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // The subject is in format: userId|sessionId
    // Extract just the userId part
    const userId = identity.subject.split("|")[0];
    
    // Query by _id instead of email
    const user = await ctx.db.get(userId as any);
    return user;
  },
});

/**
 * Helper to get the authenticated user's ID from the `users` table.
 * Returns null if not authenticated or user not found.
 */
export async function getAuthUserId(ctx: { auth: any; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  
  // The subject is in format: userId|sessionId
  // Extract just the userId part
  const userId = identity.subject.split("|")[0];
  
  // Verify the user exists
  const user = await ctx.db.get(userId as any);
  return user?._id ?? null;
}

/**
 * Update the current user's profile.
 * Used during onboarding (Photo, Role, Phone) and settings.
 */
export const update = mutation({
  args: {
    avatar: v.optional(v.string()),
    role: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    await ctx.db.patch(userId, {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

/**
 * List all users (for team member lookups).
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Return all users (you may want to add pagination later)
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

/**
 * Get a user by ID
 */
export const get = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get a user by email
 */
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
  },
});

/**
 * Get auth user ID as a query (for use in actions)
 */
export const getAuthUserIdQuery = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthUserId(ctx);
  },
});
