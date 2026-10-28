import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "../../theme/colors";

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  type?: "text" | "email" | "password";
}

export const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  type = "text",
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = type === "password";
  const isEmail = type === "email";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputContainer, focused && styles.inputFocused]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={isEmail ? "email-address" : "default"}
          autoCapitalize={isEmail ? "none" : "sentences"}
          autoCorrect={false}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={21}
              color={Colors.sgray}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.pgray,
    marginLeft: 4,
  },
  inputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: Colors.pblue,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: Colors.pgray,
  },
});
