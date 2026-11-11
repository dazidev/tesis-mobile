import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import type {
  FormField,
  ManagementActions,
} from "../../viewmodels/useManagementActions";
import { ActionButton } from "./ActionButton";
import { CustomButton } from "./CustomButton";

function DateField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}) {
  const [mode, setMode] = useState<"date" | "time" | null>(null);
  const date = value ? new Date(value) : new Date();
  return (
    <View style={styles.dateContainer}>
      <ActionButton
        icon="calendar-outline"
        label={value ? date.toLocaleDateString("es-MX") : "Seleccionar fecha"}
        onPress={() => setMode(mode === "date" ? null : "date")}
      />
      {field.type === "datetime" && (
        <ActionButton
          icon="time-outline"
          label={
            value
              ? date.toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Seleccionar hora"
          }
          onPress={() => setMode(mode === "time" ? null : "time")}
        />
      )}
      {mode && (
        <>
          <DateTimePicker
            value={date}
            mode={mode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selected) => {
              if (Platform.OS !== "ios") setMode(null);
              if (selected) onChange(selected.toISOString());
            }}
          />
          {Platform.OS === "ios" && (
            <ActionButton
              label="Usar selección"
              onPress={() => {
                onChange(date.toISOString());
                setMode(null);
              }}
            />
          )}
        </>
      )}
    </View>
  );
}

function FormContent({ actions }: { actions: ManagementActions }) {
  const form = actions.form!;
  const [values, setValues] = useState<Record<string, string>>(
    form.initial ?? {},
  );
  const [validation, setValidation] = useState("");
  const change = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));
  const submit = () => {
    for (const field of form.fields) {
      const value = (values[field.key] ?? "").trim();
      if (!value && !field.optional) {
        setValidation(`Complete el campo «${field.label}».`);
        return;
      }
      if (value && field.minLength && value.length < field.minLength) {
        setValidation(
          `«${field.label}» requiere al menos ${field.minLength} caracteres.`,
        );
        return;
      }
      if (
        field.type === "email" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        setValidation("Ingrese un correo electrónico válido.");
        return;
      }
    }
    setValidation("");
    void actions.submitForm(
      Object.fromEntries(
        form.fields.map((field) => [
          field.key,
          (values[field.key] ?? "").trim(),
        ]),
      ),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{form.title}</Text>
          <ActionButton
            label="Cancelar"
            onPress={actions.closeForm}
            disabled={actions.busy}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {!!form.description && (
            <Text style={styles.description}>{form.description}</Text>
          )}
          {form.fields.map((field) => (
            <View key={field.key} style={styles.field}>
              <Text style={styles.label}>
                {field.label}
                {field.optional ? " (opcional)" : ""}
              </Text>
              {field.type === "select" ? (
                <View style={styles.options}>
                  {field.options?.map((option) => (
                    <ActionButton
                      key={option.value}
                      label={`${values[field.key] === option.value ? "✓ " : ""}${option.label}`}
                      disabled={actions.busy}
                      onPress={() => change(field.key, option.value)}
                    />
                  ))}
                </View>
              ) : field.type === "date" || field.type === "datetime" ? (
                <DateField
                  field={field}
                  value={values[field.key] ?? ""}
                  onChange={(value) => change(field.key, value)}
                />
              ) : (
                <TextInput
                  accessibilityLabel={field.label}
                  style={[
                    styles.input,
                    field.type === "multiline" && styles.multiline,
                  ]}
                  value={values[field.key] ?? ""}
                  onChangeText={(value) => change(field.key, value)}
                  editable={!actions.busy}
                  multiline={field.type === "multiline"}
                  maxLength={field.maxLength}
                  keyboardType={
                    field.type === "email" ? "email-address" : "default"
                  }
                  autoCapitalize={field.type === "email" ? "none" : "sentences"}
                />
              )}
            </View>
          ))}
          {!!(validation || actions.error) && (
            <Text accessibilityRole="alert" style={styles.error}>
              {validation || actions.error}
            </Text>
          )}
          <CustomButton
            label={
              actions.busy ? "Guardando…" : (form.submitLabel ?? "Guardar")
            }
            disabled={actions.busy}
            onPress={submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function OperationFormModal({
  actions,
}: {
  actions: ManagementActions;
}) {
  return (
    <Modal
      visible={!!actions.form}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={actions.closeForm}
    >
      {actions.form && <FormContent actions={actions} />}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pwhite },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderColor: Colors.pborder,
  },
  title: { flex: 1, color: Colors.pgray, fontSize: 21, fontWeight: "600" },
  content: { padding: 20, gap: 22, paddingBottom: 40 },
  field: { gap: 8 },
  label: { color: Colors.pgray, fontSize: 15, fontWeight: "500" },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    padding: 14,
    minHeight: 52,
    fontSize: 16,
    color: Colors.pgray,
  },
  multiline: { minHeight: 110, textAlignVertical: "top" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dateContainer: { gap: 8 },
  description: { color: Colors.sgray, fontSize: 14, lineHeight: 22 },
  error: { color: Colors.error, lineHeight: 21 },
});
