import { apiPublic } from "../apiPublic/api";

type FormResponsePayload = {
  formVersionId: number;
  projetoId: number;
  status?: "STARTED" | "COMPLETED";
  fields: Record<string, any>;
  userId?: number;
  ip?: string | null;
  userAgent?: string | null;
  startedAt?: string;
  completedAt?: string;
  submittedAt?: string;
  source?: string | null;
  channel?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  deviceType?: string | null;
  os?: string | null;
  browser?: string | null;
  locale?: string | null;
  timezone?: string | null;
  metadata?: Record<string, any> | null;
};

type FormResponseUpdatePayload = {
  status?: "STARTED" | "COMPLETED";
  submittedAt?: string;
  completedAt?: string;
  fields?: Record<string, any>;
  userId?: number;
  ip?: string | null;
  userAgent?: string | null;
  startedAt?: string;
  source?: string | null;
  channel?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  deviceType?: string | null;
  os?: string | null;
  browser?: string | null;
  locale?: string | null;
  timezone?: string | null;
  metadata?: Record<string, any> | null;
};

export async function createFormResponse(payload: FormResponsePayload) {
  const response = await apiPublic.post("/form-response/create", payload);
  return response?.data;
}

export async function updateFormResponse(
  responseId: number | string,
  payload: FormResponseUpdatePayload,
) {
  const response = await apiPublic.patch(
    `/form-response/update/${responseId}`,
    payload,
  );
  return response?.data;
}

export async function checkFormResponseExists(
  projetoId: number,
  fieldName: string,
  value: string,
) {
  const response = await apiPublic.get("/form-response/exists", {
    params: { projetoId, fieldName, value },
  });
  return response?.data;
}
