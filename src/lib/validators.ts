import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blueprintSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title too long"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug too long")
    .regex(SLUG_REGEX, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().max(500, "Description must be under 500 characters"),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(9999, "Price too high"),
  is_published: z.boolean(),
});

export const nodeSchema = z.object({
  id: z.string().uuid(),
  blueprint_id: z.string().uuid(),
  order_index: z.number().int().min(0),
  title: z.string().min(1, "Node title is required").max(150),
  content_markdown: z.string(),
  type: z.enum(["video", "task", "link"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  full_name: z.string().max(80, "Name too long"),
  bio: z.string().max(300, "Bio must be under 300 characters"),
  /* Allow empty string OR a valid URL */
  avatar_url: z
    .string()
    .refine((v) => v === "" || /^https?:\/\/.+/.test(v), "Must be a valid URL"),
});

export type BlueprintSchemaValues = z.infer<typeof blueprintSchema>;
export type NodeSchemaValues = z.infer<typeof nodeSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
