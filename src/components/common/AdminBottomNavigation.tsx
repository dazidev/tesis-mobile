import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";

export function AdminBottomNavigation() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const usersSelected = pathname.startsWith("/users");
  const logsSelected = pathname.startsWith("/logs");
  const processesSelected = !usersSelected && !logsSelected;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
      accessibilityRole="tablist"
    >
      <Pressable
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: processesSelected }}
        accessibilityLabel="Procesos"
        onPress={() => router.dismissTo("/(private)")}
      >
        <Ionicons
          name="document-text-outline"
          size={24}
          color={processesSelected ? Colors.pblue : Colors.sgray}
        />
        <Text style={processesSelected ? styles.activeLabel : styles.label}>
          Procesos
        </Text>
      </Pressable>
      <Pressable
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: usersSelected }}
        accessibilityLabel="Usuarios"
        onPress={() => {
          if (!usersSelected) router.push("/(private)/users");
        }}
      >
        <Ionicons
          name="person-outline"
          size={24}
          color={usersSelected ? Colors.pblue : Colors.sgray}
        />
        <Text style={usersSelected ? styles.activeLabel : styles.label}>
          Usuarios
        </Text>
      </Pressable>
      <Pressable
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: logsSelected }}
        accessibilityLabel="Registros"
        onPress={() => {
          if (!logsSelected) router.push("/(private)/logs");
        }}
      >
        <Ionicons
          name="clipboard-outline"
          size={24}
          color={logsSelected ? Colors.pblue : Colors.sgray}
        />
        <Text style={logsSelected ? styles.activeLabel : styles.label}>
          Registros
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderColor: Colors.pborder,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 4,
  },
  activeLabel: { fontSize: 13, color: Colors.pblue, fontWeight: "600" },
  label: { fontSize: 13, color: Colors.sgray },
});
