import { api } from "../infrastructure/api";
import type { AuthUser, UserRole } from "../interfaces/auth.interface";
import type {
  UserDeactivationRequest,
  UserUpdateRequest,
} from "../interfaces/user.interface";

export const getUsers = async () => (await api.get<AuthUser[]>("/user")).data;

export const updateUser = async (id: string, data: UserUpdateRequest) =>
  (
    await api.patch<AuthUser>(`/admin/users/${id}`, {
      ...data,
      name: data.name.trim(),
      lastname: data.lastname.trim(),
      email: data.email.trim().toLowerCase(),
    })
  ).data;

export const deactivateUser = async (
  id: string,
  data: UserDeactivationRequest,
) => {
  await api.patch(`/admin/users/${id}/deactivate`, data);
};

export const inviteUser = async (email: string, role: UserRole) => {
  await api.post("/admin/user-invitation", {
    toEmail: email.trim().toLowerCase(),
    role,
  });
};

export const getActiveLawyers = async (): Promise<AuthUser[]> => {
  const { data } = await api.get<AuthUser[]>("/user", {
    params: { role: "lawyer" },
  });
  return data.filter(
    (user) => user.status === "active" && user.roles.includes("lawyer"),
  );
};
