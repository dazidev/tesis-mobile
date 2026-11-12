import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import type { AuthUser, UserRole } from "../../interfaces/auth.interface";
import { deactivateUser, updateUser } from "../../services/user.service";
import { useManagementActions } from "../../viewmodels/useManagementActions";
import { ActionButton } from "../common/ActionButton";
import { OperationFormModal } from "../common/OperationFormModal";
import { UserRolesField } from "./UserRolesField";

export function UserActions({
  user,
  onChanged,
}: {
  user: AuthUser;
  onChanged: () => Promise<void>;
}) {
  const auth = useAuth();
  const reloadAllowed = useRef(true);
  const actions = useManagementActions(async () => {
    if (reloadAllowed.current) await onChanged();
  });

  return (
    <View style={styles.actions}>
      <ActionButton
        label="Editar"
        icon="create-outline"
        disabled={actions.busy}
        onPress={() => {
          reloadAllowed.current = true;
          actions.openForm({
            title: "Editar usuario",
            submitLabel: "Guardar cambios",
            initial: {
              name: user.name,
              lastname: user.lastname,
              email: user.email,
              roles: user.roles.join(","),
            },
            fields: [
              { key: "name", label: "Nombre", minLength: 2, maxLength: 50 },
              {
                key: "lastname",
                label: "Apellidos",
                minLength: 2,
                maxLength: 50,
              },
              { key: "email", label: "Correo electrónico", type: "email" },
              {
                key: "roles",
                label: "Roles",
                render: (props) => <UserRolesField {...props} />,
              },
            ],
            submit: async (values) => {
              const updated = await updateUser(user.id, {
                name: values.name,
                lastname: values.lastname,
                email: values.email,
                roles: values.roles.split(",") as UserRole[],
              });
              if (user.id === auth.user?.id) {
                reloadAllowed.current = updated.roles.includes("admin");
                auth.signIn(updated);
              }
            },
          });
        }}
      />
      <ActionButton
        label="Desactivar"
        icon="ban-outline"
        danger
        disabled={actions.busy}
        onPress={() => {
          reloadAllowed.current = true;
          actions.openForm({
            title: "Desactivar usuario",
            description: `${user.name} ${user.lastname}\n${user.email}`,
            submitLabel: "Desactivar usuario",
            submitDanger: true,
            fields: [
              {
                key: "type",
                label: "Tipo",
                type: "select",
                options: [
                  { value: "inactive", label: "Inactivo" },
                  { value: "suspended", label: "Suspendido" },
                ],
              },
              {
                key: "reason",
                label: "Razón",
                help: "Entre 10 y 250 caracteres.",
                type: "multiline",
                minLength: 10,
                maxLength: 250,
              },
            ],
            submit: async (values) => {
              await deactivateUser(user.id, {
                type: values.type as "inactive" | "suspended",
                reason: values.reason,
              });
              if (user.id === auth.user?.id) {
                reloadAllowed.current = false;
                await auth.signOut();
              }
            },
          });
        }}
      />
      <OperationFormModal actions={actions} />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
});
