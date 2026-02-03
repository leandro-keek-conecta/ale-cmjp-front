import { api } from "../api/api";

export async function getMetrics() {
  const projetoId = 5;
  const { start: monthStart, end: monthEnd } = getLastSixMonthsRange();
  const { start: dayStart, end: dayEnd } = getCurrentMonthToDateRange();

  const response = await api.get("/form-response/metrics/report", {
    params: {
      projetoId,
      monthStart,
      monthEnd,
      dayStart,
      dayEnd,
      limits: {
        opiniao: 10,
        bairro: 10,
      },
    },
  });

  return response.data.data;
}

const toUtcStartOfDayISOString = (date: Date) =>
  new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  ).toISOString();

const toUtcEndOfDayISOString = (date: Date) =>
  new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  ).toISOString();

const getLastSixMonthsRange = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return { start: toUtcStartOfDayISOString(start), end: toUtcEndOfDayISOString(end) };
};

const getCurrentMonthToDateRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { start: toUtcStartOfDayISOString(start), end: toUtcEndOfDayISOString(end) };
};
