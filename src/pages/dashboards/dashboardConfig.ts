export type DashboardEntry = {
  id: string;
  title: string;
  provider: string;
  url: string;
};

// Ajuste esta allowlist conforme os dominios que podem ser embedados pela aplicacao.
export const DASHBOARD_ALLOWLIST = [
  "app.powerbi.com",
  "demo.metabase.com",
  "lookerstudio.google.com",
];

// Mapeamento seguro de dashboards publicos por ID.
// Preferir usar esta abordagem em producao para evitar URLs arbitrarias.
export const DASHBOARD_MAP: Record<string, DashboardEntry> = {
  "powerbi-sample": {
    id: "powerbi-sample",
    title: "Retail Analytics - Power BI",
    provider: "Power BI",
    url: "https://app.powerbi.com/view?r=eyJrIjoiZjI1MzI2MmQtMTNmYS00ZDYyLTlmZjMtZjYwZWY0MzBiNjk4IiwidCI6IjRhYWQ2MGI1LWQ0ODQtNGIyNi1hZWQwLTYxMmU0MjBlODAzMyIsImMiOjZ9",
  },
  "metabase-sample": {
    id: "metabase-sample",
    title: "Sample Orders - Metabase Demo",
    provider: "Metabase",
    url: "https://demo.metabase.com/public/dashboard/1d8f91c2-98a0-4e31-a52a-22728a741b52",
  },
};

export const DEFAULT_DASHBOARD_ID = "powerbi-sample";
