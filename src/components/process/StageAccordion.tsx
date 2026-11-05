import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ClientDigitalFile,
  ClientDigitalFolder,
  ClientStage,
  ClientSubstage,
  StageStatus,
  SubstageStatus,
} from "../../interfaces/process.interface";
import { Colors } from "../../theme/colors";
import { DigitalFoldersList } from "./DigitalFoldersList";

const stageStatusLabels: Record<StageStatus, string> = {
  created: "Pendiente",
  opened: "En curso",
  closed: "Finalizada",
};

const substageStatusLabels: Record<SubstageStatus, string> = {
  opened: "En curso",
  closed: "Finalizada",
};

interface DocumentProps {
  folders: ClientDigitalFolder[];
  openingFileId: string | null;
  onOpenFile: (file: ClientDigitalFile) => Promise<void>;
}

interface SubstageProps extends DocumentProps {
  substage: ClientSubstage;
}

function SubstageAccordion({
  substage,
  folders,
  openingFileId,
  onOpenFile,
}: SubstageProps) {
  const [expanded, setExpanded] = useState(false);

  const hasChildren = substage.childrenSubstages.length > 0;

  return (
    <View style={styles.substageContainer}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? "Contraer" : "Expandir"} ${substage.name}`}
        style={styles.substageHeader}
      >
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={18}
          color={Colors.pblue}
        />

        <View style={styles.nameContainer}>
          <Text style={styles.substageName}>{substage.name}</Text>

          <Text style={styles.smallStatus}>
            {substageStatusLabels[substage.status]}
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.substageContent}>
          {substage.description.trim() ? (
            <Text style={styles.description}>{substage.description}</Text>
          ) : null}

          <DigitalFoldersList
            folders={folders.filter(
              (folder) => folder.substageId === substage.id,
            )}
            openingFileId={openingFileId}
            onOpenFile={onOpenFile}
          />

          {hasChildren && (
            <View style={styles.childrenContainer}>
              {substage.childrenSubstages.map((child) => (
                <SubstageAccordion
                  key={child.id}
                  substage={child}
                  folders={folders}
                  openingFileId={openingFileId}
                  onOpenFile={onOpenFile}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

interface Props extends DocumentProps {
  stage: ClientStage;
}

export function StageAccordion({
  stage,
  folders,
  openingFileId,
  onOpenFile,
}: Props) {
  const [expanded, setExpanded] = useState(stage.status === "opened");

  return (
    <View style={styles.stageContainer}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? "Contraer" : "Expandir"} etapa ${stage.name}`}
        style={styles.stageHeader}
      >
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={20}
          color={Colors.pblue}
        />

        <View style={styles.nameContainer}>
          <Text style={styles.stageName}>{stage.name}</Text>

          <Text style={styles.stageStatus}>
            {stageStatusLabels[stage.status]}
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.stageContent}>
          {stage.description.trim() ? (
            <Text style={styles.description}>{stage.description}</Text>
          ) : null}

          <DigitalFoldersList
            folders={folders.filter(
              (folder) =>
                folder.stageId === stage.id && folder.substageId === null,
            )}
            openingFileId={openingFileId}
            onOpenFile={onOpenFile}
          />

          {stage.childrenSubstages.length > 0 && (
            <View style={styles.substagesList}>
              {stage.childrenSubstages.map((substage) => (
                <SubstageAccordion
                  key={substage.id}
                  substage={substage}
                  folders={folders}
                  openingFileId={openingFileId}
                  onOpenFile={onOpenFile}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stageContainer: {
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 12,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  stageHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  stageName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.pgray,
  },
  stageStatus: {
    fontSize: 13,
    marginTop: 4,
    color: Colors.sgray,
  },
  nameContainer: {
    flex: 1,
  },
  stageContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  substagesList: {
    gap: 10,
    paddingTop: 4,
  },
  substageContainer: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.pborder,
    paddingLeft: 12,
  },
  substageHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    gap: 8,
  },
  substageName: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.pgray,
  },
  smallStatus: {
    fontSize: 12,
    color: Colors.sgray,
    marginTop: 3,
  },
  substageContent: {
    paddingBottom: 8,
    gap: 8,
  },
  childrenContainer: {
    gap: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.sgray,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.sgray,
  },
});
