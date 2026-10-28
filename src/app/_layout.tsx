import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../theme/colors";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.pwhite,
          },
        }}
      />

      <StatusBar style="dark" />
    </>
  );
}
