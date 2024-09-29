import { z } from "zod";

export const LoginUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(2),
});

export const CreateUserSchema = LoginUserSchema.extend({
  confirmPassword: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password must match",
  path: ["confirmPassword"],
});

export type CreateUserSchema = z.infer<typeof CreateUserSchema>;
export type LoginUserSchema = z.infer<typeof LoginUserSchema>;

export const PostsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  external_link: z
    .string()
    .url("That url is not valid. Please try again")
    .optional()
    .or(z.literal("")),
  tags: z.string().optional(),
});

export type PostsSchema = z.infer<typeof PostsSchema>;
