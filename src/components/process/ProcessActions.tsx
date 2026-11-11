import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import type { ClientProcessDetail } from "../../interfaces/process.interface";
import {
  deactivateProcess,
  initProcess,
} from "../../services/management.service";
import {
  reasonField,
  useManagementActions,
} from "../../viewmodels/useManagementActions";
import { ActionButton } from "../common/ActionButton";
import { OperationFormModal } from "../common/OperationFormModal";

export function ProcessActions({
  process,
  onChanged,
}: {
  process: ClientProcessDetail;
  onChanged: () => Promise<void>;
}) {
  const router = useRouter();
  const actions = useManagementActions(onChanged);
  return (
    <View style={styles.actions}>
      {process.status === "created" && (
        <ActionButton
          label="Iniciar proceso"
          icon="play-outline"
          disabled={actions.busy}
          onPress={() =>
            actions.confirm(
              "Iniciar proceso",
              "Se crearán las cinco etapas principales y se abrirá la primera.",
              () => initProcess(process.id),
            )
          }
        />
      )}
      <ActionButton
        label={
          process.status === "created"
            ? "Eliminar proceso"
            : "Desactivar proceso"
        }
        icon="trash-outline"
        danger
        disabled={actions.busy}
        onPress={() =>
          actions.openForm({
            title:
              process.status === "created"
                ? "Eliminar proceso"
                : "Desactivar proceso",
            description:
              process.status === "created"
                ? "Se eliminará el proceso pendiente de inicio."
                : "El proceso se desactivará y dejará de estar disponible para sus clientes.",
            fields: [reasonField],
            submit: async (values) => {
              await deactivateProcess(process.id, values.reason);
              router.replace("/(private)");
            },
          })
        }
      />
      <OperationFormModal actions={actions} />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 10, flexDirection: "row", flexWrap: "wrap" },
});
