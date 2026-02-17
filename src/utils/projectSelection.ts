import type { ProjetoAccessLevel } from "../types/IUserType";

export type RawUserProject = {
  id?: number | null;
  projetoId?: number | null;
  nome?: string | null;
  name?: string | null;
  url?: string | null;
  token?: string | null;
  hiddenTabs?: string[] | null;
  access?: ProjetoAccessLevel | null;
  projeto?: RawUserProject | null;
};

export interface ProjectSelectionPayload {
  id?: number | null;
  name?: string | null;
  token?: string | null;
  hiddenTabs?: string[] | null;
  access?: ProjetoAccessLevel | null;
}

export const isProjetoAccessLevel = (
  value: unknown,
): value is ProjetoAccessLevel => {
  return (
    value === "FULL_ACCESS" ||
    value === "AUTOMATIONS_ONLY" ||
    value === "DASH_ONLY"
  );
};

export const normalizeProjectFromUser = (
  project: RawUserProject | null | undefined,
): ProjectSelectionPayload => {
  if (!project) {
    return {
      id: null,
      name: "",
      hiddenTabs: [],
      access: "FULL_ACCESS",
    };
  }

  const nested =
    project.projeto && typeof project.projeto === "object"
      ? project.projeto
      : null;
  const fallback = nested ?? project;

  const id =
    typeof project.projetoId === "number"
      ? project.projetoId
      : typeof fallback?.id === "number"
        ? fallback.id
        : typeof project.id === "number"
          ? project.id
          : null;

  const rawName =
    fallback?.nome ?? fallback?.name ?? project.nome ?? project.name ?? "";
  const name =
    typeof rawName === "string"
      ? rawName
      : rawName != null
        ? String(rawName)
        : "";

  const hiddenTabs =
    project.hiddenTabs ?? nested?.hiddenTabs ?? fallback?.hiddenTabs ?? [];

  return {
    id,
    name,
    access: isProjetoAccessLevel(
      project.access ?? nested?.access ?? fallback?.access,
    )
      ? ((project.access ??
          nested?.access ??
          fallback?.access) as ProjetoAccessLevel)
      : "FULL_ACCESS",
    hiddenTabs,
  };
};
