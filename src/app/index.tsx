import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CustomButton } from "../components/common/CustomButton";
import { CustomInput } from "../components/common/CustomInput";
import { Colors } from "../theme/colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = () => {
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Ingrese un correo electrónico válido.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("La contraseña debe contener al menos 8 caracteres.");
      return;
    }

    Alert.alert(
      "Formulario validado",
      "El diseño está listo. En el siguiente paso conectaremos el inicio de sesión con el backend.",
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.appName}>Seguimiento Sucesorio</Text>

          <Text style={styles.appDescription}>
            Sistema de seguimiento de procesos judiciales
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Iniciar sesión</Text>

          <Text style={styles.subtitle}>
            Ingrese sus credenciales para consultar el estado de su proceso.
          </Text>

          <View style={styles.form}>
            <CustomInput
              label="Correo electrónico"
              placeholder="Ingrese su correo electrónico"
              type="email"
              value={email}
              onChangeText={setEmail}
            />

            <CustomInput
              label="Contraseña"
              placeholder="Ingrese su contraseña"
              type="password"
              value={password}
              onChangeText={setPassword}
            />

            {errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <View style={styles.buttonContainer}>
              <CustomButton label="Iniciar sesión" onPress={handleLogin} />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pwhite,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 27,
    fontWeight: "600",
    color: Colors.pgray,
    textAlign: "center",
  },

  appDescription: {
    fontSize: 15,
    color: Colors.sgray,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 320,
    lineHeight: 22,
  },
  card: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.pgray,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.sgray,
    lineHeight: 24,
    marginTop: 8,
  },
  form: {
    gap: 16,
    marginTop: 24,
  },
  buttonContainer: {
    marginTop: 8,
  },
  error: {
    fontSize: 13,
    color: Colors.error,
    textAlign: "center",
  },
  footer: {
    marginTop: 28,
    fontSize: 12,
    textAlign: "center",
    color: Colors.sgray,
  },
});
