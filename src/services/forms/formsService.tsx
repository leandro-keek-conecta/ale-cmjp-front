import { apiPublic } from "../apiPublic/api";
import { api } from "../api/api";

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
  const hasUsefulEditData = (form: Record<string, unknown>) => {
    const nestedForm =
      (form.form as Record<string, unknown> | undefined) ?? undefined;

    const hasActiveVersion = Boolean(
      form.activeVersion ||
        form.active_version ||
        form.currentVersion ||
        form.latestVersion ||
        nestedForm?.activeVersion ||
        nestedForm?.active_version,
    );

    const hasFieldsInRoot = Array.isArray(form.fields);
    const hasSlug = Boolean(form.slug || form.formSlug || nestedForm?.slug);

    return hasActiveVersion || hasFieldsInRoot || hasSlug;
  };

  try {
    const response = await api.get("/form/list");
    const moduleForms =
      response?.data?.data?.forms ??
      response?.data?.forms ??
      response?.data?.data ??
      [];
    if (
      Array.isArray(moduleForms) &&
      moduleForms.some(
        (form) => form && typeof form === "object" && hasUsefulEditData(form),
      )
    ) {
      return moduleForms;
    }
  } catch {
    // fallback para rota publica enquanto a rota autenticada nao estiver disponivel
  }

  const response = await apiPublic.get(`/public/projetos/${slug}/forms`);
  const publicForms = response?.data?.data?.forms ?? response?.data?.forms;
  return Array.isArray(publicForms) ? publicForms : [];
}

export async function createForm(payload: Record<string, unknown>) {
  return api.post("/form/create", payload);
}

export async function updateFormById(
  formId: number | string,
  payload: Record<string, unknown>,
) {
  return api.patch(`/form/update/${formId}`, payload);
}
