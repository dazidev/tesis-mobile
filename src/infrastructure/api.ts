import {
  type AxiosError,
  create,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";

import * as SecureStore from "expo-secure-store";
import type { AuthUser } from "../interfaces/auth.interface";
import { AUTH_KEYS } from "./session-storage";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("EXPO_PUBLIC_API_URL is not configured");
}

const config = {
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
};

export const publicApi = create(config);
export const api = create(config);

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse extends TokenPair {
  user: AuthUser;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _sessionVersion?: number;
}

export class SessionExpiredError extends Error {
  constructor() {
    super("La sesión ha expirado.");
    this.name = "SessionExpiredError";
  }
}

let refreshPromise: Promise<RefreshResponse> | null = null;
let onSessionExpired: (() => void) | null = null;

let sessionVersion = 0;
let signingOut = false;

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

export const beginSignOut = () => {
  signingOut = true;
};

export const endSignOut = () => {
  signingOut = false;
};

export const waitForPendingRefresh = async (): Promise<void> => {
  if (refreshPromise) {
    try {
      await refreshPromise;
    } catch {
      // El error ya fue gestionado por refreshSession.
    }
  }
};

const persistTokens = async (tokens: TokenPair) => {
  await SecureStore.setItemAsync(AUTH_KEYS.refreshToken, tokens.refreshToken);

  await SecureStore.setItemAsync(AUTH_KEYS.accessToken, tokens.accessToken);
};

export const saveLoginSession = async (tokens: TokenPair) => {
  sessionVersion++;
  await persistTokens(tokens);
};

export const clearStoredSession = async (notify = false): Promise<void> => {
  sessionVersion++;

  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_KEYS.accessToken),
    SecureStore.deleteItemAsync(AUTH_KEYS.refreshToken),
  ]);

  if (notify) {
    onSessionExpired?.();
  }
};

export const refreshSession = (): Promise<RefreshResponse> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  if (signingOut) {
    return Promise.reject(new SessionExpiredError());
  }

  refreshPromise = (async () => {
    const version = sessionVersion;

    const refreshToken = await SecureStore.getItemAsync(AUTH_KEYS.refreshToken);

    if (!refreshToken) {
      throw new SessionExpiredError();
    }

    let data: RefreshResponse;

    try {
      const response = await publicApi.post<RefreshResponse>(
        "/auth/refresh-web",
        { refreshToken },
      );

      data = response.data;
    } catch (error: unknown) {
      const invalidToken =
        isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0);

      if (invalidToken && version === sessionVersion) {
        const storedToken = await SecureStore.getItemAsync(
          AUTH_KEYS.refreshToken,
        );

        if (storedToken === refreshToken) {
          await clearStoredSession(true);
        }

        throw new SessionExpiredError();
      }

      throw error;
    }

    const storedToken = await SecureStore.getItemAsync(AUTH_KEYS.refreshToken);

    if (version !== sessionVersion || storedToken !== refreshToken) {
      throw new SessionExpiredError();
    }

    if (
      !data.user ||
      !Array.isArray(data.user.roles) ||
      !data.user.roles.includes("client") ||
      data.user.status !== "active"
    ) {
      await publicApi
        .post("/auth/logout-web", {
          refreshToken: data.refreshToken,
        })
        .catch(() => undefined);

      await clearStoredSession(true);
      throw new SessionExpiredError();
    }

    try {
      await persistTokens(data);
    } catch (error) {
      await clearStoredSession(true);
      throw error;
    }

    return data;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

api.interceptors.request.use(async (request) => {
  const config = request as RetryableRequest;

  if (config._sessionVersion === undefined) {
    config._sessionVersion = sessionVersion;
  }

  const accessToken = await SecureStore.getItemAsync(AUTH_KEYS.accessToken);

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

// Automatically renew and retry once
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      signingOut ||
      originalRequest._sessionVersion !== sessionVersion
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      let newAccessToken: string;

      if (refreshPromise) {
        const data = await refreshPromise;
        newAccessToken = data.accessToken;
      } else {
        const currentToken = await SecureStore.getItemAsync(
          AUTH_KEYS.accessToken,
        );

        const previousAuthorization =
          originalRequest.headers.get("Authorization");

        if (
          currentToken &&
          previousAuthorization &&
          previousAuthorization !== `Bearer ${currentToken}`
        ) {
          newAccessToken = currentToken;
        } else {
          const data = await refreshSession();
          newAccessToken = data.accessToken;
        }
      }

      if (signingOut || originalRequest._sessionVersion !== sessionVersion) {
        return Promise.reject(new SessionExpiredError());
      }

      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

      return api(originalRequest);
    } catch (refreshError: unknown) {
      return Promise.reject(refreshError);
    }
  },
);
