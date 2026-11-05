import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import { previewClientPdf } from "@/services/document.service";
import { Alert } from "react-native";
import {
  ClientDigitalFile,
  ClientDigitalFolder,
  ClientProcessDetail,
} from "../interfaces/process.interface";
import {
  getMyProcessById,
  getMyProcessDocuments,
} from "../services/process.service";

export const useProcessDetailViewModel = (processId: string) => {
  const [process, setProcess] = useState<ClientProcessDetail | null>(null);
  const [folders, setFolders] = useState<ClientDigitalFolder[]>([]);

  const [openingFileId, setOpeningFileId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const requestIdRef = useRef(0);

  const loadProcess = useCallback(
    async (refresh = false) => {
      const requestId = ++requestIdRef.current;

      if (!processId) {
        setErrorMessage("Identificador de proceso inválido.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
        setProcess(null);
        setFolders([]);
      }

      setErrorMessage("");

      try {
        const [data, documentFolders] = await Promise.all([
          getMyProcessById(processId),
          getMyProcessDocuments(processId),
        ]);

        if (requestId === requestIdRef.current) {
          setProcess(data);
          setFolders(documentFolders);
        }
      } catch (error: unknown) {
        if (requestId !== requestIdRef.current) return;

        if (isAxiosError(error)) {
          if (error.response?.status === 404) {
            setErrorMessage(
              "El expediente no existe o ya no tiene acceso a él.",
            );
            return;
          }

          if (!error.response) {
            setErrorMessage("No fue posible conectar con el servidor.");
            return;
          }
        }

        setErrorMessage("No fue posible cargar la información del expediente.");
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [processId],
  );

  const openFile = async (file: ClientDigitalFile) => {
    if (openingFileId !== null) return;

    try {
      setOpeningFileId(file.id);

      await previewClientPdf(file.id, file.name);
    } catch (error: unknown) {
      Alert.alert(
        "No fue posible abrir el documento",
        error instanceof Error
          ? error.message
          : "Ocurrió un error al visualizar el PDF.",
      );
    } finally {
      setOpeningFileId(null);
    }
  };

  useEffect(() => {
    void loadProcess();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadProcess]);

  return {
    process,
    isLoading,
    isRefreshing,
    errorMessage,
    refresh: () => void loadProcess(true),
    retry: () => void loadProcess(),
    folders,
    openingFileId,
    openFile,
  };
};
