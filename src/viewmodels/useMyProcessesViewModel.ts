import { isAxiosError } from "axios";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { ClientProcess } from "../interfaces/process.interface";
import { getMyProcesses } from "../services/process.service";
import { useAuth } from "../contexts/AuthContext";
import type { ManagedProcess } from "../interfaces/management.interface";
import { getManagedProcesses } from "../services/management.service";

export const useMyProcessesViewModel = () => {
  const { user } = useAuth();
  const isLawyer = !!user?.roles.includes("lawyer");
  const [processes, setProcesses] = useState<
    (ClientProcess | ManagedProcess)[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadProcesses = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage("");

      try {
        const data = isLawyer
          ? await getManagedProcesses()
          : await getMyProcesses();

        setProcesses(data);
      } catch (error: unknown) {
        if (isAxiosError(error) && !error.response) {
          setErrorMessage("No fue posible conectar con el servidor.");
        } else {
          console.log(error);
          setErrorMessage("No fue posible cargar sus procesos judiciales.");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isLawyer],
  );

  useFocusEffect(
    useCallback(() => {
      void loadProcesses();
    }, [loadProcesses]),
  );

  return {
    processes,
    isLoading,
    isRefreshing,
    errorMessage,
    refresh: () => void loadProcesses(true),
    retry: () => void loadProcesses(),
    reload: () => loadProcesses(true),
    isLawyer,
  };
};
