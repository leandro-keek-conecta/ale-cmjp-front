import { api } from "../api/api";
import {
  getStoredAllowedThemes,
  mergeRequestedThemesWithScope,
} from "../../utils/userProjectAccess";

const getDateRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;
  const oneYearAgo = `${year - 1}-${month}-${day}`;
  return { today, oneYearAgo };
};

const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === ""),
    ),
  );

const withThemeScope = (
  projetoId: number,
  temas?: string | string[],
) => {
  const allowedThemes = getStoredAllowedThemes(projetoId);

  return {
    projetoId,
    temas: mergeRequestedThemesWithScope(temas, allowedThemes),
  };
};

export async function getTema(projetoId: number) {
  const { today, oneYearAgo } = getDateRange();
  const scopedParams = withThemeScope(projetoId);

  return api.get("/form-response/metrics/distribution", {
    params: cleanParams({
      fieldName: "opiniao",
      projetoId: scopedParams.projetoId,
      start: oneYearAgo,
      end: today,
      temas: scopedParams.temas,
    }),
  });
}

export async function getFiltros(projetoId: number) {
  const scopedParams = withThemeScope(projetoId);
  return api.get("/form-response/metrics/filters", {
    params: cleanParams(scopedParams),
  });
}

export async function getFiltrosPorFormulario(
  projetoId: number,
  formId: number,
) {
  const scopedParams = withThemeScope(projetoId);
  return api.get("/form-response/metrics/form-filters", {
    params: cleanParams({
      ...scopedParams,
      formId,
    }),
  });
}

export async function getMetricas(projetoId: number) {
  const { today } = getDateRange();
  const scopedParams = withThemeScope(projetoId);
  return api.get("/form-response/metrics/summary", {
    params: cleanParams({
      ...scopedParams,
      day: today,
      limitTopThemes: 5,
      limitTopNeighborhoods: 5,
    }),
  });
}
