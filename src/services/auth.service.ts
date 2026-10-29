import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { api, publicApi } from "../infrastructure/api";
import { getDeviceId, getDeviceInfo } from "../infrastructure/device";
import { AUTH_KEYS } from "../infrastructure/session-storage";

import {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "../interfaces/auth.interface";

export const login = async (
  email: string,
  password: string,
): Promise<AuthUser> => {
  const deviceId = await getDeviceId();

  const payload: LoginRequest = {
    email: email.trim().toLowerCase(),
    password,
    deviceId,
    deviceInfo: getDeviceInfo(),
  };

  let data: LoginResponse;

  try {
    const response = await publicApi.post<LoginResponse>(
      "/auth/login-web",
      payload,
    );

    data = response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error("No fue posible conectar con el servidor.");
      }

      if (error.response.status === 400 || error.response.status === 401) {
        throw new Error(
          "No fue posible iniciar sesión. Verifique sus credenciales.",
        );
      }
    }

    throw new Error("Ocurrió un error al iniciar sesión.");
  }

  if (!data.user.roles.includes("client") || data.user.status !== "active") {
    await publicApi
      .post("/auth/logout-web", {
        refreshToken: data.refreshToken,
      })
      .catch(() => undefined);

    throw new Error(
      "Esta aplicación está disponible únicamente para clientes activos.",
    );
  }

  try {
    await SecureStore.setItemAsync(AUTH_KEYS.accessToken, data.accessToken);

    await SecureStore.setItemAsync(AUTH_KEYS.refreshToken, data.refreshToken);
  } catch {
    await Promise.allSettled([
      SecureStore.deleteItemAsync(AUTH_KEYS.accessToken),
      SecureStore.deleteItemAsync(AUTH_KEYS.refreshToken),
    ]);

    await api
      .post("/auth/logout-web", {
        refreshToken: data.refreshToken,
      })
      .catch(() => undefined);

    throw new Error("No fue posible guardar la sesión de forma segura.");
  }

  return data.user;
};

interface RefreshResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

interface CurrentUserResponse {
  ok: boolean;
  user: AuthUser;
}

export const clearStoredSession = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_KEYS.accessToken),
    SecureStore.deleteItemAsync(AUTH_KEYS.refreshToken),
  ]);
};

export const restoreSession = async (): Promise<AuthUser | null> => {
  const refreshToken = await SecureStore.getItemAsync(AUTH_KEYS.refreshToken);

  if (!refreshToken) {
    await clearStoredSession();
    return null;
  }

  try {
    const { data } = await publicApi.post<RefreshResponse>(
      "/auth/refresh-web",
      { refreshToken },
    );

    const user = data.user;

    if (
      !user ||
      !Array.isArray(user.roles) ||
      !user.roles.includes("client") ||
      user.status !== "active"
    ) {
      await publicApi
        .post("/auth/logout-web", {
          refreshToken: data.refreshToken,
        })
        .catch(() => undefined);

      await clearStoredSession();
      return null;
    }

    await SecureStore.setItemAsync(AUTH_KEYS.accessToken, data.accessToken);

    await SecureStore.setItemAsync(AUTH_KEYS.refreshToken, data.refreshToken);

    return user;
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      [400, 401, 403].includes(error.response?.status ?? 0)
    ) {
      await clearStoredSession();
      return null;
    }

    throw error;
  }
};

export const logoutSession = async (): Promise<boolean> => {
  const refreshToken = await SecureStore.getItemAsync(AUTH_KEYS.refreshToken);

  let revoked = true;

  try {
    if (refreshToken) {
      await publicApi.post("/auth/logout-web", {
        refreshToken,
      });
    }
  } catch {
    revoked = false;
  } finally {
    await clearStoredSession();
  }

  return revoked;
};
