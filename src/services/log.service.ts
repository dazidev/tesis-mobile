import { api } from "../infrastructure/api";
import type {
  FindLogsRequest,
  LogFilters,
  PaginatedLogs,
} from "../interfaces/log.interface";

export const getLogs = async (params: FindLogsRequest) =>
  (await api.get<PaginatedLogs>("/logs", { params })).data;
export const getLogFilters = async () =>
  (await api.get<LogFilters>("/logs/filters")).data;
