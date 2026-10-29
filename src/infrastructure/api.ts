import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import * as SecureStore from "expo-secure-store";

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

export const publicApi = axios.create(config);
export const api = axios.create(config);

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

let onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

const clearSession = async () => {
  await Promise.allSettled([
    SecureStore.deleteItemAsync(AUTH_KEYS.accessToken),
    SecureStore.deleteItemAsync(AUTH_KEYS.refreshToken),
  ]);

  onSessionExpired?.();
};

const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const { data } = await publicApi.post<RefreshResponse>("/auth/refresh-web", {
    refreshToken,
  });

  const storedRefreshToken = await SecureStore.getItemAsync(
    AUTH_KEYS.refreshToken,
  );

  if (storedRefreshToken !== refreshToken) {
    throw new Error("La sesión cambió durante la renovación.");
  }

  await SecureStore.setItemAsync(AUTH_KEYS.accessToken, data.accessToken);

  await SecureStore.setItemAsync(AUTH_KEYS.refreshToken, data.refreshToken);

  return data.accessToken;
};

api.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync(AUTH_KEYS.accessToken);

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const currentAccessToken = await SecureStore.getItemAsync(
      AUTH_KEYS.accessToken,
    );

    const sentAuthorization = originalRequest.headers.get("Authorization");

    if (
      currentAccessToken &&
      sentAuthorization !== `Bearer ${currentAccessToken}`
    ) {
      originalRequest.headers.set(
        "Authorization",
        `Bearer ${currentAccessToken}`,
      );

      return api(originalRequest);
    }

    const refreshToken = await SecureStore.getItemAsync(AUTH_KEYS.refreshToken);

    if (!refreshToken) {
      await clearSession();
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken(refreshToken).finally(() => {
        refreshPromise = null;
      });
    }

    let newAccessToken: string;

    try {
      newAccessToken = await refreshPromise;
    } catch (refreshError: unknown) {
      if (
        axios.isAxiosError(refreshError) &&
        [400, 401, 403].includes(refreshError.response?.status ?? 0)
      ) {
        const storedToken = await SecureStore.getItemAsync(
          AUTH_KEYS.refreshToken,
        );

        if (storedToken === refreshToken) {
          await clearSession();
        }
      }

      return Promise.reject(refreshError);
    }

    originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

    return api(originalRequest);
  },
);
