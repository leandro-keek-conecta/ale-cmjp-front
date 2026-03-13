import { getStoredProjectId } from "@/utils/project";
import { api } from "../api/api";

type StorageRequestFile = {
  fileName: string;
  folder?: string;
  expiresIn?: number;
  contentType?: string;
};

export type StorageUploadTarget = {
  fileName: string;
  fileUrl: string;
  uploadUrl: string;
  method: "POST" | "PUT";
  headers?: Record<string, string>;
  fields?: Record<string, string>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const getString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const toStringRecord = (value: unknown): Record<string, string> | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return entries.length ? Object.fromEntries(entries) : undefined;
};

const toUploadTarget = (
  payload: unknown,
  fallback: StorageRequestFile,
): StorageUploadTarget => {
  const record = isRecord(payload) ? payload : {};
  const uploadUrl = getString(
    record.uploadUrl,
    record.presignedUrl,
    record.signedUrl,
    record.authenticatedUrl,
    record.url,
  );

  if (!uploadUrl) {
    throw new Error(
      `Nao foi possivel identificar a URL de upload para ${fallback.fileName}.`,
    );
  }

  const fileUrl = getString(
    record.fileUrl,
    record.publicUrl,
    record.downloadUrl,
    record.objectUrl,
  );

  if (!fileUrl) {
    throw new Error(
      `O storage nao retornou a URL final de acesso para ${fallback.fileName}.`,
    );
  }

  const methodLabel = getString(record.method, record.httpMethod).toUpperCase();
  const hasPostFields = Boolean(toStringRecord(record.fields));
  const method =
    methodLabel === "POST" || hasPostFields
      ? "POST"
      : ("PUT" as StorageUploadTarget["method"]);

  return {
    fileName: getString(record.fileName, record.name, fallback.fileName),
    fileUrl,
    uploadUrl,
    method,
    headers: toStringRecord(record.headers),
    fields: toStringRecord(record.fields),
  };
};

const extractBatchEntries = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidates = [
    payload.files,
    payload.items,
    payload.data,
    payload.response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (isRecord(candidate)) {
      const nestedEntries = extractBatchEntries(candidate);
      if (nestedEntries.length) {
        return nestedEntries;
      }
    }
  }

  return [];
};

export async function getStorage(
  files: StorageRequestFile[],
): Promise<StorageUploadTarget[]> {
  const projectId = getStoredProjectId();
  if (!projectId) {
    throw new Error("Nenhum projeto selecionado para gerar URLs de upload.");
  }

  const normalizedFiles = files
    .map((file) => ({
      fileName: file.fileName.trim(),
      folder: file.folder?.trim() || "panorama",
      expiresIn: file.expiresIn ?? 300,
      contentType: file.contentType?.trim() || undefined,
    }))
    .filter((file) => file.fileName);

  if (!normalizedFiles.length) {
    return [];
  }

  const response = await api.post("/storage/presigned-upload/batch", {
    files: normalizedFiles.map((file) => ({
      projectId,
      fileName: file.fileName,
      folder: file.folder,
      expiresIn: file.expiresIn,
      ...(file.contentType ? { contentType: file.contentType } : {}),
    })),
  });

  const rawPayload =
    response.data?.data ?? response.data?.response ?? response.data ?? [];
  const entries = extractBatchEntries(rawPayload);

  if (entries.length < normalizedFiles.length) {
    throw new Error("O serviço de storage retornou menos arquivos que o esperado.");
  }

  return normalizedFiles.map((file, index) => {
    const matchingEntry =
      entries.find((entry) => {
        if (!isRecord(entry)) {
          return false;
        }

        return (
          getString(entry.fileName, entry.name, entry.originalFileName) ===
          file.fileName
        );
      }) ?? entries[index];

    return toUploadTarget(matchingEntry, file);
  });
}

export async function uploadFileToStorage(
  target: StorageUploadTarget,
  file: File,
) {
  if (target.method === "POST" && target.fields) {
    const formData = new FormData();
    Object.entries(target.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);

    const response = await fetch(target.uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Falha ao enviar ${file.name} para o storage.`);
    }

    return;
  }

  const response = await fetch(target.uploadUrl, {
    method: target.method,
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      ...target.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao enviar ${file.name} para o storage.`);
  }
}
