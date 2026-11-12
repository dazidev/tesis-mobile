const entityLabels: Record<string, string> = {
  USER: "Usuarios",
  PROCESS: "Procesos",
  STAGE: "Etapas",
  SUBSTAGE: "Subetapas",
  FOLDER: "Carpetas",
  FILE: "Archivos",
  TASK: "Tareas",
};

const actionLabels: Record<string, string> = {
  UPDATE_USER: "Editar usuario",
  DEACTIVATE_USER: "Desactivar usuario",
  INVITATION_USER: "Invitar usuario",
  CANCEL_INVITATION: "Cancelar invitación",
  RESEND_INVITATION: "Reenviar invitación",
  CREATE_PROCESS: "Crear proceso",
  DEACTIVATE_PROCESS: "Desactivar proceso",
  DELETE_PROCESS: "Eliminar proceso",
  INIT_PROCESS: "Iniciar proceso",
  CLOSE_PROCESS: "Finalizar proceso",
  CREATE_STAGE: "Crear etapa",
  CLOSE_STAGE: "Cerrar etapa",
  DELETE_STAGE: "Eliminar etapa",
  ADVANCE_STAGE: "Avanzar etapa",
  CREATE_SUBSTAGE: "Crear subetapa",
  CLOSE_SUBSTAGE: "Cerrar subetapa",
  DELETE_SUBSTAGE: "Eliminar subetapa",
  LINK_PROCESS_CLIENT: "Vincular cliente",
  UNLINK_PROCESS_CLIENT: "Desvincular cliente",
  CREATE_FOLDER: "Crear carpeta",
  UPDATE_FOLDER: "Actualizar carpeta",
  DEACTIVATE_FOLDER: "Desactivar carpeta",
  DELETE_FOLDER: "Eliminar carpeta",
  CREATE_FILE: "Subir archivo",
  VIEW_FILE: "Visualizar archivo",
  DOWNLOAD_FILE: "Descargar archivo",
  UPDATE_FILE: "Actualizar archivo",
  DEACTIVATE_FILE: "Desactivar archivo",
  DELETE_FILE: "Eliminar archivo",
  CREATE_TASK: "Crear tarea",
  UPDATE_TASK: "Actualizar tarea",
  COMPLETE_TASK: "Completar tarea",
  REOPEN_TASK: "Reabrir tarea",
  DEACTIVATE_TASK: "Desactivar tarea",
};

export const getLogEntityLabel = (entity: string | null) =>
  entity ? (entityLabels[entity] ?? entity) : "Sin categoría";
export const getLogActionLabel = (action: string) =>
  actionLabels[action] ?? action.replaceAll("_", " ").toLowerCase();
export const formatLogDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
