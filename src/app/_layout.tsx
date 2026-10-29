import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AuthProvider, useAuth } from "../contexts/AuthContext";

import { Colors } from "../theme/colors";

const RootNavigator = () => {
  const { user, isRestoring, restoreError, retryRestore } = useAuth();

  if (isRestoring) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.pblue} />
      </View>
    );
  }

  if (restoreError) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No fue posible verificar su sesión.</Text>

        <Pressable onPress={() => void retryRestore()}>
          <Text style={styles.retry}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.pwhite,
        },
      }}
    >
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={!!user} redirectTo="/login">
        <Stack.Screen name="(private)" />
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pwhite,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 20,
  },
  message: {
    fontSize: 16,
    color: Colors.pgray,
    textAlign: "center",
  },
  retry: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.pblue,
  },
});
