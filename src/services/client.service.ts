import { api } from "../infrastructure/api";
import type { ProcessClients } from "../interfaces/management.interface";

export const getProcessClients = async (id: string) =>
  (await api.get<ProcessClients>(`/processes/${id}/clients`)).data;
export const linkProcessClient = async (id: string, email: string) => {
  await api.post(`/processes/${id}/clients`, {
    email: email.trim().toLowerCase(),
  });
};
export const unlinkProcessClient = async (id: string, clientId: string) => {
  await api.delete(`/processes/${id}/clients/${clientId}`);
};
export const inviteProcessClient = async (id: string, email: string) => {
  await api.post("/admin/user-invitation", {
    toEmail: email.trim().toLowerCase(),
    role: "client",
    processId: id,
  });
};
export const cancelInvitation = async (id: string) => {
  await api.patch(`/admin/user-invitations/${id}/cancel`);
};
export const resendInvitation = async (id: string) => {
  await api.post(`/admin/user-invitations/${id}/resend`);
};
