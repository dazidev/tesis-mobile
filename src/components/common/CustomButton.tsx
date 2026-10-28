import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "../../theme/colors";

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export const CustomButton = ({ label, onPress, disabled = false }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
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
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
});
