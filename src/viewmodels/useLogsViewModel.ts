import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import type {
  FindLogsRequest,
  LogFilters,
  PaginatedLogs,
} from "../interfaces/log.interface";
import { getLogFilters, getLogs } from "../services/log.service";
import { getOperationError } from "../services/management.service";

export function useLogsViewModel() {
  const [query, setQuery] = useState<FindLogsRequest>({ page: 1, limit: 20 });
  const [data, setData] = useState<PaginatedLogs | null>(null);
  const [filters, setFilters] = useState<LogFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filtersError, setFiltersError] = useState("");
  const [filtersLoading, setFiltersLoading] = useState(true);
  const requestId = useRef(0);
  const filtersRequestId = useRef(0);

  const load = useCallback(async (next: FindLogsRequest, refresh = false) => {
    const current = ++requestId.current;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const result = await getLogs(next);
      if (current === requestId.current) setData(result);
    } catch (error) {
      if (current === requestId.current) setError(getOperationError(error));
    } finally {
      if (current === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const loadFilters = useCallback(async () => {
    const current = ++filtersRequestId.current;
    setFiltersLoading(true);
    setFiltersError("");
    try {
      const result = await getLogFilters();
      if (current === filtersRequestId.current) setFilters(result);
    } catch (error) {
      if (current === filtersRequestId.current)
        setFiltersError(getOperationError(error));
    } finally {
      if (current === filtersRequestId.current) setFiltersLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load(query);
      return () => {
        requestId.current++;
      };
    }, [load, query]),
  );
  useFocusEffect(
    useCallback(() => {
      void loadFilters();
      return () => {
        filtersRequestId.current++;
      };
    }, [loadFilters]),
  );

  return {
    query,
    data,
    filters,
    loading,
    refreshing,
    error,
    filtersError,
    filtersLoading,
    hasActiveFilters: !!(
      query.entity ||
      query.action ||
      query.userSearch ||
      query.from ||
      query.to
    ),
    retry: () => void load(query),
    refresh: () => void load(query, true),
    retryFilters: () => void loadFilters(),
    applyFilters: (next: FindLogsRequest) => {
      setLoading(true);
      setQuery({ ...next, page: 1, limit: 20 });
    },
    changePage: (page: number) => {
      if (
        loading ||
        refreshing ||
        !data ||
        page < 1 ||
        page > data.totalPages ||
        page === data.page
      )
        return;
      setLoading(true);
      setQuery((previous) => ({ ...previous, page }));
    },
  };
}
