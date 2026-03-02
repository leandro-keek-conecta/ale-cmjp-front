const normalizeBase = (value: string) => value.trim().replace(/\/+$/g, "");

export const API_ORIGIN = normalizeBase(
  import.meta.env.VITE_API_URL || "https://ouvidoria-api.keekconecta.com.br/",
);

export const API_BASE_URL = `${API_ORIGIN}/escuta-cidada-api`;
