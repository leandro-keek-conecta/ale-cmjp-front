import { api } from "../api/api";

const getDateRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;
  const oneYearAgo = `${year - 1}-${month}-${day}`;
  return { today, oneYearAgo };
};

export async function getTema(projetoId: number) {
  const { today, oneYearAgo } = getDateRange();
  // use "opiniao" se esse for o campo real do tema
  return api.get(
    `/form-response/metrics/distribution?fieldName=opiniao&projetoId=${projetoId}&start=${oneYearAgo}&end=${today}`,
  );
}

export async function getFiltros(projetoId: number) {
  return api.get(`/form-response/metrics/filters?projetoId=${projetoId}`);
}

export async function getMetricas(projetoId: number) {
  const { today } = getDateRange();
  return api.get(
    `/form-response/metrics/summary?projetoId=${projetoId}&day=${today}&limitTopThemes=5&limitTopNeighborhoods=5`,
  );
}
