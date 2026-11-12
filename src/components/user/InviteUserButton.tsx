import { Alert } from "react-native";
import type { UserRole } from "../../interfaces/auth.interface";
import { userRoleLabels } from "../../interfaces/user.interface";
import { inviteUser } from "../../services/user.service";
import { useManagementActions } from "../../viewmodels/useManagementActions";
import { CustomButton } from "../common/CustomButton";
import { OperationFormModal } from "../common/OperationFormModal";

export function InviteUserButton({
  onChanged,
}: {
  onChanged: () => Promise<void>;
}) {
  const actions = useManagementActions(onChanged);
  return (
    <>
      <CustomButton
        label="Invitar usuario"
        onPress={() =>
          actions.openForm({
            title: "Invitar usuario",
            description: "Envíe una invitación por correo electrónico.",
            submitLabel: "Enviar invitación",
            fields: [
              { key: "email", label: "Correo electrónico", type: "email" },
              {
                key: "role",
                label: "Rol",
                type: "select",
                options: (Object.keys(userRoleLabels) as UserRole[]).map(
                  (value) => ({ value, label: userRoleLabels[value] }),
                ),
              },
            ],
            submit: async (values) => {
              await inviteUser(values.email, values.role as UserRole);
              Alert.alert(
                "Invitación enviada",
                "La invitación se envió al correo electrónico indicado.",
              );
            },
          })
        }
      />
      <OperationFormModal actions={actions} />
    </>
  );
}
