import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "../../theme/colors";

interface Props {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function ActionButton({
  label,
  icon,
  danger,
  disabled,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        danger && styles.danger,
        (disabled || pressed) && styles.dim,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={danger ? Colors.error : Colors.pblue}
        />
      )}
      <Text style={[styles.label, danger && { color: Colors.error }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.pwhite,
    borderWidth: 1,
    borderColor: Colors.pborder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  label: {
    color: Colors.pblue,
    fontWeight: "600",
    fontSize: 14,
    flexShrink: 1,
  },
  danger: { backgroundColor: "#FCF3F2" },
  dim: { opacity: 0.5 },
});
