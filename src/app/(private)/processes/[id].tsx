import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { StageAccordion } from "../../../components/process/StageAccordion";
import {
  ProcessStatus,
  ProcessType,
} from "../../../interfaces/process.interface";
import { Colors } from "../../../theme/colors";
import { useProcessDetailViewModel } from "../../../viewmodels/useProcessDetailViewModel";
import { useState } from "react";
import { ManagedStageAccordion } from "../../../components/process/ManagedStageAccordion";
import { ProcessClientsPanel } from "../../../components/process/ProcessClientsPanel";
import { ProcessActions } from "../../../components/process/ProcessActions";

const typeLabels: Record<ProcessType, string> = {
  testate: "Testamentario",
  intestate: "Intestamentario",
  mixed: "Mixto",
};

const statusLabels: Record<ProcessStatus, string> = {
  created: "Pendiente",
  opened: "En curso",
  closed: "Finalizado",
};

export default function ProcessDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const processId = typeof id === "string" ? id : "";
  const [revision, setRevision] = useState(0);

  const {
    process,
    isLoading,
    isRefreshing,
    errorMessage,
    refresh,
    retry,
    folders,
    openingFileId,
    openFile,
    reload,
    isLawyer,
  } = useProcessDetailViewModel(processId);

  const handleChanged = async () => {
    await reload();
    setRevision((value) => value + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver a mis procesos"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.pgray} />
          <Text style={styles.backText}>Mis procesos</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.pblue} />
        </View>
      ) : errorMessage ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{errorMessage}</Text>

          <Pressable onPress={retry}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : process ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={isLawyer ? () => void handleChanged() : refresh}
              tintColor={Colors.pblue}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              Expediente {process.caseFileNumber}
            </Text>

            <Text style={styles.subtitle}>
              Juicio sucesorio {typeLabels[process.type].toLowerCase()}
            </Text>
          </View>

          {isLawyer && (
            <ProcessActions process={process} onChanged={handleChanged} />
          )}
          {isLawyer && (
            <ProcessClientsPanel processId={process.id} revision={revision} />
          )}

          <View style={styles.informationCard}>
            <Text style={styles.cardTitle}>Información general</Text>

            <Text style={styles.label}>Juzgado</Text>
            <Text style={styles.value}>{process.courtNumber}</Text>

            <Text style={styles.label}>Persona fallecida</Text>
            <Text style={styles.value}>
              {process.defendant.name} {process.defendant.lastname}
            </Text>

            <Text style={styles.label}>Estado del proceso</Text>
            <Text style={styles.value}>{statusLabels[process.status]}</Text>
          </View>

          <View style={styles.stagesSection}>
            <Text style={styles.sectionTitle}>Etapas del proceso</Text>

            <Text style={styles.sectionDescription}>
              Seleccione una etapa para consultar sus detalles y las subetapas
              registradas.
            </Text>

            {process.stages.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Todavía no hay etapas disponibles para este proceso.
                </Text>
              </View>
            ) : (
              <View style={styles.stagesList}>
                {process.stages.map((stage, index) =>
                  isLawyer ? (
                    <ManagedStageAccordion
                      key={stage.id}
                      item={stage}
                      stage={stage}
                      nextStage={process.stages[index + 1]}
                      processStatus={process.status}
                      revision={revision}
                      onChanged={handleChanged}
                    />
                  ) : (
                    <StageAccordion
                      key={stage.id}
                      stage={stage}
                      folders={folders}
                      openingFileId={openingFileId}
                      onOpenFile={openFile}
                    />
                  ),
                )}
              </View>
            )}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pwhite,
  },
  navigation: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.pborder,
    backgroundColor: Colors.white,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    color: Colors.pgray,
    fontWeight: "500",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 18,
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    color: Colors.error,
  },
  retryText: {
    fontSize: 16,
    color: Colors.pblue,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 22,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    color: Colors.pgray,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.sgray,
  },
  informationCard: {
    padding: 18,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 14,
    gap: 7,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.pgray,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: Colors.sgray,
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: Colors.pgray,
  },
  stagesSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: Colors.pgray,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.sgray,
    lineHeight: 21,
  },
  stagesList: {
    gap: 12,
  },
  emptyCard: {
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.pborder,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.sgray,
    fontSize: 14,
    lineHeight: 22,
  },
});
