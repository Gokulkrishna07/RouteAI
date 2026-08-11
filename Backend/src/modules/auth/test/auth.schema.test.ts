import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, refreshSchema } from "../auth.schema";

describe("registerSchema", () => {
  it("accepts a valid payload and lowercases the email", () => {
    const result = registerSchema.safeParse({
      name: "Jo",
      email: "User@Example.com",
      password: "secret1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(
      registerSchema.safeParse({ name: "J", email: "a@b.com", password: "secret1" })
        .success,
    ).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    expect(
      registerSchema.safeParse({
        name: "a".repeat(101),
        email: "a@b.com",
        password: "secret1",
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(
      registerSchema.safeParse({ name: "Jo", email: "not-an-email", password: "secret1" })
        .success,
    ).toBe(false);
  });

  it("rejects a password shorter than 6 characters", () => {
    expect(
      registerSchema.safeParse({ name: "Jo", email: "a@b.com", password: "abc" }).success,
    ).toBe(false);
  });

  it("rejects a password longer than 100 characters", () => {
    expect(
      registerSchema.safeParse({
        name: "Jo",
        email: "a@b.com",
        password: "a".repeat(101),
      }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid payload and lowercases the email", () => {
    const result = loginSchema.safeParse({ email: "User@Example.com", password: "secret1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects an invalid email", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "secret1" }).success).toBe(
      false,
    );
  });

  it("rejects a short password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "abc" }).success).toBe(
      false,
    );
  });
});

describe("refreshSchema", () => {
  it("accepts a token of at least 20 characters", () => {
    expect(refreshSchema.safeParse({ refreshToken: "a".repeat(20) }).success).toBe(true);
  });

  it("rejects a token shorter than 20 characters", () => {
    expect(refreshSchema.safeParse({ refreshToken: "short" }).success).toBe(false);
  });

  it("rejects a missing token", () => {
    expect(refreshSchema.safeParse({}).success).toBe(false);
  });
});
