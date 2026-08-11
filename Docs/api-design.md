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

## Notes

- All auth routes are registered under `/api/v1`.
- The `Authorization` header must use the `Bearer` scheme.
- `refreshToken` is stored in the database and rotated on refresh.
- `GET /api/v1/me` requires a valid access token and returns the current user profile.
