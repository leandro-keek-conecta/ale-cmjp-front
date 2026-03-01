import { api } from "../api/api";

type DateInput = Date | string | null | undefined;

const toIso = (value: DateInput) => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
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

type ApiEnvelope<T> = { data: T; message?: string };

export type SelectOption = { label: string; value: string; count?: number };

export type MetricSummaryData = {
  day: { start: string; end: string };
  range: { start: string; end: string };
  totalOpinionsToday: number;
  topTemas: { id: number; tema: string; total: number }[];
  topBairros: { label: string; value: number }[];
};

export type MetricFiltersData = {
  tipoOpiniao: SelectOption[];
  temas: SelectOption[];
  genero: SelectOption[];
  bairros: SelectOption[];
  campanhas: SelectOption[];
  faixaEtaria: SelectOption[];
};

export type RawListPayload<T> = {
  total: number;
  limit: number;
  offset: number;
  items: T[];
};

export type FormField = {
  id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
};

export type FormVersion = {
  id: number;
  version: number;
  isActive: boolean;
  createdAt: string;
  fields: FormField[];
};

export type FormEntity = {
  id: number;
  name: string;
  projetoId: number;
  versions: FormVersion[];
};

export type ProjetoEntity = {
  id: number;
  slug: string;
  name: string;
  corHex?: string | null;
  themeConfig?: unknown;
  heroConfig?: unknown;
};

export async function getProjetoById(projetoId: number, signal?: AbortSignal) {
  const res = await api.get<ApiEnvelope<ProjetoEntity>>(`/projeto/${projetoId}`, {
    signal,
  });
  return res.data.data;
}

export async function getFormsByProjeto(
  projetoId: number,
  signal?: AbortSignal,
) {
  const res = await api.get<ApiEnvelope<FormEntity[]>>("/form/list", {
    params: { projetoId },
    signal,
  });
  return res.data.data ?? [];
}

export function resolveFormVersion(forms: FormEntity[], formId?: number) {
  const form = formId ? forms.find((f) => f.id === formId) : forms[0];
  if (!form) return null;

  const sorted = [...(form.versions ?? [])].sort((a, b) => {
    if (a.isActive !== b.isActive) return Number(b.isActive) - Number(a.isActive);
    return b.version - a.version;
  });

  return sorted[0] ?? null;
}

export function buildRawSelect(version: FormVersion | null, extra: string[] = []) {
  const fieldNames = (version?.fields ?? []).map((f) => f.name);
  return Array.from(new Set([...fieldNames, ...extra]));
}

export async function getMetricSummary(
  params: {
    projetoId: number;
    formVersionId?: number;
    day?: DateInput;
    rangeStart?: DateInput;
    rangeEnd?: DateInput;
    limitTopThemes?: number;
    limitTopNeighborhoods?: number;
  },
  signal?: AbortSignal,
) {
  const res = await api.get<ApiEnvelope<MetricSummaryData>>(
    "/form-response/metrics/summary",
    {
      params: cleanParams({
        projetoId: params.projetoId,
        formVersionId: params.formVersionId,
        day: toIso(params.day),
        rangeStart: toIso(params.rangeStart),
        rangeEnd: toIso(params.rangeEnd),
        limitTopThemes: params.limitTopThemes,
        limitTopNeighborhoods: params.limitTopNeighborhoods,
      }),
      signal,
    },
  );
  return res.data.data;
}

export async function getMetricFilters(
  params: {
    projetoId: number;
    formVersionId?: number;
    start?: DateInput;
    end?: DateInput;
    limit?: number;
  },
  signal?: AbortSignal,
) {
  const res = await api.get<ApiEnvelope<MetricFiltersData>>(
    "/form-response/metrics/filters",
    {
      params: cleanParams({
        projetoId: params.projetoId,
        formVersionId: params.formVersionId,
        start: toIso(params.start),
        end: toIso(params.end),
      }),
      signal,
    },
  );
  return res.data.data;
}

export async function getRawFormResponses<T = Record<string, unknown>>(
  params: {
    projetoId: number;
    formVersionId?: number;
    start?: DateInput;
    end?: DateInput;
    limit: number;
    offset: number;
    includeDates?: boolean;
    select?: string[];
  },
  signal?: AbortSignal,
) {
  const res = await api.get<ApiEnvelope<RawListPayload<T>>>("/form-response/raw", {
    params: cleanParams({
      projetoId: params.projetoId,
      formVersionId: params.formVersionId,
      start: toIso(params.start),
      end: toIso(params.end),
      limit: params.limit,
      offset: params.offset,
      includeDates: params.includeDates ?? true,
      select: params.select?.length ? params.select.join(",") : undefined,
    }),
    signal,
  });

  return res.data.data;
}
