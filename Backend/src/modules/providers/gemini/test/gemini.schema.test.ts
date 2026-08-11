import { describe, expect, it } from "vitest";
import { chatSchema } from "../gemini.schema";

describe("chatSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = chatSchema.safeParse({ prompt: "hello" });
    expect(result.success).toBe(true);
  });

  it("accepts a fully specified valid payload", () => {
    const result = chatSchema.safeParse({
      prompt: "hello",
      model: "gemini-flash-latest",
      temperature: 0.5,
      maxOutputTokens: 100,
      topP: 0.9,
      topK: 10,
      candidateCount: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty prompt", () => {
    const result = chatSchema.safeParse({ prompt: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing prompt", () => {
    const result = chatSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects temperature out of range", () => {
    expect(chatSchema.safeParse({ prompt: "hi", temperature: 1.5 }).success).toBe(
      false,
    );
    expect(chatSchema.safeParse({ prompt: "hi", temperature: -0.1 }).success).toBe(
      false,
    );
  });

  it("rejects maxOutputTokens less than 1", () => {
    const result = chatSchema.safeParse({ prompt: "hi", maxOutputTokens: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects topP out of range", () => {
    expect(chatSchema.safeParse({ prompt: "hi", topP: 1.1 }).success).toBe(false);
    expect(chatSchema.safeParse({ prompt: "hi", topP: -0.1 }).success).toBe(false);
  });

  it("rejects negative topK", () => {
    const result = chatSchema.safeParse({ prompt: "hi", topK: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects candidateCount less than 1", () => {
    const result = chatSchema.safeParse({ prompt: "hi", candidateCount: 0 });
    expect(result.success).toBe(false);
  });
});
