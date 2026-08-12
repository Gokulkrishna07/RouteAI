export const API_KEY_PRODUCT_PREFIX = "amr";

export const API_KEY_ENVIRONMENTS = ["live", "test"] as const;

export const API_KEY_SECRET_BYTES = 32;

export const API_KEY_DISPLAY_PREFIX_LENGTH = 16;

export const API_KEY_SCOPES = [
  "chat:write",
  "sessions:read",
  "sessions:write",
  "usage:read",
] as const;

export const DEFAULT_API_KEY_SCOPES = [...API_KEY_SCOPES];

export const DEFAULT_API_KEY_RATE_LIMIT = 60;
export const MAX_API_KEY_RATE_LIMIT = 100;

export const API_KEY_RATE_LIMIT_WINDOW_MS = 60 * 1000;

export const DEFAULT_ROTATION_GRACE_SECONDS = 24 * 60 * 60;
export const MAX_ROTATION_GRACE_SECONDS = 30 * 24 * 60 * 60;

export const API_KEY_LAST_USED_THROTTLE_MS = 60 * 1000;

export const API_KEY_HEADER = "x-api-key";
