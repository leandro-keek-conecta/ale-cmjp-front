
import { api } from "../api/api";
import type { Opinion } from "../../pages/home/HomePage";




export async function getAllOpinions(): Promise<Opinion[]> {
  const response = await api.post("", {
    action: "getAll",
    entity: "opiniao",
  });
  return response.data.data; // ? acessa corretamente o array de projetos
}
