import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { AdminBottomNavigation } from "../../components/common/AdminBottomNavigation";

export default function PrivateLayout() {
  const { user } = useAuth();
  const isAdmin = !!user?.roles.includes("admin");
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      {isAdmin && <AdminBottomNavigation />}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
