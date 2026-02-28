import { normalizeProjectFromUser, type RawUserProject } from "./projectSelection";

export const PROJECT_CONTEXT_KEY = "projectContext";

export type ProjectLike = {
  id?: number | null;
  projetoId?: number | null;
  nome?: string | null;
  name?: string | null;
  slug?: string | null;
  projetoSlug?: string | null;
  projectSlug?: string | null;
  corHex?: string | null;
  url?: string | null;
  hiddenTabs?: string[] | null;
  allowedThemes?: string[] | null;
  access?: unknown;
  projeto?: ProjectLike | null;
  [key: string]: unknown;
};

type UserWithProjects = {
  projeto?: ProjectLike | null;
  projetos?: ProjectLike[] | null;
  [key: string]: unknown;
} | null | undefined;

export function getActiveProject(user: UserWithProjects): ProjectLike | null {
  if (!user || typeof user !== "object") {
    return null;
  }

  if (user.projeto && typeof user.projeto === "object") {
    return user.projeto as ProjectLike;
  }

  const projects = Array.isArray(user.projetos) ? user.projetos : [];
  if (!projects.length) {
    return null;
  }

  const firstProject = projects[0];
  if (firstProject && typeof firstProject === "object") {
    const nested =
      (firstProject as ProjectLike).projeto &&
      typeof (firstProject as ProjectLike).projeto === "object"
        ? (firstProject as ProjectLike).projeto
        : null;
    if (nested) {
      return nested as ProjectLike;
    }
  }

  return firstProject ?? null;
}

export function getProjectId(
  project: ProjectLike | null | undefined
): number | null {
  if (!project || typeof project !== "object") {
    return null;
  }

  if (typeof project.projetoId === "number") {
    return project.projetoId;
  }

  if (typeof project.id === "number") {
    return project.id;
  }

  const nested =
    project.projeto && typeof project.projeto === "object"
      ? (project.projeto as ProjectLike)
      : null;

  if (nested) {
    if (typeof nested.id === "number") {
      return nested.id;
    }
    if (typeof nested.projetoId === "number") {
      return nested.projetoId;
    }
  }

  return null;
}

export function getProjectSlug(
  project: ProjectLike | null | undefined,
): string | null {
  if (!project || typeof project !== "object") {
    return null;
  }

  const directSlug =
    typeof project.slug === "string"
      ? project.slug.trim()
      : typeof project.projetoSlug === "string"
        ? project.projetoSlug.trim()
        : typeof project.projectSlug === "string"
          ? project.projectSlug.trim()
          : "";
  if (directSlug) {
    return directSlug;
  }

  const nested =
    project.projeto && typeof project.projeto === "object"
      ? (project.projeto as ProjectLike)
      : null;
  if (nested) {
    const nestedSlug = getProjectSlug(nested);
    if (nestedSlug) {
      return nestedSlug;
    }
  }

  return null;
}

export function storeProjectContext(project: ProjectLike | null | undefined) {
  if (typeof window === "undefined") {
    return null;
  }

  const normalized = normalizeProjectFromUser(project as RawUserProject);
  if (typeof normalized.id !== "number") {
    return null;
  }

  try {
    localStorage.setItem(PROJECT_CONTEXT_KEY, JSON.stringify(normalized));
  } catch {
    return null;
  }

  return normalized;
}

export function getStoredProjectId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawContext = localStorage.getItem(PROJECT_CONTEXT_KEY);
  if (rawContext) {
    try {
      const parsed = JSON.parse(rawContext) as { id?: number | null };
      if (typeof parsed?.id === "number") {
        return parsed.id;
      }
    } catch {
      // ignore parse errors and fall back to user storage
    }
  }

  const userString = localStorage.getItem("user");
  if (!userString) {
    return null;
  }

  try {
    const user = JSON.parse(userString) as UserWithProjects;
    const project = getActiveProject(user);
    return getProjectId(project);
  } catch {
    return null;
  }
}

export function getStoredProjectSlug(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawContext = localStorage.getItem(PROJECT_CONTEXT_KEY);
  if (rawContext) {
    try {
      const parsed = JSON.parse(rawContext) as {
        slug?: string | null;
        projetoSlug?: string | null;
        projectSlug?: string | null;
      };
      const contextSlug =
        (typeof parsed?.slug === "string" ? parsed.slug.trim() : "") ||
        (typeof parsed?.projetoSlug === "string"
          ? parsed.projetoSlug.trim()
          : "") ||
        (typeof parsed?.projectSlug === "string"
          ? parsed.projectSlug.trim()
          : "");
      if (contextSlug) {
        return contextSlug;
      }
    } catch {
      // ignore parse errors and fall back to user storage
    }
  }

  const userString = localStorage.getItem("user");
  if (!userString) {
    return null;
  }

  try {
    const user = JSON.parse(userString) as UserWithProjects;
    const project = getActiveProject(user);
    return getProjectSlug(project);
  } catch {
    return null;
  }
}

export function ensureThemeColor(color: unknown, fallback: string): string {
  if (typeof color !== "string") {
    return fallback;
  }

  const sanitized = color.trim();
  return sanitized.length ? sanitized : fallback;
}
