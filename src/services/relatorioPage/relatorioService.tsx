import { api } from "../api/api";
import { getStoredProjectId } from "../../utils/project";

export type MetricsParams = {
  start?: string;
  end?: string;
  temas?: string | string[];
  tipoOpiniao?: string;
  genero?: string;
  bairros?: string | string[];
  faixaEtaria?: string;
};

export async function getMetrics(params: MetricsParams = {}) {
  const projetoId = getStoredProjectId();
  if (!projetoId) {
    throw new Error("Projeto não encontrado para buscar relatórios.");
  }
  const {
    start,
    end,
    temas,
    tipoOpiniao,
    genero,
    bairros,
    faixaEtaria,
  } = params;

  const {
    start: defaultMonthStart,
    end: defaultMonthEnd,
  } = getLastSixMonthsRange();
  const {
    start: defaultDayStart,
    end: defaultDayEnd,
  } = getCurrentMonthToDateRange();

  const monthStart = start ?? defaultMonthStart;
  const monthEnd = end ?? defaultMonthEnd;
  const dayStart = start ?? defaultDayStart;
  const dayEnd = end ?? defaultDayEnd;

  const requestParams: Record<string, unknown> = {
    projetoId,
    monthStart,
    monthEnd,
    dayStart,
    dayEnd,
    limits: {
      opiniao: 10,
      bairro: 10,
    },
  };

  if (start) requestParams.start = start;
  if (end) requestParams.end = end;
  if (temas && (Array.isArray(temas) ? temas.length : true)) {
    requestParams.temas = temas;
  }
  if (tipoOpiniao) requestParams.tipoOpiniao = tipoOpiniao;
  if (genero) requestParams.genero = genero;
  if (bairros && (Array.isArray(bairros) ? bairros.length : true)) {
    requestParams.bairros = bairros;
  }
  if (faixaEtaria) requestParams.faixaEtaria = faixaEtaria;

  const response = await api.get("/form-response/metrics/report", {
    params: requestParams,
  });

  return response.data.data;
}

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
