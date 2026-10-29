import { isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

import {
  beginSignOut,
  clearStoredSession,
  endSignOut,
  publicApi,
  refreshSession,
  saveLoginSession,
  SessionExpiredError,
  waitForPendingRefresh,
} from "../infrastructure/api";
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
    if (isAxiosError(error)) {
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
    await saveLoginSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  } catch {
    await clearStoredSession();

    await publicApi
      .post("/auth/logout-web", {
        refreshToken: data.refreshToken,
      })
      .catch(() => undefined);

    throw new Error("No fue posible guardar la sesión de forma segura.");
  }

  return data.user;
};

export const restoreSession = async (): Promise<AuthUser | null> => {
  const refreshToken = await SecureStore.getItemAsync(AUTH_KEYS.refreshToken);

  if (!refreshToken) {
    await clearStoredSession();
    return null;
  }

  try {
    const data = await refreshSession();

    return data.user;
  } catch (error: unknown) {
    if (error instanceof SessionExpiredError) {
      return null;
    }

    throw error;
  }
};

export const logoutSession = async (): Promise<boolean> => {
  beginSignOut();

  let revoked = true;

  try {
    await waitForPendingRefresh();

    const refreshToken = await SecureStore.getItemAsync(AUTH_KEYS.refreshToken);

    if (refreshToken) {
      await publicApi.post("/auth/logout-web", {
        refreshToken,
      });
    }
  } catch {
    revoked = false;
  } finally {
    try {
      await clearStoredSession();
    } finally {
      endSignOut();
    }
  }

  return revoked;
};
