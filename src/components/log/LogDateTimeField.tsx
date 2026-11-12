import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme/colors";
import { ActionButton } from "../common/ActionButton";

export function LogDateTimeField({
  label,
  value,
  endOfRange,
  onChange,
}: {
  label: string;
  value: string;
  endOfRange?: boolean;
  onChange: (value: string) => void;
}) {
  const [mode, setMode] = useState<"date" | "time" | null>(null);
  const date = value ? new Date(value) : new Date();
  if (!value)
    date.setHours(
      endOfRange ? 23 : 0,
      endOfRange ? 59 : 0,
      endOfRange ? 59 : 0,
      endOfRange ? 999 : 0,
    );
  const select = (selected: Date) => {
    const next = new Date(date);
    if (mode === "date")
      next.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );
    else next.setHours(selected.getHours(), selected.getMinutes());
    // Match the web's inclusive minute boundaries in the user's local time zone.
    next.setSeconds(endOfRange ? 59 : 0, endOfRange ? 999 : 0);
    onChange(next.toISOString());
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <ActionButton
          icon="calendar-outline"
          label={value ? date.toLocaleDateString("es-MX") : "Seleccionar fecha"}
          onPress={() => setMode(mode === "date" ? null : "date")}
        />
        <ActionButton
          icon="time-outline"
          label={date.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
          disabled={!value}
          onPress={() => setMode(mode === "time" ? null : "time")}
        />
        {!!value && (
          <ActionButton
            label="Quitar fecha"
            onPress={() => {
              onChange("");
              setMode(null);
            }}
          />
        )}
      </View>
      {!!mode && (
        <>
          <DateTimePicker
            value={date}
            mode={mode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onValueChange={(_, selected) => {
              if (Platform.OS !== "ios") setMode(null);
              select(selected);
            }}
            onDismiss={() => setMode(null)}
          />
          {Platform.OS === "ios" && (
            <ActionButton
              label="Usar selección"
              onPress={() => {
                select(date);
                setMode(null);
              }}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 15, fontWeight: "500", color: Colors.pgray },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
