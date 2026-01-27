import axios from "axios";

const api = axios.create({
  baseURL:"http://localhost:5443/escuta-cidada-api", // ex: http://localhost:3333/escuta-cidada-api
});

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2OTQ1MzU1MiwiZXhwIjoxNzY5NDYwNzUyfQ.A5vVraOPKUQh61Qdh4I80DpikEqv9DwQS39YxCPpy00` },
});

export async function getMetrics(token: string) {
  const projetoId = 5;

  const [status, temas, bairros, genero, campanha, tipos, mes, dia] =
    await Promise.all([
      api.get("/form-response/metrics/status-funnel", {
        ...authHeaders(token),
        params: { projetoId },
      }),
      api.get("/form-response/metrics/distribution", {
        ...authHeaders(token),
        params: { projetoId, fieldName: "opiniao", limit: 10 },
      }),
      api.get("/form-response/metrics/distribution", {
        ...authHeaders(token),
        params: { projetoId, fieldName: "bairro", limit: 10 },
      }),
      api.get("/form-response/metrics/distribution", {
        ...authHeaders(token),
        params: { projetoId, fieldName: "genero" },
      }),
      api.get("/form-response/metrics/distribution", {
        ...authHeaders(token),
        params: { projetoId, fieldName: "campanha" },
      }),
      api.get("/form-response/metrics/distribution", {
        ...authHeaders(token),
        params: { projetoId, fieldName: "tipo_opiniao" },
      }),
      api.get("/form-response/metrics/timeseries", {
        ...authHeaders(token),
        params: { projetoId, interval: "month", dateField: "createdAt" },
      }),
      api.get("/form-response/metrics/timeseries", {
        ...authHeaders(token),
        params: { projetoId, interval: "day", dateField: "createdAt", start: "2026-01-01", end: "2026-01-31" },
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
