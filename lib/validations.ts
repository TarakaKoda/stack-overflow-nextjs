import { z } from "zod";

export const QuestionSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Title must be at least 5 characters.",
    })
    .max(130, { message: "Title must cannot exceed 130 characters." }),
  explanation: z.string().min(100),
  tags: z.array(z.string().min(1).max(15)).min(1).max(3),
});

export const AnswerSchema = z.object({
  answer: z.string().min(100),
});

export const ProfileSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(5).max(50),
  bio: z.string().min(10).max(150).optional(),
  portfolio: z.string().url().optional(),
  location: z.string().min(5).max(50).optional(),
});
