import { api } from "../api/api";
import type { Opinion } from "../../pages/Panorama/Panorama";
import type { OpinionFormValues } from "../../types/opiniao";

/*
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");

 const today = `${year}-${month}-${day}`;
const oneYearAgo = `${year - 1}-${month}-${day}`;

type OpinionsQuery = {
  projetoId: number;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
};

type OpinionsRawResponse = {
  total?: number;
  items?: Opinion[];
  limit?: number;
  offset?: number;
}; */

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

export async function getAllOpinions(projectId: number) {
  const response = await api.get(`/form-response/raw?projetoId=${projectId}&select=nome,telefone,ano_nascimento,genero,bairro,campanha,opiniao,outra_opiniao,tipo_opiniao,texto_opiniao`);
  return response?.data;
}

export async function getTodayOpinions(): Promise<Opinion[]> {
  const response = await api.post("", {
    action: "filterByToday",
    entity: "opiniao",
  });
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
  const response = await api.post("", {
    action: "create",
    entity: "opiniao",
    payload: { ...data, acao: data.acao || "Registrar opinião" },
  });

  return response;
}
