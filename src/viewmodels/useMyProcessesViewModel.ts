import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

import { ClientProcess } from "../interfaces/process.interface";
import { getMyProcesses } from "../services/process.service";

export const useMyProcessesViewModel = () => {
  const [processes, setProcesses] = useState<ClientProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadProcesses = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage("");

    try {
      const data = await getMyProcesses();

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
  }, []);

  useEffect(() => {
    void loadProcesses();
  }, [loadProcesses]);

  return {
    processes,
    isLoading,
    isRefreshing,
    errorMessage,
    refresh: () => void loadProcesses(true),
    retry: () => void loadProcesses(),
  };
};
