import { Directory, File, Paths } from "expo-file-system";

import { api, refreshSession } from "../infrastructure/api";

const getDocumentsDirectory = () =>
  new Directory(Paths.cache, "client-documents");

export const clearClientPdfCache = () => {
  const directory = getDocumentsDirectory();

  if (directory.exists) {
    directory.delete();
  }
};

export const previewClientPdf = async (
  fileId: string,
  name: string,
): Promise<void> => {
  const session = await refreshSession();

  const directory = getDocumentsDirectory();

  if (!directory.exists) {
    directory.create();
  }

  const destination = new File(directory, `${fileId}-${Date.now()}.pdf`);

  const url = api.getUri({
    url: `/folder/file/${encodeURIComponent(fileId)}/view`,
  });

  const downloadedFile = await File.downloadFileAsync(url, destination, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const canPreview = await downloadedFile.canPreview({
    mimeType: "application/pdf",
  });

  if (!canPreview) {
    throw new Error("No hay un visor de PDF disponible en este dispositivo.");
  }

  await downloadedFile.preview({
    title: name,
    mimeType: "application/pdf",
  });
};
