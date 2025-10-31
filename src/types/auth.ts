import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    referralCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          path: ["password"],
          message: "Password must be at least 6 characters",
          code: "custom",
        });
      }

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          message: "Passwords don't match",
          code: "custom",
        });
      }
  });

export const signInSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().optional(),
    code: z.string().optional()
  })
  .superRefine((data, ctx) => {
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          path: ["password"],
          message: "Password must be at least 6 characters",
          code: "custom",
        });
      
    }
      if (data.code && data.code.trim().length !== 4) {
        ctx.addIssue({
          path: ["code"],
          message: "Enter the 6-digit code sent to your email",
          code: "custom",
        });
      }
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export type LoginFormData = z.infer<typeof signInSchema>;

export type AuthMethod = "password" | "link" | "code";