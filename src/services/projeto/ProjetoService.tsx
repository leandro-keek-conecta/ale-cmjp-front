import { api } from "../api/api";
import type { ProjetoBasicFormValues } from "@/types/IProjetoType";

export default async function getProjects() {
  const response = await api.get("projeto/list");
  return response.data?.data ?? response.data;
}

export async function createProject(payload: ProjetoBasicFormValues) {
  const response = await api.post("projeto/create", payload);
  return response.data?.data ?? response.data;
}

export async function updateProject(
  id: number,
  payload: ProjetoBasicFormValues,
) {
  const response = await api.patch(`projeto/update/${id}`, payload);
  return response.data?.data ?? response.data;
}

export function deleteProject(id: number) {
  const response = api.delete(`projeto/delete/${id}`);
  return response;
}
