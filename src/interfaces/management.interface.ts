import type {
  ClientDigitalFolder,
  ClientProcess,
  ClientStage,
  ClientSubstage,
  ProcessType,
} from "./process.interface";

export type ManagedProcess = Omit<ClientProcess, "defendant">;

export interface CreateProcessRequest {
  courtNumber: string;
  caseFileNumber: string;
  type: ProcessType;
  defendant: {
    name: string;
    lastname: string;
    birthDate: string;
    deathDate: string;
  };
}

export interface Task {
  id: string;
  description: string;
  dueDate: string;
  completedAt: string | null;
  stageId: string;
  substageId: string | null;
}

export interface ContainerDetail {
  id: string;
  name: string;
  description: string;
  status: ClientStage["status"] | ClientSubstage["status"];
  digitalFolders: {
    id: string;
    name: string;
    description: string;
    _count: { digitalFiles: number };
  }[];
  tasks: Task[];
}

export interface ProcessClients {
  id: string;
  linkedClients: {
    createdAt: string;
    client: {
      id: string;
      name: string;
      lastname: string;
      email: string;
      status: string;
    };
  }[];
  invitations: {
    id: string;
    toEmail: string;
    isUsed: boolean;
    expiresAt: string;
    canceledAt: string | null;
    emailSentAt: string | null;
    lastEmailErrorAt: string | null;
  }[];
}

export type ManagedFolder = ClientDigitalFolder;
