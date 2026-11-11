import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  ClientStage,
  ClientSubstage,
  ProcessStatus,
} from "../../interfaces/process.interface";
import { createFolder } from "../../services/folder.service";
import {
  advanceStage,
  closeContainer,
  createIntermediateStage,
  createSubstage,
  deactivateContainer,
  finalizeProcess,
} from "../../services/management.service";
import { Colors } from "../../theme/colors";
import { useContainerViewModel } from "../../viewmodels/useContainerViewModel";
import {
  nameDescriptionFields,
  reasonField,
  useManagementActions,
} from "../../viewmodels/useManagementActions";
import { ActionButton } from "../common/ActionButton";
import { OperationFormModal } from "../common/OperationFormModal";
import { ManagedFolderItem } from "./ManagedFolderItem";
import { TaskContainer } from "./TaskContainer";

interface Props {
  item: ClientStage | ClientSubstage;
  stage: ClientStage;
  nextStage?: ClientStage;
  processStatus: ProcessStatus;
  revision: number;
  onChanged: () => Promise<void>;
  depth?: number;
}

const labels = { created: "Pendiente", opened: "En curso", closed: "Cerrada" };

export function ManagedStageAccordion({
  item,
  stage,
  nextStage,
  processStatus,
  revision,
  onChanged,
  depth = 0,
}: Props) {
  const substage = "stageId" in item;
  const [expanded, setExpanded] = useState(
    !substage && item.status === "opened",
  );
  const { detail, loading, error, reload } = useContainerViewModel(
    item.id,
    substage,
    expanded,
    revision,
  );
  const actions = useManagementActions(onChanged);
  const editable =
    processStatus === "opened" &&
    stage.status === "opened" &&
    item.status === "opened";
  const canAdvance =
    !substage &&
    processStatus === "opened" &&
    item.status === "closed" &&
    nextStage?.status === "created";
  const canInsert =
    !substage &&
    processStatus === "opened" &&
    item.status === "closed" &&
    (!nextStage || nextStage.status === "created");
  const canFinalize =
    !substage &&
    processStatus === "opened" &&
    item.status === "closed" &&
    !nextStage;

  return (
    <View
      style={[
        styles.container,
        substage && styles.substage,
        depth > 2 && { marginLeft: 0 },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(!expanded)}
        style={[styles.header, item.status === "opened" && styles.activeHeader]}
      >
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={20}
          color={Colors.pblue}
        />
        <View style={styles.heading}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.status}>
            {substage ? "Subetapa" : `Etapa ${stage.order}`} ·{" "}
            {labels[item.status]}
          </Text>
        </View>
      </Pressable>
      {expanded && (
        <View style={styles.content}>
          {!!item.description && (
            <Text style={styles.secondary}>{item.description}</Text>
          )}
          <View style={styles.actions}>
            {editable && (
              <>
                <ActionButton
                  label={substage ? "Añadir subetapa hija" : "Añadir subetapa"}
                  icon="add-outline"
                  disabled={actions.busy}
                  onPress={() =>
                    actions.openForm({
                      title: substage
                        ? "Crear subetapa hija"
                        : "Crear subetapa",
                      fields: nameDescriptionFields,
                      submit: (values) =>
                        createSubstage(stage.id, {
                          name: values.name,
                          description: values.description,
                          ...(substage && { parentSubstageId: item.id }),
                        }),
                    })
                  }
                />
                <ActionButton
                  label="Crear carpeta"
                  icon="folder-outline"
                  disabled={actions.busy}
                  onPress={() =>
                    actions.openForm({
                      title: "Crear carpeta",
                      fields: nameDescriptionFields,
                      submit: (values) =>
                        createFolder(stage.id, {
                          name: values.name,
                          description: values.description,
                          ...(substage && { substageId: item.id }),
                        }),
                    })
                  }
                />
                <ActionButton
                  label={substage ? "Cerrar subetapa" : "Cerrar etapa"}
                  icon="checkmark-circle-outline"
                  disabled={actions.busy}
                  onPress={() =>
                    actions.confirm(
                      substage ? "Cerrar subetapa" : "Cerrar etapa",
                      substage
                        ? "Cada carpeta activa debe contener al menos un PDF. Al cerrar ya no podrá modificar este contenedor."
                        : "Todas las subetapas deben estar cerradas y cada carpeta de esta etapa debe contener al menos un PDF. Al cerrar ya no podrá modificarla.",
                      () => closeContainer(item.id, substage),
                    )
                  }
                />
                {(substage || !stage.main) && (
                  <ActionButton
                    label={
                      substage
                        ? "Eliminar subetapa"
                        : "Eliminar etapa intermedia"
                    }
                    danger
                    icon="trash-outline"
                    disabled={actions.busy}
                    onPress={() =>
                      actions.openForm({
                        title: substage
                          ? "Eliminar subetapa"
                          : "Eliminar etapa intermedia",
                        fields: [reasonField],
                        submit: (values) =>
                          deactivateContainer(item.id, substage, values.reason),
                      })
                    }
                  />
                )}
              </>
            )}
            {canInsert && (
              <ActionButton
                label="Añadir etapa intermedia"
                icon="add-outline"
                disabled={actions.busy}
                onPress={() =>
                  actions.openForm({
                    title: "Crear etapa intermedia",
                    fields: nameDescriptionFields,
                    submit: (values) =>
                      createIntermediateStage(stage.id, {
                        name: values.name,
                        description: values.description,
                      }),
                  })
                }
              />
            )}
            {canAdvance && (
              <ActionButton
                label="Avanzar a siguiente etapa"
                icon="arrow-forward-outline"
                disabled={actions.busy}
                onPress={() =>
                  actions.confirm(
                    "Avanzar etapa",
                    `Se abrirá la etapa «${nextStage!.name}».`,
                    () => advanceStage(stage.id),
                  )
                }
              />
            )}
            {canFinalize && (
              <ActionButton
                label="Finalizar proceso"
                icon="checkmark-done-outline"
                disabled={actions.busy}
                onPress={() =>
                  actions.confirm(
                    "Finalizar proceso",
                    "El expediente quedará finalizado y disponible para consulta.",
                    () => finalizeProcess(stage.id),
                  )
                }
              />
            )}
          </View>
          {item.status !== "opened" && (
            <Text style={styles.secondary}>
              Disponible para consulta.{" "}
              {item.status === "closed"
                ? "Este contenedor está cerrado."
                : "Esta etapa aún no ha iniciado."}
            </Text>
          )}
          {loading ? (
            <ActivityIndicator color={Colors.pblue} />
          ) : error ? (
            <View style={styles.content}>
              <Text style={styles.error}>{error}</Text>
              <ActionButton label="Reintentar" onPress={() => void reload()} />
            </View>
          ) : (
            detail && (
              <>
                <Text style={styles.sectionTitle}>
                  Carpetas · {detail.digitalFolders.length}
                </Text>
                {!detail.digitalFolders.length && (
                  <Text style={styles.secondary}>
                    No hay carpetas registradas.
                  </Text>
                )}
                {detail.digitalFolders.map((folder) => (
                  <ManagedFolderItem
                    key={folder.id}
                    folder={folder}
                    editable={editable}
                    onChanged={onChanged}
                    revision={revision}
                  />
                ))}
                <TaskContainer
                  tasks={detail.tasks}
                  stageId={stage.id}
                  substageId={substage ? item.id : undefined}
                  editable={editable}
                  onChanged={onChanged}
                />
              </>
            )
          )}
          {!!item.childrenSubstages.length && (
            <View style={styles.children}>
              <Text style={styles.sectionTitle}>
                Subetapas · {item.childrenSubstages.length}
              </Text>
              {item.childrenSubstages.map((child) => (
                <ManagedStageAccordion
                  key={child.id}
                  item={child}
                  stage={stage}
                  processStatus={processStatus}
                  revision={revision}
                  onChanged={onChanged}
                  depth={depth + 1}
                />
              ))}
            </View>
          )}
        </View>
      )}
      <OperationFormModal actions={actions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 12,
    overflow: "hidden",
  },
  substage: { borderRadius: 8, borderLeftWidth: 3, marginLeft: 4 },
  header: {
    padding: 15,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.pwhite,
  },
  activeHeader: { backgroundColor: "#EEF2F4" },
  heading: { flex: 1, gap: 5 },
  title: {
    fontWeight: "600",
    color: Colors.pgray,
    fontSize: 16,
    lineHeight: 22,
  },
  status: { color: Colors.sgray, fontSize: 12 },
  content: { padding: 12, gap: 12 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  secondary: { color: Colors.sgray, fontSize: 13, lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.pgray },
  children: { gap: 10, marginTop: 8 },
  error: { color: Colors.error, lineHeight: 20 },
});
