import { StyleSheet, Text, View } from "react-native";
import type { Task } from "../../interfaces/management.interface";
import {
  completeTask,
  createTask,
  deactivateTask,
  updateTask,
} from "../../services/task.service";
import { Colors } from "../../theme/colors";
import {
  reasonField,
  useManagementActions,
} from "../../viewmodels/useManagementActions";
import { ActionButton } from "../common/ActionButton";
import { OperationFormModal } from "../common/OperationFormModal";

interface Props {
  tasks: Task[];
  stageId: string;
  substageId?: string;
  editable: boolean;
  onChanged: () => Promise<void>;
}

export function TaskContainer({
  tasks,
  stageId,
  substageId,
  editable,
  onChanged,
}: Props) {
  const actions = useManagementActions(onChanged);
  const edit = (task?: Task) =>
    actions.openForm({
      title: task ? "Editar tarea" : "Crear tarea",
      initial: task
        ? { description: task.description, dueDate: task.dueDate }
        : undefined,
      fields: [
        {
          key: "description",
          label: "Descripción",
          type: "multiline",
          maxLength: 500,
        },
        { key: "dueDate", label: "Fecha límite", type: "datetime" },
      ],
      submit: async (values) => {
        if (!task && new Date(values.dueDate).getTime() <= Date.now())
          throw new Error(
            "La fecha límite debe ser posterior a la fecha actual.",
          );
        const data = {
          description: values.description,
          dueDate: values.dueDate,
        };
        if (task) await updateTask(task.id, data);
        else
          await createTask(stageId, {
            ...data,
            ...(substageId && { substageId }),
          });
      },
    });

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Tareas · {tasks.length}</Text>
      {editable && (
        <ActionButton
          label="Crear tarea"
          icon="add-outline"
          disabled={actions.busy}
          onPress={() => edit()}
        />
      )}
      {!tasks.length && (
        <Text style={styles.secondary}>No hay tareas registradas.</Text>
      )}
      {tasks.map((task) => (
        <View key={task.id} style={styles.card}>
          <Text
            style={[styles.description, !!task.completedAt && styles.completed]}
          >
            {task.description}
          </Text>
          <Text style={styles.secondary}>
            {task.completedAt ? "Completada" : "Pendiente"} · Vence{" "}
            {new Date(task.dueDate).toLocaleString("es-MX", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </Text>
          {editable && (
            <View style={styles.actions}>
              <ActionButton
                disabled={actions.busy}
                label={task.completedAt ? "Reabrir" : "Completar"}
                icon="checkmark-circle-outline"
                onPress={() =>
                  actions.confirm(
                    task.completedAt ? "Reabrir tarea" : "Completar tarea",
                    task.description,
                    () => completeTask(task.id, !task.completedAt),
                  )
                }
              />
              <ActionButton
                disabled={actions.busy}
                label="Editar"
                icon="create-outline"
                onPress={() => edit(task)}
              />
              <ActionButton
                disabled={actions.busy}
                label="Eliminar"
                icon="trash-outline"
                danger
                onPress={() =>
                  actions.openForm({
                    title: "Eliminar tarea",
                    fields: [reasonField],
                    submit: (values) => deactivateTask(task.id, values.reason),
                  })
                }
              />
            </View>
          )}
        </View>
      ))}
      <OperationFormModal actions={actions} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10, marginTop: 8 },
  title: { color: Colors.pgray, fontWeight: "600", fontSize: 16 },
  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.pborder,
    gap: 8,
    backgroundColor: Colors.pwhite,
  },
  description: { fontSize: 15, lineHeight: 22, color: Colors.pgray },
  completed: { textDecorationLine: "line-through", color: Colors.sgray },
  secondary: { color: Colors.sgray, fontSize: 13, lineHeight: 20 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
});
