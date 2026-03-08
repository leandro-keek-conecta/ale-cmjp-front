import type {
  PanoramaResponse,
  PanoramaResponseField,
} from "../types/panoramaResponse";

type ResponseContext = {
  formId?: number | null;
  formName?: string;
  fallbackId?: string;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

const getFieldValue = (field: PanoramaResponseField) =>
  field.value ?? field.valueNumber ?? null;

const flattenResponseFields = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.reduce<Record<string, unknown>>((accumulator, entry) => {
      if (!entry || typeof entry !== "object") {
        return accumulator;
      }

      const field = entry as PanoramaResponseField;
      const key =
        typeof field.fieldName === "string" && field.fieldName.trim()
          ? field.fieldName.trim()
          : typeof field.name === "string" && field.name.trim()
            ? field.name.trim()
            : "";

      if (!key) {
        return accumulator;
      }

      accumulator[key] = getFieldValue(field);
      return accumulator;
    }, {});
  }

  return asRecord(value);
};

export function normalizePanoramaResponse(
  value: unknown,
  context: ResponseContext = {},
): PanoramaResponse {
  const data = asRecord(value);
  const fields = flattenResponseFields(data.fields);
  const responseId = data.id ?? data.responseId ?? data.formResponseId;

  return {
    ...fields,
    ...data,
    id:
      typeof responseId === "number" || typeof responseId === "string"
        ? responseId
        : context.fallbackId ?? "response",
    formId:
      typeof data.formId === "number"
        ? data.formId
        : typeof context.formId === "number"
          ? context.formId
          : null,
    formName:
      typeof data.formName === "string" && data.formName.trim()
        ? data.formName
        : context.formName,
  };
}

export function resolveResponseDate(response: PanoramaResponse) {
  return (
    response.submittedAt ??
    response.completedAt ??
    response.createdAt ??
    response.startedAt ??
    response.horario ??
    null
  );
}

export function isOpinionResponse(response: PanoramaResponse) {
  const hasOpinionContent =
    typeof response.opiniao === "string" && response.opiniao.trim() !== "";
  const hasOpinionText =
    typeof response.texto_opiniao === "string" &&
    response.texto_opiniao.trim() !== "";
  const hasOpinionType =
    typeof response.tipo_opiniao === "string" &&
    response.tipo_opiniao.trim() !== "";
  const formName = normalizeText(response.formName);

  return (
    hasOpinionContent ||
    hasOpinionText ||
    hasOpinionType ||
    formName.includes("opiniao") ||
    formName.includes("manifest")
  );
}
