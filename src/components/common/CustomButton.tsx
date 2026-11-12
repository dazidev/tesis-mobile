import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "../../theme/colors";

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "filled" | "outline";
  danger?: boolean;
}

export const CustomButton = ({
  label,
  onPress,
  disabled = false,
  variant = "filled",
  danger = false,
}: Props) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        variant === "outline" && styles.outline,
        danger && styles.danger,
        pressed &&
          (variant === "outline" || danger
            ? styles.outlinePressed
            : styles.pressed),
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "outline" && styles.outlineText,
          danger && styles.dangerText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    backgroundColor: Colors.pblue,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: Colors.pbutton,
  },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.pblue,
  },
  outlineText: { color: Colors.pblue },
  danger: {
    backgroundColor: "#FCF3F2",
    borderWidth: 1,
    borderColor: Colors.error,
  },
  dangerText: { color: Colors.error },
  outlinePressed: { opacity: 0.75 },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
});
