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
    const name = identity.name || identity.email!.split("@")[0];

    const newUserId = await ctx.db.insert("users", {
      name: name,
      email: identity.email!,
      avatar: identity.pictureUrl || "",
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
      // Optional fields defaulting to undefined implicitly
    });

    return newUserId;
  },
});

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
    const userId = identity.subject.split("|")[0];
    const normalizedId = ctx.db.normalizeId("users", userId);
    if (!normalizedId) return null;
    
    // Query by _id instead of email
    const user = await ctx.db.get(normalizedId);
    
    if (!user) return null;

    // Generate signed URL if avatarStorageId exists
    if (user.avatarStorageId) {
        const url = await ctx.storage.getUrl(user.avatarStorageId);
        if (url) {
            return { ...user, avatar: url };
        }
    }

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
  const userId = identity.subject.split("|")[0];
  const normalizedId = ctx.db.normalizeId("users", userId);
  if (!normalizedId) return null;
  
  // Verify the user exists
  const user = await ctx.db.get(normalizedId);
  return user?._id ?? null;
}

/**
 * Update the current user's profile.
 * Used during onboarding (Photo, Role, Phone) and settings.
 */
export const update = mutation({
  args: {
    avatar: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
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

    const users = await ctx.db.query("users").collect();
    
    // Map users to include signed URLs
    const usersWithUrls = await Promise.all(users.map(async (u) => {
        if (u.avatarStorageId) {
            const url = await ctx.storage.getUrl(u.avatarStorageId);
            if (url) {
                return { ...u, avatar: url };
            }
        }
        return u;
    }));
    
    return usersWithUrls;
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
