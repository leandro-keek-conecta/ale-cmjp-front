import { api } from "../api/api";
import type { Opinion } from "../../pages/home/HomePage";
import type { OpinionFormValues } from "../../@types/opiniao";

type SubmitSummary = Partial<
  Pick<
    OpinionFormValues,
    | "usuario_id"
    | "opiniao"
    | "outra_opiniao"
    | "tipo_opiniao"
    | "texto_opiniao"
    | "horario_opiniao"
    | "acao"
  >
>;

export async function getAllOpinions(): Promise<Opinion[]> {
  const response = await api.post("", {
    action: "getAll",
    entity: "opiniao",
  });
  console.log("API response:", response);
  const data = response?.data;
  return Array.isArray(data) ? data : []; // garante array mesmo quando a API não retornar lista
}

export async function getTodayOpinions(): Promise<Opinion[]> {
  const response = await api.post("", {
    action: "filterByToday",
    entity: "opiniao",
  });
  console.log("API response:", response);
  const data = response?.data;
  return Array.isArray(data) ? data : []; // garante array mesmo quando a API não retornar lista
}

export async function getUpDistricts() {
  const response = await api.post("", {
    action: "getUpDistrict",
    entity: "opiniao",
  });

  const data = response?.data;
  return data;
}

export async function submitOpinion(data: SubmitSummary) {
  console.log("fui chamado")
  const response = await api.post("", {
    action: "create",
    entity: "opiniao",
    payload: { ...data, acao: data.acao || "Registrar opinião" },
  });

  return response;
}
