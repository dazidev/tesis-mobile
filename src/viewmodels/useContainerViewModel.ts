import { useCallback, useEffect, useRef, useState } from "react";
import type { ContainerDetail } from "../interfaces/management.interface";
import {
  getContainer,
  getOperationError,
} from "../services/management.service";

export function useContainerViewModel(
  id: string,
  substage: boolean,
  enabled: boolean,
  revision: number,
) {
  const [detail, setDetail] = useState<ContainerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  const reload = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError("");
    try {
      const data = await getContainer(id, substage);
      if (current === request.current) setDetail(data);
    } catch (error) {
      if (current === request.current) setError(getOperationError(error));
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [id, substage]);

  useEffect(() => {
    // La consulta remota comparte el estado de carga con el reintento manual.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (enabled) void reload();
    const invalidate = () => {
      request.current++;
    };
    return invalidate;
  }, [enabled, revision, reload]);

  return { detail, loading, error, reload };
}
