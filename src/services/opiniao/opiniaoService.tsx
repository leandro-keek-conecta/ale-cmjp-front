
import { api } from "../api/api";
import type { Opinion } from "../../pages/home/HomePage";




export async function getAllOpinions(): Promise<Opinion[]> {
  const response = await api.post("", {
    action: "getAll",
    entity: "opiniao",
  });
  const data = response?.data?.data;
  return Array.isArray(data) ? data : []; // garante array mesmo quando a API não retornar lista
}
