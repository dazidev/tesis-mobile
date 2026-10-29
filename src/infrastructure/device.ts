import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "device_id";

export const getDeviceId = async (): Promise<string> => {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = Crypto.randomUUID();

    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
};

export const getDeviceInfo = (): string => {
  return `${Platform.OS} ${Platform.Version} - Tesis Mobile`;
};
