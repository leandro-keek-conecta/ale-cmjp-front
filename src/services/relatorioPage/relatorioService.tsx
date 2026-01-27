import { api } from "../api/api";

export async function getMetrics() {
  const projetoId = 5;

  const [status, temas, bairros, genero, campanha, tipos, mes, dia] =
    await Promise.all([
      api.get("/form-response/metrics/status-funnel", {
        params: { projetoId },
      }),
      api.get("/form-response/metrics/distribution", {
        params: { projetoId, fieldName: "opiniao", limit: 10 },
      }),
      api.get("/form-response/metrics/distribution", {
        params: { projetoId, fieldName: "bairro", limit: 10 },
      }),
      api.get("/form-response/metrics/distribution", {
        params: { projetoId, fieldName: "genero" },
      }),
      api.get("/form-response/metrics/distribution", {
        params: { projetoId, fieldName: "campanha" },
      }),
      api.get("/form-response/metrics/distribution", {
        params: { projetoId, fieldName: "tipo_opiniao" },
      }),
      api.get("/form-response/metrics/timeseries", {
        params: { projetoId, interval: "month", dateField: "createdAt" },
      }),
      api.get("/form-response/metrics/timeseries", {
        params: {
          projetoId,
          interval: "day",
          dateField: "createdAt",
          start: "2026-01-01",
          end: "2026-01-31",
        },
      }),
    ]);

  return {
    statusFunnel: status.data.data,
    topTemas: temas.data.data,
    topBairros: bairros.data.data,
    opinionsByGender: genero.data.data,
    campaignAcceptance: campanha.data.data,
    tipoOpiniao: tipos.data.data,
    opinionsByMonth: mes.data.data,
    opinionsByDay: dia.data.data,
  };
}
