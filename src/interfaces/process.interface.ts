export type ProcessType = "testate" | "intestate" | "mixed";

export type ProcessStatus = "created" | "opened" | "closed";

export interface ClientProcess {
  id: string;
  courtNumber: string;
  caseFileNumber: string;
  type: ProcessType;
  status: ProcessStatus;
  createdAt: string;
  updatedAt: string;

  defendant: {
    name: string;
    lastname: string;
  };
}

export type StageStatus = "created" | "opened" | "closed";

export type SubstageStatus = "opened" | "closed";

export interface ClientSubstage {
  id: string;
  name: string;
  description: string;
  status: SubstageStatus;
  order: number;
  stageId: string;
  parentSubstageId: string | null;
  childrenSubstages: ClientSubstage[];
}

export interface ClientStage {
  id: string;
  name: string;
  description: string;
  status: StageStatus;
  order: number;
  main: boolean;
  childrenSubstages: ClientSubstage[];
}

export interface ClientProcessDetail extends Pick<
  ClientProcess,
  "id" | "caseFileNumber" | "courtNumber" | "type" | "status" | "defendant"
> {
  stages: ClientStage[];
}

export interface ClientDigitalFile {
  id: string;
  name: string;
  description: string;
  size: number;
  createdAt: string;
}

export interface ClientDigitalFolder {
  id: string;
  name: string;
  description: string;
  stageId: string;
  substageId: string | null;
  digitalFiles: ClientDigitalFile[];
}
