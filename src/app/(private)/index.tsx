import { Alert, StyleSheet, Text, View } from "react-native";

import { api } from "@/infrastructure/api";
import { CustomButton } from "../../components/common/CustomButton";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../theme/colors";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  const handleTestSession = async () => {
    try {
      const { data } = await api.get("/auth/private3");

      Alert.alert("Sesión válida", `Usuario autenticado: ${data.user.name}`);
    } catch {
      Alert.alert("Error", "No fue posible verificar la sesión.");
    }
  };

  const handleLogout = async () => {
    try {
      const revoked = await signOut();

      if (!revoked) {
        Alert.alert(
          "Sesión cerrada",
          "Se cerró la sesión en este dispositivo, pero no fue posible confirmar su revocación en el servidor.",
        );
      }
    } catch {
      Alert.alert(
        "Aviso",
        "No fue posible completar el cierre de sesión correctamente.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {user?.name}</Text>

      <Text style={styles.subtitle}>
        Aquí se mostrarán sus procesos judiciales.
      </Text>

      <View style={styles.buttonContainer}>
        <CustomButton label="Verificar sesión" onPress={handleTestSession} />
        <CustomButton label="Cerrar sesión" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pwhite,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: Colors.pgray,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.sgray,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 16,
  },
});
