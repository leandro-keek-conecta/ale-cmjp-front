import { apiPublic } from "../apiPublic/api";

import type { Opinion } from "../../pages/Panorama/Panorama";
import type { UserFormValues } from "../../types/user";

export default function getForms(slug: string, projectName: string) {
  const response = apiPublic.get(
    `/public/projetos/${projectName}/forms/slug/${slug}`,
  );
  return response;
}

export async function createUSer(user: UserFormValues): Promise<Opinion[]> {
  const response = await apiPublic.post("", {
    action: "create",
    entity: "usuario",
    payload: user,
  });
  const data = response?.data;
  return Array.isArray(data) ? data : []; // garante array mesmo quando a API não retornar lista
}

export async function listForms(slug: string) {
  const response = await apiPublic.get(`/public/projetos/${slug}/forms`);
  const data = response?.data?.data?.forms ?? response?.data?.forms;
  return Array.isArray(data) ? data : [];
}
