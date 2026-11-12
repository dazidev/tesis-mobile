import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { ActionButton } from "./ActionButton";

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const selected =
    options.find((option) => option.value === value)?.label ?? "Seleccionar";
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected}`}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.input, pressed && styles.dim]}
      >
        <Text style={styles.value}>{selected}</Text>
        <Ionicons name="chevron-down" size={20} color={Colors.pblue} />
      </Pressable>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{label}</Text>
            <ActionButton label="Cancelar" onPress={() => setVisible(false)} />
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: option.value === value }}
                onPress={() => {
                  onChange(option.value);
                  setVisible(false);
                }}
                style={({ pressed }) => [
                  styles.input,
                  option.value === value && styles.selected,
                  pressed && styles.dim,
                ]}
              >
                <Text style={styles.value}>{option.label}</Text>
                <Ionicons
                  name={
                    option.value === value
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={22}
                  color={Colors.pblue}
                />
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pwhite },
  header: {
    padding: 20,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: Colors.pborder,
  },
  title: { flex: 1, fontSize: 21, fontWeight: "600", color: Colors.pgray },
  content: { padding: 20, gap: 12 },
  input: {
    minHeight: 52,
    padding: 14,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
  },
  value: { flex: 1, color: Colors.pgray, fontSize: 16 },
  selected: { borderColor: Colors.pblue },
  dim: { opacity: 0.6 },
});
