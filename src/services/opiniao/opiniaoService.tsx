import { api } from "../api/api";
import type { Opinion } from "../../pages/home/HomePage";
import type { OpinionFormValues } from "../../@types/opiniao";

const getArrayPayload = (data: unknown) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const candidates = [
      (data as any).data,
      (data as any).results,
      (data as any).result,
      (data as any).rows,
      (data as any).items,
    ];
    return candidates.find(Array.isArray) ?? [];
  }
  return [];
};

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
  return getArrayPayload(data);
}

export async function getTodayOpinions(): Promise<Opinion[]> {
  const response = await api.post("", {
    action: "filterByToday",
    entity: "opiniao",
  });
  console.log("API response:", response);
  const data = response?.data;
  return getArrayPayload(data);
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

