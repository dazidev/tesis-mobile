import type { UserRole, UserStatus } from "./auth.interface";

export const userRoleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  lawyer: "Abogado",
  client: "Cliente",
};

export const userStatusLabels: Record<UserStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  suspended: "Suspendido",
};

export interface UserUpdateRequest {
  name: string;
  lastname: string;
  email: string;
  roles: UserRole[];
}

export interface UserDeactivationRequest {
  type: "inactive" | "suspended";
  reason: string;
}
