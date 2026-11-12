import { api } from "../infrastructure/api";
import type { AuthUser } from "../interfaces/auth.interface";

export const getActiveLawyers = async (): Promise<AuthUser[]> => {
  const { data } = await api.get<AuthUser[]>("/user", {
    params: { role: "lawyer" },
  });
  return data.filter(
    (user) => user.status === "active" && user.roles.includes("lawyer"),
  );
};
