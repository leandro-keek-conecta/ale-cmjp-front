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

const toDateOnly = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const getLastSixMonthsRange = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return { start: toDateOnly(start), end: toDateOnly(end) };
};

const getCurrentMonthToDateRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { start: toDateOnly(start), end: toDateOnly(end) };
};
