import { api } from "../api/api";

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");

const today = `${year}-${month}-${day}`;
const oneYearAgo = `${year - 1}-${month}-${day}`;

export async function getTema(projetoId: number) {
  // use "opiniao" se esse for o campo real do tema
  return api.get(
    `/form-response/metrics/distribution?fieldName=opiniao&projetoId=${projetoId}&start=${oneYearAgo}&end=${today}`
  );
}

export async function getFiltros(projetoId: number) {
  return api.get(
    `/form-response/metrics/filters?projetoId=${projetoId}&limit=200`
  );
}

export async function getMetricas(projetoId: number) {
  return api.get(
    `/form-response/metrics/summary?projetoId=${projetoId}&day=2026-01-29&limitTopThemes=5&limitTopNeighborhoods=5`
  );
}
