import { useCallback } from "react";
import { CLEAR_PROJECT_SELECTION_EVENT } from "@/constants/events";
import { PROJECT_CONTEXT_KEY } from "@/utils/project";
import {
  isProjetoAccessLevel,
  type ProjectSelectionPayload,
} from "@/utils/projectSelection";
import type { ProjetoAccessLevel } from "@/types/IUserType";

export type { ProjectSelectionPayload } from "@/utils/projectSelection";

type StoredProjectContext = {
  id: number | null;
  name: string;
  token: string;
  hiddenTabs: string[];
  access: ProjetoAccessLevel;
};

const DEFAULT_ACCESS: ProjetoAccessLevel = "FULL_ACCESS";

const normalizeHiddenTabs = (tabs: unknown): string[] => {
  if (!Array.isArray(tabs)) {
    return [];
  }

  return tabs
    .filter((tab): tab is string => typeof tab === "string")
    .map((tab) => tab.trim())
    .filter(Boolean);
};

const normalizeProjectPayload = (
  payload: ProjectSelectionPayload | null | undefined,
): StoredProjectContext => {
  const id = typeof payload?.id === "number" ? payload.id : null;
  const name = typeof payload?.name === "string" ? payload.name : "";
  const token = typeof payload?.token === "string" ? payload.token : "";
  const hiddenTabs = normalizeHiddenTabs(payload?.hiddenTabs);
  const access = isProjetoAccessLevel(payload?.access)
    ? payload.access
    : DEFAULT_ACCESS;

  return {
    id,
    name,
    token,
    hiddenTabs,
    access,
  };
};

const getCandidateProjectId = (candidate: any): number | null => {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  if (typeof candidate.projetoId === "number") {
    return candidate.projetoId;
  }

  if (typeof candidate.id === "number") {
    return candidate.id;
  }

  if (candidate.projeto && typeof candidate.projeto === "object") {
    if (typeof candidate.projeto.id === "number") {
      return candidate.projeto.id;
    }
    if (typeof candidate.projeto.projetoId === "number") {
      return candidate.projeto.projetoId;
    }
  }

  return null;
};

const syncSelectedProjectOnUser = (selection: StoredProjectContext) => {
  if (typeof window === "undefined" || typeof selection.id !== "number") {
    return;
  }

  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    return;
  }

  try {
    const user = JSON.parse(rawUser) as any;
    const userProjects = Array.isArray(user?.projetos) ? user.projetos : [];

    const selectedProjectEntry = userProjects.find(
      (project: any) => getCandidateProjectId(project) === selection.id,
    );

    if (!selectedProjectEntry) {
      return;
    }

    const baseProject =
      selectedProjectEntry?.projeto &&
      typeof selectedProjectEntry.projeto === "object"
        ? selectedProjectEntry.projeto
        : selectedProjectEntry;

    const name =
      selection.name ||
      baseProject?.nome ||
      baseProject?.name ||
      user?.projeto?.nome ||
      user?.projeto?.name ||
      "";

    const nextUser = {
      ...user,
      projeto: {
        ...baseProject,
        id: selection.id,
        projetoId: selection.id,
        nome: name,
        name,
        token: selection.token || baseProject?.token || "",
        hiddenTabs: selection.hiddenTabs,
        access: selection.access,
      },
    };

    localStorage.setItem("user", JSON.stringify(nextUser));
  } catch {
    // ignore malformed user storage
  }
};

export function useProjectSelection() {
  const selectProject = useCallback(
    (payload: ProjectSelectionPayload): StoredProjectContext => {
      const normalized = normalizeProjectPayload(payload);

      if (typeof window === "undefined") {
        return normalized;
      }

      if (typeof normalized.id === "number") {
        localStorage.setItem(PROJECT_CONTEXT_KEY, JSON.stringify(normalized));
        syncSelectedProjectOnUser(normalized);
      } else {
        localStorage.removeItem(PROJECT_CONTEXT_KEY);
      }

      return normalized;
    },
    [],
  );

  const resetProject = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(PROJECT_CONTEXT_KEY);
    window.dispatchEvent(new Event(CLEAR_PROJECT_SELECTION_EVENT));
  }, []);

  const getSelectedProject = useCallback((): StoredProjectContext | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = localStorage.getItem(PROJECT_CONTEXT_KEY);
    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as ProjectSelectionPayload;
      return normalizeProjectPayload(parsed);
    } catch {
      return null;
    }
  }, []);

  return { selectProject, resetProject, getSelectedProject };
}
