/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as calendar from "../calendar.js";
import type * as debug from "../debug.js";
import type * as debugTeams from "../debugTeams.js";
import type * as files from "../files.js";
import type * as folders from "../folders.js";
import type * as http from "../http.js";
import type * as invitationActions from "../invitationActions.js";
import type * as invitations from "../invitations.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as projects from "../projects.js";
import type * as tasks from "../tasks.js";
import type * as teams from "../teams.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  calendar: typeof calendar;
  debug: typeof debug;
  debugTeams: typeof debugTeams;
  files: typeof files;
  folders: typeof folders;
  http: typeof http;
  invitationActions: typeof invitationActions;
  invitations: typeof invitations;
  messages: typeof messages;
  notifications: typeof notifications;
  projects: typeof projects;
  tasks: typeof tasks;
  teams: typeof teams;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
