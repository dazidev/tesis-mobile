import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  cancelInvitation,
  inviteProcessClient,
  linkProcessClient,
  resendInvitation,
  unlinkProcessClient,
} from "../../services/client.service";
import { Colors } from "../../theme/colors";
import { useManagementActions } from "../../viewmodels/useManagementActions";
import { useProcessClientsViewModel } from "../../viewmodels/useProcessClientsViewModel";
import { ActionButton } from "../common/ActionButton";
import { OperationFormModal } from "../common/OperationFormModal";

export function ProcessClientsPanel({
  processId,
  revision,
}: {
  processId: string;
  revision: number;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.panel}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.title}>Clientes e invitaciones</Text>
        <Text style={styles.secondary}>{expanded ? "Ocultar" : "Mostrar"}</Text>
      </Pressable>
      {expanded && <ClientsContent processId={processId} revision={revision} />}
    </View>
  );
}

function ClientsContent({
  processId,
  revision,
}: {
  processId: string;
  revision: number;
}) {
  const { data, loading, error, reload, now } = useProcessClientsViewModel(
    processId,
    revision,
  );
  const actions = useManagementActions(reload);
  const emailForm = (invite: boolean) =>
    actions.openForm({
      title: invite ? "Invitar cliente" : "Vincular cliente existente",
      submitLabel: invite ? "Enviar invitación" : "Vincular",
      description: invite
        ? "Se enviará por correo una invitación para registrarse y consultar este proceso."
        : "Ingrese el correo del cliente que ya tiene una cuenta registrada.",
      fields: [{ key: "email", label: "Correo electrónico", type: "email" }],
      submit: (values) =>
        invite
          ? inviteProcessClient(processId, values.email)
          : linkProcessClient(processId, values.email),
    });

  return (
    <View style={styles.content}>
      <Text style={styles.secondary}>
        Los clientes vinculados pueden consultar este expediente y sus PDF.
      </Text>
      <View style={styles.actions}>
        <ActionButton
          label="Invitar cliente"
          icon="mail-outline"
          disabled={actions.busy}
          onPress={() => emailForm(true)}
        />
        <ActionButton
          label="Vincular existente"
          icon="person-add-outline"
          disabled={actions.busy}
          onPress={() => emailForm(false)}
        />
      </View>
      {loading ? (
        <ActivityIndicator color={Colors.pblue} />
      ) : error ? (
        <>
          <Text style={styles.error}>{error}</Text>
          <ActionButton label="Reintentar" onPress={() => void reload()} />
        </>
      ) : (
        data && (
          <>
            <Text style={styles.section}>
              Vinculados · {data.linkedClients.length}
            </Text>
            {!data.linkedClients.length && (
              <Text style={styles.secondary}>No hay clientes vinculados.</Text>
            )}
            {data.linkedClients.map(({ client }) => (
              <View key={client.id} style={styles.card}>
                <Text style={styles.name}>
                  {client.name} {client.lastname}
                </Text>
                <Text style={styles.secondary}>{client.email}</Text>
                <Text style={styles.secondary}>
                  {client.status === "active"
                    ? "Activo"
                    : client.status === "suspended"
                      ? "Suspendido"
                      : "Inactivo"}
                </Text>
                <ActionButton
                  label="Desvincular"
                  icon="person-remove-outline"
                  danger
                  disabled={actions.busy}
                  onPress={() =>
                    actions.confirm(
                      "Desvincular cliente",
                      `${client.name} dejará de tener acceso a este proceso.`,
                      () => unlinkProcessClient(processId, client.id),
                      true,
                    )
                  }
                />
              </View>
            ))}
            <Text style={styles.section}>
              Invitaciones · {data.invitations.length}
            </Text>
            {!data.invitations.length && (
              <Text style={styles.secondary}>
                No hay invitaciones registradas.
              </Text>
            )}
            {data.invitations.map((invitation) => {
              const expired = new Date(invitation.expiresAt).getTime() <= now;
              const status = invitation.isUsed
                ? "Utilizada"
                : invitation.canceledAt
                  ? "Cancelada"
                  : expired
                    ? "Vencida"
                    : "Pendiente";
              const available = !invitation.isUsed && !invitation.canceledAt;
              return (
                <View key={invitation.id} style={styles.card}>
                  <Text style={styles.name}>{invitation.toEmail}</Text>
                  <Text style={styles.secondary}>
                    {status} · Vence{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString("es-MX")}
                  </Text>
                  <Text style={styles.secondary}>
                    {invitation.lastEmailErrorAt
                      ? "El último envío de correo presentó un error."
                      : invitation.emailSentAt
                        ? "Correo enviado."
                        : "Envío de correo pendiente."}
                  </Text>
                  {available && (
                    <View style={styles.actions}>
                      <ActionButton
                        label="Reenviar"
                        icon="mail-outline"
                        disabled={actions.busy}
                        onPress={() =>
                          actions.confirm(
                            "Reenviar invitación",
                            "Se enviará un nuevo correo y se renovará el vencimiento a 7 días. Debe haber pasado al menos un minuto desde la última actualización.",
                            () => resendInvitation(invitation.id),
                          )
                        }
                      />
                      <ActionButton
                        label="Cancelar invitación"
                        danger
                        disabled={actions.busy}
                        onPress={() =>
                          actions.confirm(
                            "Cancelar invitación",
                            "El enlace de registro de esta invitación dejará de ser válido.",
                            () => cancelInvitation(invitation.id),
                            true,
                          )
                        }
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )
      )}
      <OperationFormModal actions={actions} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 12,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  header: {
    padding: 18,
    gap: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.pgray,
    flexShrink: 1,
  },
  content: { padding: 16, gap: 14 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  secondary: { fontSize: 13, color: Colors.sgray, lineHeight: 20 },
  section: {
    fontWeight: "600",
    fontSize: 15,
    color: Colors.pgray,
    marginTop: 8,
  },
  card: {
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.pborder,
    borderRadius: 10,
  },
  name: { color: Colors.pgray, fontWeight: "500", fontSize: 15 },
  error: { color: Colors.error, lineHeight: 20 },
});
