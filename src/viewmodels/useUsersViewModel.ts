import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { AuthUser } from "../interfaces/auth.interface";
import { getUsers } from "../services/user.service";
import { getOperationError } from "../services/management.service";

export function useUsersViewModel() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage("");
    try {
      setUsers(await getUsers());
    } catch (error) {
      setErrorMessage(getOperationError(error));
      throw error;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load().catch(() => undefined);
    }, [load]),
  );

  const search = query.trim().toLocaleLowerCase("es-MX");
  return {
    users: users.filter((user) =>
      `${user.name} ${user.lastname} ${user.email}`
        .toLocaleLowerCase("es-MX")
        .includes(search),
    ),
    query,
    setQuery,
    isLoading,
    isRefreshing,
    errorMessage,
    retry: () => void load().catch(() => undefined),
    refresh: () => void load(true).catch(() => undefined),
    reload: () => load(true),
  };
}
