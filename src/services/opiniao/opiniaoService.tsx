import { api } from "../api/api";
import { apiPublic } from "../apiPublic/api";
import type { Opinion } from "../../types/opinion";
import type { OpinionFormValues } from "../../types/opiniao";
import {
  getStoredAllowedThemes,
  mergeRequestedThemesWithScope,
} from "../../utils/userProjectAccess";

/*
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");

 const today = `${year}-${month}-${day}`;
const oneYearAgo = `${year - 1}-${month}-${day}`;

type OpinionsQuery = {
  projetoId: number;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
};

type OpinionsRawResponse = {
  total?: number;
  items?: Opinion[];
  limit?: number;
  offset?: number;
}; */

const getArrayPayload = (data: unknown) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const candidates = [
      (data as any).data,
      (data as any).results,
      (data as any).result,
      (data as any).rows,
      (data as any).items,
    ];
    return candidates.find(Array.isArray) ?? [];
  }
  return [];
};

const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === ""),
    ),
  );

const withThemeScope = (
  projetoId: number,
  temas?: string | string[],
) => {
  const allowedThemes = getStoredAllowedThemes(projetoId);

  return {
    projetoId,
    temas: mergeRequestedThemesWithScope(temas, allowedThemes),
  };
};

type SubmitSummary = Partial<
  Pick<
    OpinionFormValues,
    | "usuario_id"
    | "opiniao"
    | "outra_opiniao"
    | "tipo_opiniao"
    | "texto_opiniao"
    | "horario_opiniao"
    | "acao"
  >
>;

export type SubmitFormPayload = {
  formVersionId: number;
  projetoId: number;
  status: "STARTED" | "COMPLETED" | "ABANDONED";
  fields: Record<string, unknown>;
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
  metadata?: Record<string, unknown> | null;
};

export type SubmitPublicFormPayload = Omit<
  SubmitFormPayload,
  "projetoId" | "formVersionId"
>;

export type GroupedFormResponse = {
  formId: number;
  formName: string;
  formVersionIds: number[];
  totalResponses: number;
  latestResponseAt: string | null;
  responses: Opinion[];
};

export type GroupedProjectResponses = {
  projectId: number;
  selectedFormId: number | null;
  totalResponses: number;
  totalForms: number;
  forms: GroupedFormResponse[];
};

export async function getGroupedOpinionsByProject(
  projectId: number,
  formId?: number | null,
  temas?: string | string[],
) {
  const scopedParams = withThemeScope(projectId, temas);
  const response = await api.get(`/form-response/project/${projectId}/grouped`, {
    params: cleanParams({
      formId,
      temas: scopedParams.temas,
    }),
  });

  return response?.data;
}

export async function getAllOpinions(
  projectId: number,
  temas?: string | string[],
) {
  const scopedParams = withThemeScope(projectId, temas);
  const response = await api.get(
    "/form-response/raw",
    {
      params: cleanParams({
        projetoId: projectId,
        temas: scopedParams.temas,
        select:
          "nome,telefone,ano_nascimento,genero,bairro,campanha,opiniao,outra_opiniao,tipo_opiniao,texto_opiniao,startedAt,submittedAt,createdAt",
      }),
    },
  );
  return response?.data;
}

export async function getTodayOpinions(): Promise<Opinion[]> {
  const response = await api.post("", {
    action: "filterByToday",
    entity: "opiniao",
  });
  const data = response?.data;
  return getArrayPayload(data);
}

export async function getUpDistricts() {
  const response = await api.post("", {
    action: "getUpDistrict",
    entity: "opiniao",
  });

  const data = response?.data;
  return data;
}

export async function submitOpinion(data: SubmitSummary) {
  const response = await api.post("", {
    action: "create",
    entity: "opiniao",
    payload: { ...data, acao: data.acao || "Registrar opinião" },
  });

  return response;
}

export async function submitOpiniionTest(payload: SubmitFormPayload) {
  const response = await apiPublic.post("/form-response/create", {
    ...payload,
  });

  return response.data;
}

export async function submitPublicFormResponse(
  projetoSlug: string,
  formSlug: string,
  payload: SubmitPublicFormPayload,
) {
  const response = await apiPublic.post(
    `/public/projetos/${encodeURIComponent(projetoSlug)}/forms/slug/${encodeURIComponent(formSlug)}/responses`,
    payload,
  );

  return response.data;
}
