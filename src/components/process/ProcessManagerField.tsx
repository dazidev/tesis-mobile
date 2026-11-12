import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { useProcessManagerViewModel } from "../../viewmodels/useProcessManagerViewModel";
import { ActionButton } from "../common/ActionButton";
import { CustomButton } from "../common/CustomButton";

function ManagerOption({
  name,
  detail,
  selected,
  onPress,
}: {
  name: string;
  detail: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.optionText}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={23}
        color={Colors.pblue}
      />
    </Pressable>
  );
}

export function ProcessManagerField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const model = useProcessManagerViewModel(value, onChange);
  const label = !value
    ? "Mi cuenta"
    : model.selectedLawyer
      ? `${model.selectedLawyer.name} ${model.selectedLawyer.lastname}`
      : "Abogado seleccionado";

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Responsable del proceso: ${label}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={model.open}
        style={({ pressed }) => [
          styles.option,
          (disabled || pressed) && styles.pressed,
        ]}
      >
        <Text style={[styles.name, styles.optionText]}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.pblue} />
      </Pressable>
      <Text style={styles.detail}>Puede seleccionar un abogado activo.</Text>
      <Modal
        visible={model.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={model.close}
      >
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Seleccionar responsable</Text>
              <ActionButton label="Cancelar" onPress={model.close} />
            </View>
            <FlatList
              data={!model.loading && !model.error ? model.filteredLawyers : []}
              keyExtractor={(lawyer) => lawyer.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}
              ListHeaderComponent={
                <View style={styles.listHeader}>
                  <TextInput
                    accessibilityLabel="Buscar abogado por nombre o correo"
                    placeholder="Buscar por nombre o correo"
                    placeholderTextColor={Colors.sgray}
                    value={model.query}
                    onChangeText={model.setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />
                  <ManagerOption
                    name="Usar mi cuenta"
                    detail="Usted será responsable del proceso."
                    selected={!model.draftId}
                    onPress={() => model.setDraftId("")}
                  />
                  <Text style={styles.name}>Abogados activos</Text>
                </View>
              }
              ListEmptyComponent={
                model.loading ? (
                  <ActivityIndicator
                    accessibilityLabel="Cargando abogados"
                    color={Colors.pblue}
                  />
                ) : model.error ? (
                  <View style={styles.listHeader}>
                    <Text accessibilityRole="alert" style={styles.error}>
                      {model.error}
                    </Text>
                    <ActionButton label="Reintentar" onPress={model.retry} />
                  </View>
                ) : (
                  <Text style={styles.detail}>
                    {model.query.trim()
                      ? "No se encontraron abogados con ese nombre o correo."
                      : "No hay abogados activos disponibles."}
                  </Text>
                )
              }
              renderItem={({ item }) => (
                <ManagerOption
                  name={`${item.name} ${item.lastname}`}
                  detail={`${item.email} · Activo`}
                  selected={model.draftId === item.id}
                  onPress={() => model.setDraftId(item.id)}
                />
              )}
            />
            <View style={styles.footer}>
              <CustomButton
                label="Confirmar responsable"
                disabled={!model.canConfirm}
                onPress={model.confirm}
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
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
  title: { flex: 1, color: Colors.pgray, fontSize: 21, fontWeight: "600" },
  content: { padding: 20, gap: 12 },
  listHeader: { gap: 16, marginBottom: 4 },
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
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.pborder,
    padding: 16,
    minHeight: 56,
  },
  selected: { borderColor: Colors.pblue },
  optionText: { flex: 1, gap: 5 },
  name: { fontSize: 16, fontWeight: "500", color: Colors.pgray },
  detail: { fontSize: 14, lineHeight: 21, color: Colors.sgray },
  pressed: { opacity: 0.6 },
  error: { color: Colors.error, lineHeight: 21 },
  footer: { padding: 20, borderTopWidth: 1, borderColor: Colors.pborder },
});
