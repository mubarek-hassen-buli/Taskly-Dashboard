import { z } from "zod";

// Signup Step 1: Credentials
export const signupStep1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Signup Step 2: Profile
export const signupStep2Schema = z.object({
  role: z.string().min(1, "Please select a role"),
  avatar: z.string().optional(),
});

// Signup Step 3: Workspace
export const signupStep3Schema = z.object({
  workspace: z.string().min(2, "Workspace name must be at least 2 characters"),
  phone: z.string().optional(),
});

// Login
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Profile Update
export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

export type SignupStep1Input = z.infer<typeof signupStep1Schema>;
export type SignupStep2Input = z.infer<typeof signupStep2Schema>;
export type SignupStep3Input = z.infer<typeof signupStep3Schema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
