import type { DocumentPickerAsset } from "expo-document-picker";
import { api } from "../infrastructure/api";
import type { ManagedFolder } from "../interfaces/management.interface";

export const getFolder = async (id: string) =>
  (await api.get<ManagedFolder>(`/folder/${id}`)).data;
export const createFolder = async (
  stageId: string,
  data: { name: string; description: string; substageId?: string },
) => {
  await api.post(`/folder/${stageId}`, data);
};
export const updateFolder = async (
  id: string,
  data: { name: string; description: string },
) => {
  await api.patch(`/folder/${id}`, data);
};
export const deactivateFolder = async (id: string, reason: string) => {
  await api.patch(`/folder/${id}/deactivate`, { reason });
};
export const updateFile = async (
  id: string,
  data: { name: string; description: string },
) => {
  await api.patch(`/folder/file/${id}`, data);
};
export const deleteFile = async (id: string) => {
  await api.delete(`/folder/file/${id}`);
};

export const uploadFile = async (
  folderId: string,
  asset: DocumentPickerAsset,
  data: { name: string; description: string },
) => {
  const form = new FormData();
  form.append("name", data.name);
  form.append("description", data.description);
  // React Native encodes local file URIs as multipart file parts.
  form.append("file", {
    uri: asset.uri,
    name: asset.name,
    type: "application/pdf",
  } as unknown as Blob);
  await api.post(`/folder/${folderId}/file`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
};
