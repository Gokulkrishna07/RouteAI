import { z } from "zod";

export const chatSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  maxOutputTokens: z.number().min(1).optional(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().min(0).optional(),
  candidateCount: z.number().min(1).optional(),
});

export type ChatSchema = z.infer<typeof chatSchema>;
