import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ManagedFolder } from "../../interfaces/management.interface";
import type { ClientDigitalFile } from "../../interfaces/process.interface";
import { previewClientPdf } from "../../services/document.service";
import {
  deactivateFolder,
  deleteFile,
  getFolder,
  updateFile,
  updateFolder,
  uploadFile,
} from "../../services/folder.service";
import { getOperationError } from "../../services/management.service";
import { Colors } from "../../theme/colors";
import {
  fileMetadataFields,
  nameDescriptionFields,
  reasonField,
  useManagementActions,
} from "../../viewmodels/useManagementActions";
import { ActionButton } from "../common/ActionButton";
import { OperationFormModal } from "../common/OperationFormModal";

interface Props {
  folder: {
    id: string;
    name: string;
    description: string;
    _count: { digitalFiles: number };
  };
  editable: boolean;
  revision: number;
  onChanged: () => Promise<void>;
}

export function ManagedFolderItem({
  folder,
  editable,
  revision,
  onChanged,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<ManagedFolder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState<string | null>(null);
  const request = useRef(0);
  const openLock = useRef(false);
  const reload = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError("");
    try {
      const result = await getFolder(folder.id);
      if (current === request.current) setData(result);
    } catch (error) {
      if (current === request.current) setError(getOperationError(error));
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [folder.id]);
  useEffect(() => {
    // La consulta remota comparte el estado de carga con el reintento manual.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (expanded) void reload();
    const invalidate = () => {
      request.current++;
    };
    return invalidate;
  }, [expanded, revision, reload]);

  const actions = useManagementActions(async () => {
    await reload();
    await onChanged();
  });

  const pickPdf = async () => {
    if (openLock.current) return;
    openLock.current = true;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset.size !== undefined && asset.size > 10 * 1024 * 1024)
        throw new Error("El PDF no puede superar los 10 MB.");
      actions.openForm({
        title: "Subir PDF",
        description: `${asset.name} · Máximo 10 MB`,
        fields: fileMetadataFields,
        initial: { name: asset.name.replace(/\.pdf$/i, ""), description: "" },
        submit: (values) =>
          uploadFile(folder.id, asset, {
            name: values.name,
            description: values.description,
          }),
      });
    } catch (error) {
      Alert.alert(
        "No fue posible seleccionar el PDF",
        getOperationError(error),
      );
    } finally {
      openLock.current = false;
    }
  };

  const preview = async (file: ClientDigitalFile) => {
    if (openLock.current) return;
    openLock.current = true;
    setOpening(file.id);
    try {
      await previewClientPdf(file.id, file.name);
    } catch (error) {
      Alert.alert("No fue posible abrir el PDF", getOperationError(error));
    } finally {
      openLock.current = false;
      setOpening(null);
    }
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(!expanded)}
      >
        <Ionicons
          name={expanded ? "folder-open-outline" : "folder-outline"}
          size={22}
          color={Colors.pblue}
        />
        <View style={styles.information}>
          <Text style={styles.title}>{folder.name}</Text>
          <Text style={styles.secondary}>
            {folder._count.digitalFiles} documentos
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.pblue}
        />
      </Pressable>
      {expanded && (
        <View style={styles.content}>
          {!!folder.description && (
            <Text style={styles.secondary}>{folder.description}</Text>
          )}
          {editable && (
            <View style={styles.actions}>
              <ActionButton
                label="Subir PDF"
                icon="cloud-upload-outline"
                disabled={actions.busy}
                onPress={() => void pickPdf()}
              />
              <ActionButton
                label="Editar carpeta"
                icon="create-outline"
                disabled={actions.busy}
                onPress={() =>
                  actions.openForm({
                    title: "Editar carpeta",
                    fields: nameDescriptionFields,
                    initial: {
                      name: folder.name,
                      description: folder.description,
                    },
                    submit: (values) =>
                      updateFolder(folder.id, {
                        name: values.name,
                        description: values.description,
                      }),
                  })
                }
              />
              <ActionButton
                label="Eliminar carpeta"
                danger
                icon="trash-outline"
                disabled={actions.busy}
                onPress={() =>
                  actions.openForm({
                    title: "Eliminar carpeta",
                    description:
                      "Se eliminará esta carpeta y sus documentos conforme a la política de conservación vigente.",
                    fields: [reasonField],
                    submit: (values) =>
                      deactivateFolder(folder.id, values.reason),
                  })
                }
              />
            </View>
          )}
          {loading ? (
            <ActivityIndicator color={Colors.pblue} />
          ) : error ? (
            <>
              <Text style={styles.error}>{error}</Text>
              <ActionButton label="Reintentar" onPress={() => void reload()} />
            </>
          ) : (
            data && (
              <>
                {!data.digitalFiles.length && (
                  <Text style={styles.secondary}>
                    Esta carpeta no contiene documentos.
                  </Text>
                )}
                {data.digitalFiles.map((file) => (
                  <View key={file.id} style={styles.file}>
                    <Text style={styles.title}>{file.name}</Text>
                    {!!file.description && (
                      <Text style={styles.secondary}>{file.description}</Text>
                    )}
                    <Text style={styles.secondary}>
                      {new Date(file.createdAt).toLocaleDateString("es-MX")}
                    </Text>
                    <View style={styles.actions}>
                      <ActionButton
                        label={opening === file.id ? "Abriendo…" : "Ver PDF"}
                        icon="eye-outline"
                        disabled={opening !== null || actions.busy}
                        onPress={() => void preview(file)}
                      />
                      {editable && (
                        <>
                          <ActionButton
                            label="Editar PDF"
                            icon="create-outline"
                            disabled={actions.busy}
                            onPress={() =>
                              actions.openForm({
                                title: "Editar PDF",
                                fields: fileMetadataFields,
                                initial: {
                                  name: file.name,
                                  description: file.description,
                                },
                                submit: (values) =>
                                  updateFile(file.id, {
                                    name: values.name,
                                    description: values.description,
                                  }),
                              })
                            }
                          />
                          <ActionButton
                            label="Eliminar PDF"
                            danger
                            icon="trash-outline"
                            disabled={actions.busy}
                            onPress={() =>
                              actions.confirm(
                                "Eliminar PDF",
                                "Los PDF con menos de 24 horas se eliminan físicamente. Los anteriores se desactivan y conservan para auditoría.",
                                () => deleteFile(file.id),
                                true,
                              )
                            }
                          />
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )
          )}
        </View>
      )}
      <OperationFormModal actions={actions} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 10,
    overflow: "hidden",
  },
  header: {
    padding: 12,
    backgroundColor: Colors.pwhite,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 60,
  },
  information: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: "600", color: Colors.pgray },
  secondary: { fontSize: 13, color: Colors.sgray, lineHeight: 20 },
  content: { padding: 12, gap: 12 },
  file: {
    borderTopWidth: 1,
    borderColor: Colors.pborder,
    paddingTop: 12,
    gap: 8,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  error: { color: Colors.error, lineHeight: 20 },
});
