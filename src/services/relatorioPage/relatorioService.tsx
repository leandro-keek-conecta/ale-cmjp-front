import { api } from "../api/api";

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
  const projetoId = 5;
  const {
    start,
    end,
    temas,
    tipoOpiniao,
    genero,
    bairros,
    faixaEtaria
  } = params;

  const requestParams: Record<string, unknown> = { projetoId };
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
