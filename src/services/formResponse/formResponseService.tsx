import { api } from "../api/api";

type FormResponsePayload = {
  formVersionId: number;
  projetoId: number;
  status?: "STARTED" | "COMPLETED";
  fields: Record<string, any>;
};

type FormResponseUpdatePayload = {
  status?: "STARTED" | "COMPLETED";
  submittedAt?: string;
  completedAt?: string;
  fields?: Record<string, any>;
};

export async function createFormResponse(payload: FormResponsePayload) {
  const response = await api.post("/form-response/create", payload);
  return response?.data;
}

export async function updateFormResponse(
  responseId: number | string,
  payload: FormResponseUpdatePayload,
) {
  const response = await api.patch(
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
  const response = await api.get("/form-response/exists", {
    params: { projetoId, fieldName, value },
  });
  return response?.data;
}
