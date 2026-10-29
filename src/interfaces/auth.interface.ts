export type UserRole = "admin" | "lawyer" | "client";

export type UserStatus = "active" | "inactive" | "suspended";

export interface AuthUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId: string;
  deviceInfo: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  sessionId: string;
}
