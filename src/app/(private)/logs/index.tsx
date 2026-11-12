import { Redirect } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton } from "../../../components/common/ActionButton";
import { LogDetailsModal } from "../../../components/log/LogDetailsModal";
import { LogFiltersModal } from "../../../components/log/LogFiltersModal";
import { useAuth } from "../../../contexts/AuthContext";
import {
  formatLogDate,
  getLogActionLabel,
  getLogEntityLabel,
} from "../../../infrastructure/log-labels";
import type { ActivityLog } from "../../../interfaces/log.interface";
import { Colors } from "../../../theme/colors";
import { useLogsViewModel } from "../../../viewmodels/useLogsViewModel";

function LogsList() {
  const model = useLogsViewModel();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const data = model.data;
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={!model.loading && !model.error ? (data?.data ?? []) : []}
        keyExtractor={(log) => log.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={model.refreshing}
            onRefresh={model.refresh}
            tintColor={Colors.pblue}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Registros</Text>
            <Text style={styles.secondary}>Registro de actividad</Text>
            <View style={styles.actions}>
              <ActionButton
                label="Filtros"
                icon="filter-outline"
                disabled={!model.filters || model.filtersLoading}
                onPress={() => setShowFilters(true)}
              />
              {model.hasActiveFilters && (
                <ActionButton
                  label="Limpiar filtros"
                  onPress={() => model.applyFilters({})}
                />
              )}
            </View>
            {model.hasActiveFilters && (
              <Text style={styles.secondary}>Filtros aplicados.</Text>
            )}
            {!!model.filtersError && (
              <View style={styles.message}>
                <Text accessibilityRole="alert" style={styles.error}>
                  {model.filtersError}
                </Text>
                <ActionButton
                  label="Reintentar filtros"
                  onPress={model.retryFilters}
                />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          model.loading ? (
            <ActivityIndicator color={Colors.pblue} size="large" />
          ) : model.error ? (
            <View style={styles.message}>
              <Text accessibilityRole="alert" style={styles.error}>
                {model.error}
              </Text>
              <ActionButton label="Reintentar" onPress={model.retry} />
            </View>
          ) : (
            <Text style={styles.secondary}>No se encontraron registros.</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.secondary}>
              {formatLogDate(item.createdAt)}
            </Text>
            <Text style={styles.user}>
              {item.user
                ? `${item.user.name} ${item.user.lastname}`
                : "Usuario no disponible"}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {getLogEntityLabel(item.entity)}
              </Text>
            </View>
            <Text style={styles.action}>{getLogActionLabel(item.action)}</Text>
            {!!item.description && (
              <Text numberOfLines={2} style={styles.secondary}>
                {item.description}
              </Text>
            )}
            <View style={styles.actions}>
              <ActionButton
                label="Ver detalles"
                icon="eye-outline"
                onPress={() => setSelectedLog(item)}
              />
            </View>
          </View>
        )}
        ListFooterComponent={
          !model.loading && !model.error && data && data.totalCount > 0 ? (
            <View style={styles.pagination}>
              <Text style={styles.secondary}>
                Mostrando {(data.page - 1) * data.limit + 1}–
                {Math.min(data.page * data.limit, data.totalCount)} de{" "}
                {data.totalCount} registros
              </Text>
              <View style={styles.pages}>
                <ActionButton
                  label="Anterior"
                  disabled={data.page <= 1 || model.refreshing}
                  onPress={() => model.changePage(data.page - 1)}
                />
                <Text style={styles.pageLabel}>
                  Página {data.page} de {data.totalPages}
                </Text>
                <ActionButton
                  label="Siguiente"
                  disabled={data.page >= data.totalPages || model.refreshing}
                  onPress={() => model.changePage(data.page + 1)}
                />
              </View>
            </View>
          ) : undefined
        }
      />
      {showFilters && model.filters && (
        <LogFiltersModal
          query={model.query}
          filters={model.filters}
          onClose={() => setShowFilters(false)}
          onApply={(query) => {
            setShowFilters(false);
            model.applyFilters(query);
          }}
        />
      )}
      {selectedLog && (
        <LogDetailsModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </SafeAreaView>
  );
}

export default function LogsScreen() {
  const { user } = useAuth();
  if (!user?.roles.includes("admin")) return <Redirect href="/(private)" />;
  return <LogsList />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pwhite },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  header: { gap: 12, marginBottom: 6 },
  title: { fontSize: 25, fontWeight: "600", color: Colors.pgray },
  secondary: { fontSize: 14, lineHeight: 22, color: Colors.sgray },
  card: {
    padding: 18,
    gap: 9,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 14,
  },
  user: { fontSize: 15, color: Colors.pgray },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: Colors.sbutton,
  },
  badgeText: { color: Colors.pgray, fontSize: 12, fontWeight: "500" },
  action: { fontSize: 17, fontWeight: "600", color: Colors.pgray },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pagination: { gap: 14, alignItems: "center", paddingTop: 10 },
  pages: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  pageLabel: { color: Colors.pgray, fontSize: 13 },
  message: { gap: 12 },
  error: { color: Colors.error, lineHeight: 21 },
});
