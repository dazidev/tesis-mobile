import { useEffect, useState } from "react";
import type { AuthUser } from "../interfaces/auth.interface";
import { getOperationError } from "../services/management.service";
import { getActiveLawyers } from "../services/user.service";

export function useProcessManagerViewModel(
  value: string,
  onChange: (value: string) => void,
) {
  const [visible, setVisible] = useState(false);
  const [lawyers, setLawyers] = useState<AuthUser[]>([]);
  const [draftId, setDraftId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let current = true;
    getActiveLawyers()
      .then((items) => {
        if (current) setLawyers(items);
      })
      .catch((error) => {
        if (current) setError(getOperationError(error));
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [visible, attempt]);

  const search = query.trim().toLocaleLowerCase("es-MX");
  const filteredLawyers = lawyers.filter((lawyer) =>
    `${lawyer.name} ${lawyer.lastname} ${lawyer.email}`
      .toLocaleLowerCase("es-MX")
      .includes(search),
  );
  const selectedLawyer = lawyers.find((lawyer) => lawyer.id === value);
  const canConfirm =
    !draftId ||
    (!loading && !error && lawyers.some((lawyer) => lawyer.id === draftId));

  return {
    visible,
    draftId,
    setDraftId,
    query,
    setQuery,
    loading,
    error,
    filteredLawyers,
    selectedLawyer,
    canConfirm,
    retry: () => {
      setLoading(true);
      setError("");
      setAttempt((prev) => prev + 1);
    },
    open: () => {
      setDraftId(value);
      setQuery("");
      setLoading(true);
      setError("");
      setVisible(true);
    },
    close: () => setVisible(false),
    confirm: () => {
      if (!canConfirm) return;
      onChange(draftId);
      setVisible(false);
    },
  };
}
