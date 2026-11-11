import { useCallback, useEffect, useState } from "react";
import type { ProcessClients } from "../interfaces/management.interface";
import { getProcessClients } from "../services/client.service";
import { getOperationError } from "../services/management.service";

export function useProcessClientsViewModel(
  processId: string,
  revision: number,
) {
  const [data, setData] = useState<ProcessClients | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getProcessClients(processId));
    } catch (error) {
      setError(getOperationError(error));
    } finally {
      setLoading(false);
    }
  }, [processId]);
  useEffect(() => {
    // La consulta remota comparte el estado de carga con el reintento manual.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload, revision]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  return { data, error, loading, reload, now };
}
