import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  formatLogDate,
  getLogActionLabel,
  getLogEntityLabel,
} from "../../infrastructure/log-labels";
import type { ActivityLog } from "../../interfaces/log.interface";
import { Colors } from "../../theme/colors";
import { ActionButton } from "../common/ActionButton";

export function LogDetailsModal({
  log,
  onClose,
}: {
  log: ActivityLog;
  onClose: () => void;
}) {
  const details = [
    ["Fecha y hora", formatLogDate(log.createdAt)],
    [
      "Usuario responsable",
      log.user ? `${log.user.name} ${log.user.lastname}` : "No disponible",
    ],
    ["Correo electrónico", log.user?.email ?? "No disponible"],
    ["ID del usuario", log.userId ?? "No disponible"],
    ["Categoría", getLogEntityLabel(log.entity)],
    ["Acción", getLogActionLabel(log.action)],
    ["Código de acción", log.action],
    ["Entidad afectada", log.affected ?? "No disponible"],
    ["ID del registro", log.id],
  ];
  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Detalles del registro</Text>
          <ActionButton label="Cerrar" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            {details.map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text selectable style={styles.value}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.description}>
            <Text style={styles.label}>Descripción</Text>
            <Text selectable style={styles.value}>
              {log.description || "Sin descripción"}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pwhite },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderColor: Colors.pborder,
  },
  title: { flex: 1, fontSize: 21, fontWeight: "600", color: Colors.pgray },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  card: {
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
  row: {
    padding: 16,
    gap: 7,
    borderBottomWidth: 1,
    borderColor: Colors.pborder,
  },
  label: { fontSize: 15, fontWeight: "600", color: Colors.pgray },
  value: { fontSize: 14, lineHeight: 22, color: Colors.pgray },
  description: {
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 14,
    backgroundColor: Colors.white,
  },
});
