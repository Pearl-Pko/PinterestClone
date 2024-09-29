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
