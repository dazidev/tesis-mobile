import { api } from "../infrastructure/api";

export const createTask = async (
  stageId: string,
  data: { description: string; dueDate: string; substageId?: string },
) => {
  await api.post(`/task/${stageId}`, data);
};
export const updateTask = async (
  id: string,
  data: { description: string; dueDate: string },
) => {
  await api.patch(`/task/${id}`, data);
};
export const completeTask = async (id: string, completed: boolean) => {
  await api.patch(`/task/${id}/completion`, { completed });
};
export const deactivateTask = async (id: string, reason: string) => {
  await api.patch(`/task/${id}/deactivate`, { reason });
};
