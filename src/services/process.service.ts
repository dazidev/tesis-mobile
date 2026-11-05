import { api } from "../infrastructure/api";
import {
  ClientDigitalFolder,
  ClientProcess,
  ClientProcessDetail,
} from "../interfaces/process.interface";

export const getMyProcesses = async (): Promise<ClientProcess[]> => {
  const response = await api.get<ClientProcess[]>("/mobile/processes");

  return response.data;
};

export const getMyProcessById = async (
  processId: string,
): Promise<ClientProcessDetail> => {
  const response = await api.get<ClientProcessDetail>(
    `/mobile/processes/${encodeURIComponent(processId)}`,
  );

  return response.data;
};

export const getMyProcessDocuments = async (
  processId: string,
): Promise<ClientDigitalFolder[]> => {
  const response = await api.get<ClientDigitalFolder[]>(
    `/mobile/processes/${encodeURIComponent(processId)}/documents`,
  );

  return response.data;
};
