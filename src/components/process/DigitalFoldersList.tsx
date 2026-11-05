import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ClientDigitalFile,
  ClientDigitalFolder,
} from "../../interfaces/process.interface";
import { Colors } from "../../theme/colors";

interface Props {
  folders: ClientDigitalFolder[];
  openingFileId: string | null;
  onOpenFile: (file: ClientDigitalFile) => Promise<void>;
}

interface FolderProps extends Omit<Props, "folders"> {
  folder: ClientDigitalFolder;
}

function FolderItem({ folder, openingFileId, onOpenFile }: FolderProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.folder}>
      <Pressable
        style={styles.folderHeader}
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
      >
        <Ionicons
          name={expanded ? "folder-open-outline" : "folder-outline"}
          size={20}
          color={Colors.pblue}
        />

        <View style={styles.folderTitleContainer}>
          <Text style={styles.folderTitle}>{folder.name}</Text>

          <Text style={styles.count}>
            {folder.digitalFiles.length} documentos
          </Text>
        </View>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={17}
          color={Colors.sgray}
        />
      </Pressable>

      {expanded && (
        <View style={styles.folderContent}>
          {!!folder.description && (
            <Text style={styles.description}>{folder.description}</Text>
          )}

          {folder.digitalFiles.length === 0 ? (
            <Text style={styles.emptyText}>
              Esta carpeta no contiene documentos.
            </Text>
          ) : (
            folder.digitalFiles.map((file) => (
              <Pressable
                key={file.id}
                disabled={openingFileId !== null}
                onPress={() => void onOpenFile(file)}
                style={styles.fileRow}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={Colors.pblue}
                />

                <View style={styles.fileInformation}>
                  <Text style={styles.fileName}>{file.name}</Text>

                  {!!file.description && (
                    <Text style={styles.description}>{file.description}</Text>
                  )}

                  <Text style={styles.fileSize}>
                    {(file.size / 1024).toFixed(0)} KB
                  </Text>
                </View>

                {openingFileId === file.id ? (
                  <ActivityIndicator size="small" color={Colors.pblue} />
                ) : (
                  <Ionicons name="eye-outline" size={20} color={Colors.pblue} />
                )}
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

export function DigitalFoldersList({
  folders,
  openingFileId,
  onOpenFile,
}: Props) {
  if (folders.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Documentos</Text>

      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          openingFileId={openingFileId}
          onOpenFile={onOpenFile}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.pgray,
  },
  folder: {
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 10,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  folderHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 9,
    backgroundColor: Colors.pwhite,
  },
  folderTitleContainer: {
    flex: 1,
  },
  folderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.pgray,
  },
  count: {
    fontSize: 12,
    color: Colors.sgray,
    marginTop: 3,
  },
  folderContent: {
    padding: 12,
    gap: 12,
  },
  description: {
    fontSize: 12,
    color: Colors.sgray,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.sgray,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.pborder,
  },
  fileInformation: {
    flex: 1,
    gap: 3,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.pgray,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.sgray,
  },
});
