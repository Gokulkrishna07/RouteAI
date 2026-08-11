export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshInput {
  refreshToken: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface JwtPayload {
  sub: string;
}

export interface myInfo {
  id: string;
  name: string;
  email: string;
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password: string;
  refresh_token?: string | null;
  refresh_token_expires_at?: string | null;
}
