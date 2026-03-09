import type { ProjetoAccessLevel } from "../types/IUserType";
import { normalizeStringList } from "./userProjectAccess";

export type RawUserProject = {
  id?: number | null;
  projetoId?: number | null;
  nome?: string | null;
  name?: string | null;
  slug?: string | null;
  projetoSlug?: string | null;
  projectSlug?: string | null;
  url?: string | null;
  token?: string | null;
  hiddenTabs?: string[] | null;
  allowedThemes?: string[] | null;
  temasPermitidos?: string[] | null;
  temasDoProjeto?: string[] | null;
  projectThemes?: string[] | null;
  projectThemesLoaded?: boolean | null;
  access?: ProjetoAccessLevel | null;
  projeto?: RawUserProject | null;
};

export interface ProjectSelectionPayload {
  id?: number | null;
  name?: string | null;
  slug?: string | null;
  token?: string | null;
  hiddenTabs?: string[] | null;
  allowedThemes?: string[] | null;
  temasPermitidos?: string[] | null;
  projectThemes?: string[] | null;
  projectThemesLoaded?: boolean | null;
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
  const rawSlug =
    fallback?.slug ??
    fallback?.projetoSlug ??
    fallback?.projectSlug ??
    fallback?.url ??
    project.slug ??
    project.projetoSlug ??
    project.projectSlug ??
    project.url ??
    "";
  const slug =
    typeof rawSlug === "string"
      ? rawSlug
          .trim()
          .replace(/^https?:\/\/[^/]+\/form\//i, "")
          .replace(/^\/+|\/+$/g, "")
      : "";

  const hiddenTabs =
    project.hiddenTabs ?? nested?.hiddenTabs ?? fallback?.hiddenTabs ?? [];
  const allowedThemes =
    project.temasPermitidos ??
    project.allowedThemes ??
    nested?.allowedThemes ??
    nested?.temasPermitidos ??
    fallback?.allowedThemes ??
    fallback?.temasPermitidos ??
    [];
  const rawProjectThemes =
    project.projectThemes ??
    project.temasDoProjeto ??
    nested?.projectThemes ??
    nested?.temasDoProjeto ??
    fallback?.projectThemes ??
    fallback?.temasDoProjeto;
  const projectThemes = normalizeStringList(rawProjectThemes);
  const explicitProjectThemesLoaded =
    typeof project.projectThemesLoaded === "boolean"
      ? project.projectThemesLoaded
      : typeof nested?.projectThemesLoaded === "boolean"
        ? nested.projectThemesLoaded
        : typeof fallback?.projectThemesLoaded === "boolean"
          ? fallback.projectThemesLoaded
          : undefined;
  const projectThemesLoaded =
    explicitProjectThemesLoaded ?? rawProjectThemes !== undefined;

  return {
    id,
    name,
    slug,
    access: isProjetoAccessLevel(
      project.access ?? nested?.access ?? fallback?.access,
    )
      ? ((project.access ??
          nested?.access ??
          fallback?.access) as ProjetoAccessLevel)
      : "FULL_ACCESS",
    hiddenTabs: normalizeStringList(hiddenTabs),
    allowedThemes: normalizeStringList(allowedThemes),
    temasPermitidos: normalizeStringList(allowedThemes),
    projectThemes,
    projectThemesLoaded,
  };
};
