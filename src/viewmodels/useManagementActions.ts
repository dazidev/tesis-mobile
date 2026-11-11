import { useRef, useState } from "react";
import { Alert } from "react-native";
import { getOperationError } from "../services/management.service";

export interface FormField {
  key: string;
  label: string;
  type?: "text" | "email" | "multiline" | "date" | "datetime" | "select";
  optional?: boolean;
  minLength?: number;
  maxLength?: number;
  options?: { value: string; label: string }[];
}

export interface OperationForm {
  title: string;
  description?: string;
  submitLabel?: string;
  fields: FormField[];
  initial?: Record<string, string>;
  submit: (values: Record<string, string>) => Promise<void>;
}

export function useManagementActions(onChanged: () => Promise<void>) {
  const [form, setForm] = useState<OperationForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);

  const run = async (operation: () => Promise<void>, inForm = false) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await operation();
      setForm(null);
      // Reload separately: a failed read must not invite repeating a successful mutation.
      try {
        await onChanged();
      } catch {
        Alert.alert(
          "Cambio guardado",
          "No fue posible actualizar la vista. Deslice para refrescar antes de continuar.",
        );
      }
    } catch (error) {
      if (inForm) setError(getOperationError(error));
      else
        Alert.alert(
          "No fue posible completar la operación",
          getOperationError(error),
        );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return {
    busy,
    form,
    error,
    openForm: (next: OperationForm) => {
      if (!lock.current) {
        setError("");
        setForm(next);
      }
    },
    closeForm: () => {
      if (!lock.current) setForm(null);
    },
    submitForm: (values: Record<string, string>) =>
      form ? run(() => form.submit(values), true) : Promise.resolve(),
    confirm: (
      title: string,
      description: string,
      operation: () => Promise<void>,
      destructive = false,
    ) => {
      if (lock.current) return;
      Alert.alert(title, description, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: destructive ? "destructive" : "default",
          onPress: () => void run(operation),
        },
      ]);
    },
  };
}

export type ManagementActions = ReturnType<typeof useManagementActions>;

export const nameDescriptionFields: FormField[] = [
  { key: "name", label: "Nombre", minLength: 2 },
  {
    key: "description",
    label: "Descripción",
    type: "multiline",
    minLength: 2,
  },
];

export const fileMetadataFields: FormField[] = nameDescriptionFields.map(
  (field) => ({
    ...field,
    maxLength: field.key === "name" ? 150 : 500,
  }),
);

export const reasonField: FormField = {
  key: "reason",
  label: "Motivo de eliminación",
  type: "multiline",
  minLength: 10,
  maxLength: 250,
};
