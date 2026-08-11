import { describe, expect, it } from "vitest";
import { scoreComplexity } from "../complexity.heuristic";

describe("scoreComplexity", () => {
  it("returns a low score for a short plain prompt", () => {
    const score = scoreComplexity("Hi there");
    expect(score).toBeLessThan(30);
  });

  it("increases the score for longer prompts, capped at 40 from word count", () => {
    const shortScore = scoreComplexity("one two three four");
    const longScore = scoreComplexity(Array.from({ length: 200 }, () => "word").join(" "));

    expect(longScore).toBeGreaterThan(shortScore);
    expect(longScore).toBeLessThanOrEqual(100);
  });

  it("adds points for each complexity keyword found", () => {
    const base = scoreComplexity("tell me something");
    const withKeyword = scoreComplexity("please compare something");

    expect(withKeyword).toBeGreaterThanOrEqual(base + 15);
  });

  it("adds points when the prompt contains a code fence", () => {
    const withoutCode = scoreComplexity("short text here");
    const withCode = scoreComplexity("short text here ```const x = 1;```");

    expect(withCode).toBeGreaterThanOrEqual(withoutCode + 20);
  });

  it("adds points when the prompt mentions function or class", () => {
    const withoutCode = scoreComplexity("short text here");
    const withCode = scoreComplexity("write a function that adds numbers");

    expect(withCode).toBeGreaterThanOrEqual(withoutCode + 20);
  });

  it("adds points for multiple question marks but not for a single one", () => {
    const single = scoreComplexity("What is this?");
    const multiple = scoreComplexity("What is this? Why? How?");

    expect(multiple).toBeGreaterThan(single);
  });

  it("caps the total score at 100", () => {
    const massivePrompt = `${Array.from({ length: 300 }, () => "word").join(" ")} explain in detail step by step compare analyze design architecture prove derive optimize debug refactor write a program algorithm \`\`\`function class\`\`\` ? ? ? ? ?`;

    expect(scoreComplexity(massivePrompt)).toBe(100);
  });
});
