import { Pressable, StyleSheet, Text, View } from "react-native";
import type { UserRole } from "../../interfaces/auth.interface";
import { userRoleLabels } from "../../interfaces/user.interface";
import { Colors } from "../../theme/colors";

export function UserRolesField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const roles = value.split(",").filter(Boolean);
  return (
    <View style={styles.container}>
      <View style={styles.options}>
        {(Object.keys(userRoleLabels) as UserRole[]).map((role) => {
          const selected = roles.includes(role);
          return (
            <Pressable
              key={role}
              accessibilityRole="checkbox"
              accessibilityLabel={userRoleLabels[role]}
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() =>
                onChange(
                  (selected
                    ? roles.filter((item) => item !== role)
                    : [...roles, role]
                  ).join(","),
                )
              }
              style={({ pressed }) => [
                styles.option,
                selected && styles.selected,
                (pressed || disabled) && styles.dim,
              ]}
            >
              <Text style={[styles.label, selected && styles.selectedLabel]}>
                {selected ? "✓ " : ""}
                {userRoleLabels[role]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.help}>Seleccione uno o más roles.</Text>
      <Text style={styles.help}>
        Cambiar los roles modifica el acceso del usuario.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    minHeight: 44,
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  selected: { backgroundColor: Colors.pblue, borderColor: Colors.pblue },
  label: { fontSize: 14, color: Colors.pgray },
  selectedLabel: { color: Colors.white, fontWeight: "600" },
  help: { color: Colors.sgray, fontSize: 14, lineHeight: 21 },
  dim: { opacity: 0.6 },
});
