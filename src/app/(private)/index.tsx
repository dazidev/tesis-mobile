import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../../components/common/CustomButton";
import { useAuth } from "../../contexts/AuthContext";
import {
  ClientProcess,
  ProcessStatus,
  ProcessType,
} from "../../interfaces/process.interface";
import { Colors } from "../../theme/colors";
import { useMyProcessesViewModel } from "../../viewmodels/useMyProcessesViewModel";
import type { ManagedProcess } from "../../interfaces/management.interface";
import { CreateProcessButton } from "../../components/process/CreateProcessButton";

const processTypes: Record<ProcessType, string> = {
  testate: "Testamentario",
  intestate: "Intestamentario",
  mixed: "Mixto",
};

const processStatuses: Record<ProcessStatus, string> = {
  created: "Pendiente",
  opened: "En curso",
  closed: "Finalizado",
};

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const {
    processes,
    isLoading,
    isRefreshing,
    errorMessage,
    refresh,
    retry,
    reload,
    isLawyer,
  } = useMyProcessesViewModel();

  const handleLogout = async () => {
    try {
      const revoked = await signOut();

      if (!revoked) {
        Alert.alert(
          "Sesión cerrada",
          "Se cerró la sesión en este dispositivo, pero no fue posible confirmar su revocación en el servidor.",
        );
      }
    } catch {
      Alert.alert("Aviso", "No fue posible completar el cierre de sesión.");
    }
  };

  const renderProcess = ({
    item,
  }: {
    item: ClientProcess | ManagedProcess;
  }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.processCard,
          pressed && { opacity: 0.75 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Ver expediente ${item.caseFileNumber}`}
        onPress={() =>
          router.push({
            pathname: "/(private)/processes/[id]",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.caseNumber}>
            Expediente {item.caseFileNumber}
          </Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {processStatuses[item.status]}
            </Text>
          </View>
        </View>

        <Text style={styles.processType}>
          Juicio sucesorio {processTypes[item.type].toLowerCase()}
        </Text>

        <View style={styles.separator} />

        <Text style={styles.detailLabel}>Juzgado</Text>
        <Text style={styles.detailValue}>{item.courtNumber}</Text>

        {"defendant" in item && (
          <>
            <Text style={styles.detailLabel}>Finado</Text>
            <Text style={styles.detailValue}>
              {item.defendant.name} {item.defendant.lastname}
            </Text>
          </>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={processes}
        keyExtractor={(item) => item.id}
        renderItem={renderProcess}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Colors.pblue}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.greeting}>Bienvenido, {user?.name}</Text>

            <Text style={styles.subtitle}>
              {isLawyer
                ? "Administre sus expedientes, documentos, tareas y clientes desde su teléfono."
                : "Consulte los procesos judiciales en los que se encuentra vinculado."}
            </Text>

            <Text style={styles.sectionTitle}>Mis procesos</Text>
            {isLawyer && <CreateProcessButton onChanged={reload} />}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={Colors.pblue} />
            ) : errorMessage ? (
              <>
                <Text style={styles.emptyText}>{errorMessage}</Text>

                <Pressable onPress={retry}>
                  <Text style={styles.retryText}>Reintentar</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.emptyText}>
                {isLawyer
                  ? "Todavía no tiene procesos registrados. Cree su primer expediente para comenzar."
                  : "Actualmente no tiene procesos judiciales vinculados a su cuenta."}
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <CustomButton label="Cerrar sesión" onPress={handleLogout} />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pwhite,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  header: {
    marginBottom: 8,
    gap: 8,
  },
  greeting: {
    fontSize: 25,
    fontWeight: "600",
    color: Colors.pgray,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.sgray,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: Colors.pgray,
    marginTop: 22,
  },
  processCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 14,
    padding: 18,
    gap: 7,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  caseNumber: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: Colors.pgray,
  },
  statusBadge: {
    backgroundColor: Colors.sbutton,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    color: Colors.pgray,
    fontWeight: "500",
  },
  processType: {
    fontSize: 14,
    color: Colors.sgray,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.pborder,
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.sgray,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.pgray,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 35,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: Colors.sgray,
  },
  retryText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.pblue,
  },
  footer: {
    marginTop: 25,
  },
});
