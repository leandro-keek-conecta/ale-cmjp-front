import { api } from "../api/api";
import { getStoredProjectId } from "../../utils/project";
import {
  getStoredAllowedThemes,
  mergeRequestedThemesWithScope,
} from "../../utils/userProjectAccess";

export type ResponseStatus = "STARTED" | "COMPLETED" | "ABANDONED";

export type MetricsParams = {
  projetoId?: number;
  formVersionId?: number;
  formId?: number;
  formIds?: string;
  start?: string;
  end?: string;
  temas?: string | string[];
  tipoOpiniao?: string;
  genero?: string;
  bairros?: string | string[];
  faixaEtaria?: string;
  status?: ResponseStatus;
  dateField?: string;
  monthStart?: string;
  monthEnd?: string;
  dayStart?: string;
  dayEnd?: string;
  limitTopForms?: number;
  limitValuesPerField?: number;
  limits?: {
    opiniao?: number;
    bairro?: number;
  };
};

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

type ReportCards = {
  totalResponses?: number | string;
  totalOpinionFormResponses?: number | string;
  totalPraise?: number | string;
  totalSuggestions?: number | string;
  completionRate?: number | string;
  [key: string]: unknown;
};

export type ProjectReportResponse = {
  cards?: ReportCards;
  lineByMonth?: unknown[];
  lineByDay?: unknown[];
  responsesByForm?: unknown[];
  statusFunnel?: unknown[];
  [key: string]: unknown;
};

export type OpinionReportResponse = {
  cards?: {
    totalOpinions?: number | string;
    totalComplaints?: number | string;
    totalPraise?: number | string;
    totalKudos?: number | string;
    totalSuggestions?: number | string;
    completionRate?: number | string;
    [key: string]: unknown;
  };
  lineByMonth?: unknown[];
  opinionsByMonth?: unknown[];
  lineByDay?: unknown[];
  opinionsByDay?: unknown[];
  responsesByForm?: unknown[];
  statusFunnel?: unknown[];
  topBairros?: unknown[];
  opinionsByGender?: unknown[];
  opinionsByAge?: unknown[];
  campaignAcceptance?: unknown[];
  topTemas?: unknown[];
  [key: string]: unknown;
};

type FilterValue = {
  label?: string;
  value?: string | number | boolean;
  count?: number;
  total?: number;
  [key: string]: unknown;
};

type DynamicFieldFilter = {
  fieldName?: string;
  name?: string;
  label?: string;
  suggestedFilter?: string;
  values?: FilterValue[];
  optionsConfig?: unknown;
  [key: string]: unknown;
};

type FormFiltersEntry = {
  formId?: number;
  id?: number;
  formName?: string;
  name?: string;
  count?: number;
  total?: number;
  totalResponses?: number;
  fields?: DynamicFieldFilter[];
  [key: string]: unknown;
};

export type FormFiltersResponse = {
  forms?: FormFiltersEntry[];
  fields?: DynamicFieldFilter[];
  [key: string]: unknown;
};

export type OpinionFilterOptionsResponse = {
  tipoOpiniao?: Array<{ label: string; value: string; count?: number }>;
  temas?: Array<{ label: string; value: string; count?: number }>;
  genero?: Array<{ label: string; value: string; count?: number }>;
  bairros?: Array<{ label: string; value: string; count?: number }>;
  campanhas?: Array<{ label: string; value: string; count?: number }>;
  faixaEtaria?: Array<{ label: string; value: string; count?: number }>;
  [key: string]: unknown;
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

const withProjectScope = (params: MetricsParams = {}): MetricsParams => {
  if (params.projetoId || params.formVersionId) {
    const allowedThemes = getStoredAllowedThemes(params.projetoId);
    return {
      ...params,
      temas: mergeRequestedThemesWithScope(params.temas, allowedThemes),
    };
  }

  const projetoId = getStoredProjectId();
  if (!projetoId) {
    throw new Error("Projeto não encontrado para buscar relatórios.");
  }

  const allowedThemes = getStoredAllowedThemes(projetoId);

  return {
    ...params,
    projetoId,
    temas: mergeRequestedThemesWithScope(params.temas, allowedThemes),
  };
};

const unwrapResponse = <T,>(payload: ApiEnvelope<T> | T) => {
  if (payload && typeof payload === "object" && "data" in (payload as object)) {
    return (payload as ApiEnvelope<T>).data ?? (payload as T);
  }
  return payload as T;
};

const toUtcStartOfDayISOString = (date: Date) =>
  new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
  ).toISOString();

const toUtcEndOfDayISOString = (date: Date) =>
  new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    ),
  ).toISOString();

const getLastSixMonthsRange = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return {
    start: toUtcStartOfDayISOString(start),
    end: toUtcEndOfDayISOString(end),
  };
};

const getCurrentMonthToDateRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    start: toUtcStartOfDayISOString(start),
    end: toUtcEndOfDayISOString(end),
  };
};

export async function getProjectReport(params: MetricsParams = {}) {
  const requestParams = withProjectScope(params);
  const response = await api.get<ApiEnvelope<ProjectReportResponse>>(
    "/form-response/metrics/project-report",
    {
      params: cleanParams(requestParams as Record<string, unknown>),
    },
  );

  return unwrapResponse<ProjectReportResponse>(response.data);
}

export async function getFormFilters(params: MetricsParams = {}) {
  const requestParams = withProjectScope(params);
  const response = await api.get<ApiEnvelope<FormFiltersResponse>>(
    "/form-response/metrics/form-filters",
    {
      params: cleanParams({
        ...(requestParams as Record<string, unknown>),
      }),
    },
  );

  return unwrapResponse<FormFiltersResponse>(response.data);
}

export async function getGeneralMetrics(params: MetricsParams = {}) {
  const requestParams = withProjectScope(params);
  const { start, end } = requestParams;
  const { start: defaultMonthStart, end: defaultMonthEnd } =
    getLastSixMonthsRange();
  const { start: defaultDayStart, end: defaultDayEnd } =
    getCurrentMonthToDateRange();

  return getProjectReport({
    ...requestParams,
    monthStart: requestParams.monthStart ?? start ?? defaultMonthStart,
    monthEnd: requestParams.monthEnd ?? end ?? defaultMonthEnd,
    dayStart: requestParams.dayStart ?? start ?? defaultDayStart,
    dayEnd: requestParams.dayEnd ?? end ?? defaultDayEnd,
  });
}

export async function getOpinionReportMetrics(params: MetricsParams = {}) {
  const requestParams = withProjectScope(params);
  const { start, end } = requestParams;
  const { start: defaultMonthStart, end: defaultMonthEnd } =
    getLastSixMonthsRange();
  const { start: defaultDayStart, end: defaultDayEnd } =
    getCurrentMonthToDateRange();

  const response = await api.get<ApiEnvelope<OpinionReportResponse>>(
    "/form-response/metrics/report",
    {
      params: cleanParams({
        ...(requestParams as Record<string, unknown>),
        monthStart: requestParams.monthStart ?? start ?? defaultMonthStart,
        monthEnd: requestParams.monthEnd ?? end ?? defaultMonthEnd,
        dayStart: requestParams.dayStart ?? start ?? defaultDayStart,
        dayEnd: requestParams.dayEnd ?? end ?? defaultDayEnd,
        limits: requestParams.limits ?? {
          opiniao: 10,
          bairro: 10,
        },
      }),
    },
  );

  return unwrapResponse<OpinionReportResponse>(response.data);
}

export async function getOpinionFilterOptions(params: MetricsParams = {}) {
  const requestParams = withProjectScope(params);
  const response = await api.get<ApiEnvelope<OpinionFilterOptionsResponse>>(
    "/form-response/metrics/filters",
    {
      params: cleanParams({
        projetoId: requestParams.projetoId,
        formVersionId: requestParams.formVersionId,
        start: requestParams.start,
        end: requestParams.end,
        temas: requestParams.temas,
        tipoOpiniao: requestParams.tipoOpiniao,
        genero: requestParams.genero,
        bairros: requestParams.bairros,
        faixaEtaria: requestParams.faixaEtaria,
        limit: requestParams.limitValuesPerField ?? 200,
      }),
    },
  );

  return unwrapResponse<OpinionFilterOptionsResponse>(response.data);
}

