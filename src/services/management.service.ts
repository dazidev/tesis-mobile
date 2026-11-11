import { isAxiosError } from "axios";
import { api } from "../infrastructure/api";
import type {
  ContainerDetail,
  CreateProcessRequest,
  ManagedProcess,
} from "../interfaces/management.interface";
import type { ClientProcessDetail } from "../interfaces/process.interface";

export const getOperationError = (error: unknown): string => {
  if (isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === "string")
    )
      return message.join("\n");
    if (!error.response)
      return "No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.";
  }
  return error instanceof Error
    ? error.message
    : "No fue posible completar la operación.";
};

export const getManagedProcesses = async () =>
  (await api.get<ManagedProcess[]>("/processes")).data.filter((process) =>
    ["created", "opened", "closed"].includes(process.status),
  );
export const getManagedProcess = async (id: string) =>
  (await api.get<ClientProcessDetail>(`/processes/${id}`)).data;
export const createProcess = async (data: CreateProcessRequest) => {
  await api.post("/processes", data);
};
export const initProcess = async (id: string) => {
  await api.post(`/processes/${id}/init`);
};
export const deactivateProcess = async (id: string, reason: string) => {
  await api.patch(`/processes/${id}/deactivate`, { reason });
};

export const getContainer = async (id: string, substage: boolean) =>
  (
    await api.get<ContainerDetail>(
      `/processes/${substage ? "substage" : "stage"}/${id}`,
    )
  ).data;

export const createSubstage = async (
  stageId: string,
  data: { name: string; description: string; parentSubstageId?: string },
) => {
  await api.post(`/processes/stage/${stageId}`, data);
};
export const createIntermediateStage = async (
  stageId: string,
  data: { name: string; description: string },
) => {
  await api.post(`/processes/stage/${stageId}/intermediate`, data);
};
export const deactivateContainer = async (
  id: string,
  substage: boolean,
  reason: string,
) => {
  await api.patch(
    `/processes/${substage ? "substage" : "stage"}/${id}/deactivate`,
    { reason },
  );
};
export const closeContainer = async (id: string, substage: boolean) => {
  await api.patch(`/processes/${substage ? "substage" : "stage"}/${id}/close`);
};
export const advanceStage = async (id: string) => {
  await api.patch(`/processes/stage/${id}/advance`);
};
export const finalizeProcess = async (id: string) => {
  await api.patch(`/processes/stage/${id}/finalize-process`);
};
