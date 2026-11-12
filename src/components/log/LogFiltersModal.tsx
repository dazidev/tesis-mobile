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
import {
  getLogActionLabel,
  getLogEntityLabel,
} from "../../infrastructure/log-labels";
import type {
  FindLogsRequest,
  LogFilters,
} from "../../interfaces/log.interface";
import { Colors } from "../../theme/colors";
import { ActionButton } from "../common/ActionButton";
import { CustomButton } from "../common/CustomButton";
import { SelectField } from "../common/SelectField";
import { LogDateTimeField } from "./LogDateTimeField";

export function LogFiltersModal({
  query,
  filters,
  onApply,
  onClose,
}: {
  query: FindLogsRequest;
  filters: LogFilters;
  onApply: (query: FindLogsRequest) => void;
  onClose: () => void;
}) {
  const [entity, setEntity] = useState(query.entity ?? "");
  const [action, setAction] = useState(query.action ?? "");
  const [userSearch, setUserSearch] = useState(query.userSearch ?? "");
  const [from, setFrom] = useState(query.from ?? "");
  const [to, setTo] = useState(query.to ?? "");
  const [error, setError] = useState("");
  const actions =
    filters.categories.find((category) => category.entity === entity)
      ?.actions ?? [];
  const submit = () => {
    if (
      (from && !Number.isFinite(Date.parse(from))) ||
      (to && !Number.isFinite(Date.parse(to)))
    ) {
      setError("Las fechas u horas seleccionadas no son válidas.");
      return;
    }
    if (from && to && new Date(from) > new Date(to)) {
      setError("La fecha inicial no puede superar la fecha final.");
      return;
    }
    onApply({
      ...(entity && { entity }),
      ...(action && { action }),
      ...(userSearch.trim() && { userSearch: userSearch.trim() }),
      ...(from && { from }),
      ...(to && { to }),
    });
  };

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Filtros</Text>
            <ActionButton label="Cancelar" onPress={onClose} />
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.field}>
              <Text style={styles.label}>Categoría</Text>
              <SelectField
                label="Categoría"
                value={entity}
                options={[
                  { value: "", label: "Todas las categorías" },
                  ...filters.categories.map((category) => ({
                    value: category.entity,
                    label: getLogEntityLabel(category.entity),
                  })),
                ]}
                onChange={(value) => {
                  setEntity(value);
                  setAction("");
                }}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Acción</Text>
              <SelectField
                label="Acción"
                value={action}
                options={[
                  { value: "", label: "Todas las acciones" },
                  ...actions.map((value) => ({
                    value,
                    label: getLogActionLabel(value),
                  })),
                ]}
                onChange={setAction}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Usuario</Text>
              <TextInput
                accessibilityLabel="Usuario: nombre, apellido o correo"
                value={userSearch}
                onChangeText={setUserSearch}
                placeholder="Nombre, apellido o correo"
                placeholderTextColor={Colors.sgray}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={100}
                style={styles.input}
              />
            </View>
            <LogDateTimeField
              label="Fecha y hora inicial"
              value={from}
              onChange={setFrom}
            />
            <LogDateTimeField
              label="Fecha y hora final"
              value={to}
              onChange={setTo}
              endOfRange
            />
            {!!error && (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            )}
            <CustomButton
              label="Limpiar filtros"
              variant="outline"
              onPress={() => onApply({})}
            />
            <CustomButton label="Buscar" onPress={submit} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pwhite },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderColor: Colors.pborder,
  },
  title: { flex: 1, fontSize: 21, fontWeight: "600", color: Colors.pgray },
  content: { padding: 20, paddingBottom: 40, gap: 22 },
  field: { gap: 8 },
  label: { color: Colors.pgray, fontSize: 15, fontWeight: "500" },
  input: {
    minHeight: 52,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    backgroundColor: Colors.white,
    fontSize: 16,
    color: Colors.pgray,
  },
  error: { color: Colors.error, lineHeight: 21 },
});
