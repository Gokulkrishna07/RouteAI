API Contract

## Health

### GET `/api/v1/health`

Purpose: Liveness check for the API.

Authentication: None
Body: None

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "Server is healthy"
}
```

---

## Authentication

### POST `/api/v1/register`

Purpose: Register a new user.

Authentication: None

Request

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "********"
}
```

Response — `201 Created`

```json
{
  "status": "ok",
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com"
  },
  "token": "jwt-access-token",
  "refreshToken": "refresh-token",
  "refreshTokenExpiresAt": "2026-08-16T12:34:56.789Z"
}
```

---

### POST `/api/v1/login`

Purpose: Authenticate a user and issue JWT tokens.

Authentication: None

Request

```json
{
  "email": "user@example.com",
  "password": "********"
}
```

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "Logged in successfully",
  "data": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com"
  },
  "token": "jwt-access-token",
  "refreshToken": "refresh-token",
  "refreshTokenExpiresAt": "2026-08-16T12:34:56.789Z"
}
```

---

### POST `/api/v1/refresh`

Purpose: Issue a new access token using a valid refresh token.

Authentication: None

Request

```json
{
  "refreshToken": "refresh-token"
}
```

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "Token refreshed successfully",
  "token": "jwt-access-token",
  "refreshToken": "new-refresh-token",
  "refreshTokenExpiresAt": "2026-08-16T12:34:56.789Z"
}
```

---

### POST `/api/v1/logout`

Purpose: Invalidate the user's refresh token.

Authentication: Bearer JWT required.

Headers

```http
Authorization: Bearer <accessToken>
```

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "Logged out successfully",
  "success": true
}
```

---

### GET `/api/v1/me`

Purpose: Retrieve the authenticated user's profile.

Authentication: Bearer JWT required.

Headers

```http
Authorization: Bearer <accessToken>
```

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "User profile retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

---

## Chat

### POST `/api/v1/chat`

Purpose: Generate a completion. The gateway scores prompt complexity and picks the provider and model automatically.

Authentication: Bearer JWT, or API key with the `chat:write` scope.

Headers

```http
Authorization: Bearer <accessToken>
```

Request — only `prompt` is required

```json
{
  "prompt": "Explain database indexing.",
  "model": "gemini-flash-latest",
  "temperature": 0.7,
  "maxOutputTokens": 1024,
  "topP": 0.9,
  "topK": 40,
  "candidateCount": 1,
  "sessionId": "uuid",
  "store": true
}
```

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "Chat generated successfully",
  "data": {
    "provider": "gemini",
    "model": "gemini-flash-latest",
    "response": "Generated text...",
    "raw": {},
    "usage": {
      "promptTokens": 12,
      "outputTokens": 240,
      "totalTokens": 252
    },
    "finishReason": "STOP",
    "latencyMs": 842,
    "sessionId": "uuid"
  }
}
```

---

## Sessions

### GET `/api/v1/sessions`

Purpose: List the caller's sessions, most recently updated first.

Authentication: Bearer JWT, or API key with the `sessions:read` scope.

Body: None

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "Sessions retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Explain database indexing",
      "created_at": "2026-08-12T10:00:00.000Z",
      "updated_at": "2026-08-12T10:05:00.000Z"
    }
  ]
}
```

---

### GET `/api/v1/sessions/:id/messages`

Purpose: List messages in a session, oldest first.

Authentication: Bearer JWT, or API key with the `sessions:read` scope.

Body: None

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Explain database indexing.",
      "provider": null,
      "model": null,
      "created_at": "2026-08-12T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "An index is...",
      "provider": "gemini",
      "model": "gemini-flash-latest",
      "created_at": "2026-08-12T10:00:02.000Z"
    }
  ]
}
```

---

### PATCH `/api/v1/sessions/:id`

Purpose: Rename a session.

Authentication: Bearer JWT, or API key with the `sessions:write` scope.

Request

```json
{
  "title": "Indexing deep dive"
}
```

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "Session renamed successfully"
}
```

---

### DELETE `/api/v1/sessions/:id`

Purpose: Delete a session and its messages.

Authentication: Bearer JWT, or API key with the `sessions:write` scope.

Body: None

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "Session deleted successfully"
}
```

---

## Usage

### GET `/api/v1/usage/me`

Purpose: Aggregate token usage across all of the caller's chat requests.

Authentication: Bearer JWT, or API key with the `usage:read` scope.

Body: None

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "Usage summary retrieved successfully",
  "data": {
    "totalRequests": 42,
    "totalPromptTokens": 1024,
    "totalOutputTokens": 8192,
    "totalTokens": 9216
  }
}
```

---

## API Keys

### POST `/api/v1/api-keys`

Purpose: Create a new API key. The raw `key` is returned only once.

Authentication: Bearer JWT required. API keys cannot manage API keys.

Request — only `name` is required

```json
{
  "name": "Production server",
  "scopes": ["chat:write", "usage:read"],
  "rateLimit": 60,
  "expiresInDays": 90,
  "environment": "live"
}
```

Response — `201 Created`

```json
{
  "status": "ok",
  "message": "API key created successfully. Copy it now, it will not be shown again.",
  "data": {
    "id": "uuid",
    "name": "Production server",
    "key": "amr_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "keyPrefix": "amr_live_9dK2xY",
    "lastFour": "a1b2",
    "scopes": ["chat:write", "usage:read"],
    "rateLimit": 60,
    "lastUsedAt": null,
    "expiresAt": "2026-11-10T12:34:56.789Z",
    "revokedAt": null,
    "createdAt": "2026-08-12T12:34:56.789Z"
  }
}
```

---

### GET `/api/v1/api-keys`

Purpose: List the caller's API keys.

Authentication: Bearer JWT required.

Body: None

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "API keys retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Production server",
      "keyPrefix": "amr_live_9dK2xY",
      "lastFour": "a1b2",
      "scopes": ["chat:write", "usage:read"],
      "rateLimit": 60,
      "lastUsedAt": "2026-08-12T13:00:00.000Z",
      "expiresAt": null,
      "revokedAt": null,
      "createdAt": "2026-08-12T12:34:56.789Z"
    }
  ]
}
```

---

### GET `/api/v1/api-keys/:id`

Purpose: Retrieve a single API key.

Authentication: Bearer JWT required.

Body: None

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "API key retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Production server",
    "keyPrefix": "amr_live_9dK2xY",
    "lastFour": "a1b2",
    "scopes": ["chat:write", "usage:read"],
    "rateLimit": 60,
    "lastUsedAt": "2026-08-12T13:00:00.000Z",
    "expiresAt": null,
    "revokedAt": null,
    "createdAt": "2026-08-12T12:34:56.789Z"
  }
}
```

---

### PATCH `/api/v1/api-keys/:id`

Purpose: Update a key's name, scopes, or rate limit. At least one field is required.

Authentication: Bearer JWT required.

Request

```json
{
  "name": "Renamed key",
  "scopes": ["chat:write"],
  "rateLimit": 100
}
```

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "API key updated successfully",
  "data": {
    "id": "uuid",
    "name": "Renamed key",
    "keyPrefix": "amr_live_9dK2xY",
    "lastFour": "a1b2",
    "scopes": ["chat:write"],
    "rateLimit": 100,
    "lastUsedAt": null,
    "expiresAt": null,
    "revokedAt": null,
    "createdAt": "2026-08-12T12:34:56.789Z"
  }
}
```

---

### DELETE `/api/v1/api-keys/:id`

Purpose: Revoke a key immediately.

Authentication: Bearer JWT required.

Body: None

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "API key revoked successfully"
}
```

---

### POST `/api/v1/api-keys/:id/rotate`

Purpose: Issue a replacement key inheriting the original's name, scopes, rate limit, and expiry. The old key's expiry is set to now plus `graceSeconds`.

Authentication: Bearer JWT required.

Request — optional, the body may be omitted

```json
{
  "graceSeconds": 3600
}
```

Response — `201 Created`

```json
{
  "status": "ok",
  "message": "API key rotated successfully. Copy the new key now, it will not be shown again.",
  "data": {
    "id": "new-uuid",
    "name": "Production server",
    "key": "amr_live_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
    "keyPrefix": "amr_live_7pQ4mZ",
    "lastFour": "c3d4",
    "scopes": ["chat:write", "usage:read"],
    "rateLimit": 60,
    "lastUsedAt": null,
    "expiresAt": null,
    "revokedAt": null,
    "createdAt": "2026-08-12T14:00:00.000Z"
  }
}
```

---

### GET `/api/v1/api-keys/:id/usage`

Purpose: Token usage attributed to a single API key.

Authentication: Bearer JWT required.

Body: None

Response — `200 OK`

```json
{
  "status": "ok",
  "message": "API key usage retrieved successfully",
  "data": {
    "totalRequests": 12,
    "totalPromptTokens": 300,
    "totalOutputTokens": 2400,
    "totalTokens": 2700
  }
}
```

---

## Notes

- All routes are registered under `/api/v1`.
- The `Authorization` header must use the `Bearer` scheme.
- API keys are sent as `x-api-key: amr_...`, or as `Authorization: Bearer amr_...`.
- Available API key scopes: `chat:write`, `sessions:read`, `sessions:write`, `usage:read`.
- `refreshToken` is stored in the database and rotated on refresh.
- Rate limits per minute: 10 on `/login`, `/register`, `/refresh`; 20 for other requests without an API key; 100 with an API key.
- Errors return `{ "error": { "code", "message", "requestId" } }`.
