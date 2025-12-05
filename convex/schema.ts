import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // ==================== USERS ====================
  users: defineTable({
    // Authentication & Identity (Convex Auth required fields)
    email: v.optional(v.string()), // Must be optional for Convex Auth
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Profile Information
    avatar: v.optional(v.string()), // URL to avatar image
    role: v.optional(v.string()), // User's role (e.g., "Designer", "Developer")
    bio: v.optional(v.string()),

    // Status & Preferences
    status: v.optional(v.union(
      v.literal("Online"),
      v.literal("Offline"),
      v.literal("Busy")
    )),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
    language: v.optional(v.string()),

    // Notification Preferences
    notifications: v.optional(
      v.object({
        email: v.boolean(),
        push: v.boolean(),
        desktop: v.boolean(),
      })
    ),

    // Timestamps
    createdAt: v.optional(v.number()), // milliseconds since epoch
    updatedAt: v.optional(v.number()),
    lastActiveAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // ==================== TEAMS ====================
  teams: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    avatar: v.optional(v.string()),

    // Settings
    privacy: v.union(v.literal("private"), v.literal("public")),
    settings: v.optional(
      v.object({
        allowInvites: v.boolean(),
        requireApproval: v.boolean(),
      })
    ),

    // Ownership - who created this team
    ownerId: v.id("users"),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_created_at", ["createdAt"]),

  // ==================== TEAM MEMBERS ====================
  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),

    // Timestamps
    joinedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_and_user", ["teamId", "userId"]),

  // ==================== INVITATIONS ====================
  invitations: defineTable({
    email: v.string(),
    teamId: v.id("teams"),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
    invitedBy: v.id("users"),
    fullName: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    
    // Timestamps
    createdAt: v.number(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    acceptedBy: v.optional(v.id("users")),
  })
    .index("by_team", ["teamId"])
    .index("by_email", ["email"])
    .index("by_email_and_team", ["email", "teamId"])
    .index("by_status", ["status"]),

  // ==================== FOLDERS ====================
  folders: defineTable({
    name: v.string(),
    teamId: v.id("teams"),

    // Styling
    color: v.optional(v.string()), // hex color
    icon: v.optional(v.string()), // icon name

    // Organization
    order: v.number(), // for sorting

    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_and_order", ["teamId", "order"]),

  // ==================== PROJECTS ====================
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),

    // Organization
    teamId: v.id("teams"),
    folderId: v.optional(v.id("folders")),

    // Styling
    color: v.optional(v.string()), // hex color
    icon: v.optional(v.string()), // icon name

    // Status & Dates
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("completed")
    ),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),

    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_folder", ["folderId"])
    .index("by_status", ["status"])
    .index("by_team_and_status", ["teamId", "status"]),

  // ==================== TASKS ====================
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),

    // Organization
    projectId: v.id("projects"),

    // Status & Priority
    status: v.union(
      v.literal("To Do"),
      v.literal("In Progress"),
      v.literal("Under Review"),
      v.literal("Completed")
    ),
    priority: v.union(
      v.literal("Low Priority"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("Urgent")
    ),

    // Progress & Dates
    progress: v.optional(v.number()), // 0-100
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),

    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),

    // Denormalized count for better query performance
    attachmentsCount: v.number(), // default: 0
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created_by", ["createdBy"])
    .index("by_due_date", ["dueDate"])
    .index("by_project_and_status", ["projectId", "status"]),

  // ==================== TASK ASSIGNEES ====================
  taskAssignees: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    assignedBy: v.id("users"),
    assignedAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_user", ["userId"])
    .index("by_task_and_user", ["taskId", "userId"]),

  // ==================== ATTACHMENTS ====================
  attachments: defineTable({
    taskId: v.id("tasks"),
    uploadedBy: v.id("users"),

    // File Information
    name: v.string(),
    size: v.number(), // in bytes
    type: v.string(), // MIME type
    storageId: v.id("_storage"), // Convex storage reference

    // Timestamps
    uploadedAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_uploaded_by", ["uploadedBy"]),

  // ==================== MESSAGES ====================
  messages: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),

    content: v.string(),

    // Optional: Thread/Channel support
    channelId: v.optional(v.string()),

    // Editing & Deletion
    isEdited: v.boolean(),
    editedAt: v.optional(v.number()),
    isDeleted: v.boolean(),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_and_created_at", ["teamId", "createdAt"])
    .index("by_channel", ["channelId"]),

  // ==================== NOTIFICATIONS ====================
  notifications: defineTable({
    userId: v.id("users"),

    // Notification Content
    type: v.union(
      v.literal("mention"),
      v.literal("invite"),
      v.literal("alert"),
      v.literal("like"),
      v.literal("message"),
      v.literal("task_assigned"),
      v.literal("task_completed"),
      v.literal("deadline")
    ),
    title: v.string(),
    content: v.string(),

    // Related Entity (generic)
    targetId: v.optional(v.string()), // ID of related entity
    targetType: v.optional(v.string()), // Type (e.g., "task", "project")

    // Sender (if applicable)
    senderId: v.optional(v.id("users")),

    // Status
    isRead: v.boolean(),
    readAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"])
    .index("by_user_and_created_at", ["userId", "createdAt"]),

  // ==================== ACTIVITY LOG ====================
  activityLog: defineTable({
    // Actor
    userId: v.id("users"),

    // Action
    action: v.string(), // e.g., "created", "updated", "deleted", "assigned"
    entityType: v.string(), // e.g., "task", "project", "comment"
    entityId: v.string(),

    // Details (flexible for different action types)
    details: v.optional(v.any()),

    // Context
    teamId: v.optional(v.id("teams")),
    projectId: v.optional(v.id("projects")),

    // Timestamp
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_team", ["teamId"])
    .index("by_created_at", ["createdAt"]),

  // ==================== CALENDAR EVENTS ====================
  calendarEvents: defineTable({
    title: v.string(),
    description: v.optional(v.string()),

    // Timing
    startTime: v.number(),
    endTime: v.number(),
    allDay: v.boolean(),

    // Organization
    teamId: v.id("teams"),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),

    // Meeting specific
    meetingUrl: v.optional(v.string()),
    location: v.optional(v.string()),

    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_project", ["projectId"])
    .index("by_start_time", ["startTime"])
    .index("by_team_and_start_time", ["teamId", "startTime"]),

  // ==================== EVENT ATTENDEES ====================
  eventAttendees: defineTable({
    eventId: v.id("calendarEvents"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("maybe")
    ),
    addedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_and_user", ["eventId", "userId"]),
});
