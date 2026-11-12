import { Redirect } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton } from "../../../components/common/ActionButton";
import { InviteUserButton } from "../../../components/user/InviteUserButton";
import { UserActions } from "../../../components/user/UserActions";
import { useAuth } from "../../../contexts/AuthContext";
import {
  userRoleLabels,
  userStatusLabels,
} from "../../../interfaces/user.interface";
import { Colors } from "../../../theme/colors";
import { useUsersViewModel } from "../../../viewmodels/useUsersViewModel";

function UsersList() {
  const model = useUsersViewModel();
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={model.users}
        keyExtractor={(user) => user.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={model.isRefreshing}
            onRefresh={model.refresh}
            tintColor={Colors.pblue}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Usuarios</Text>
            <Text style={styles.subtitle}>Usuarios registrados</Text>
            <InviteUserButton onChanged={model.reload} />
            <TextInput
              accessibilityLabel="Buscar usuario por nombre o correo"
              placeholder="Buscar por nombre o correo"
              placeholderTextColor={Colors.sgray}
              value={model.query}
              onChangeText={model.setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            {!!model.errorMessage && (
              <View style={styles.message}>
                <Text accessibilityRole="alert" style={styles.error}>
                  {model.errorMessage}
                </Text>
                <ActionButton label="Reintentar" onPress={model.retry} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          model.isLoading ? (
            <ActivityIndicator size="large" color={Colors.pblue} />
          ) : !model.errorMessage ? (
            <Text style={styles.subtitle}>
              {model.query.trim()
                ? "No se encontraron usuarios con ese nombre o correo."
                : "No hay usuarios registrados."}
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.name} {item.lastname}
            </Text>
            <Text style={styles.email}>{item.email}</Text>
            <View style={styles.badges}>
              {item.roles.map((role) => (
                <View key={role} style={styles.badge}>
                  <Text style={styles.badgeText}>{userRoleLabels[role]}</Text>
                </View>
              ))}
              <View
                style={[
                  styles.badge,
                  item.status !== "active" && styles.inactive,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.status !== "active" && styles.error,
                  ]}
                >
                  {userStatusLabels[item.status]}
                </Text>
              </View>
            </View>
            <UserActions user={item} onChanged={model.reload} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default function UsersScreen() {
  const { user } = useAuth();
  if (!user?.roles.includes("admin")) return <Redirect href="/(private)" />;
  return <UsersList />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pwhite },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  header: { gap: 14, marginBottom: 6 },
  title: { fontSize: 25, fontWeight: "600", color: Colors.pgray },
  subtitle: { fontSize: 15, lineHeight: 23, color: Colors.sgray },
  input: {
    minHeight: 52,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    backgroundColor: Colors.white,
    color: Colors.pgray,
    fontSize: 16,
  },
  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 14,
    backgroundColor: Colors.white,
    gap: 8,
  },
  name: { fontSize: 17, fontWeight: "600", color: Colors.pgray },
  email: { fontSize: 14, lineHeight: 21, color: Colors.sgray },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 3 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: Colors.sbutton,
  },
  badgeText: { color: Colors.pgray, fontSize: 12, fontWeight: "500" },
  inactive: { backgroundColor: "#FCF3F2" },
  error: { color: Colors.error, lineHeight: 21 },
  message: { gap: 12 },
});
