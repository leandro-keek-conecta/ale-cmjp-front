import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AUTH_LOGOUT_EVENT,
  CLEAR_PROJECT_SELECTION_EVENT,
  PROJECT_CONTEXT_CHANGED_EVENT,
} from "@/constants/events";
import { getActiveProject, type ProjectLike, PROJECT_CONTEXT_KEY } from "@/utils/project";
import {
  normalizeProjectFromUser,
  type ProjectSelectionPayload,
  type RawUserProject,
} from "@/utils/projectSelection";
import { normalizeStringList } from "@/utils/userProjectAccess";

type ActiveProjectContextValue = {
  project: ProjectSelectionPayload | null;
  projectId: number | null;
  projectName: string;
  projectSlug: string;
  hiddenTabs: string[];
  allowedThemes: string[];
  temasPermitidos: string[];
  projectThemes: string[];
  projectThemesLoaded: boolean;
  hasThemeScope: boolean;
  updateProjectThemes: (themes: string[]) => void;
  refreshProjectContext: () => void;
};

const ProjectContext = createContext<ActiveProjectContextValue | undefined>(
  undefined,
);

function readProjectContext(): ProjectSelectionPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(PROJECT_CONTEXT_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as ProjectSelectionPayload;
      const normalized = normalizeProjectFromUser(parsed as RawUserProject);
      if (typeof normalized.id === "number") {
        return normalized;
      }
    } catch {
      // ignore invalid storage and fallback to user
    }
  }

  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUser) as {
      projeto?: ProjectLike | null;
      projetos?: ProjectLike[] | null;
    };
    const activeProject = getActiveProject(parsedUser);
    if (!activeProject) {
      return null;
    }

    const normalized = normalizeProjectFromUser(activeProject as RawUserProject);
    return typeof normalized.id === "number" ? normalized : null;
  } catch {
    return null;
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectSelectionPayload | null>(() =>
    readProjectContext(),
  );

  const persistProjectContext = useCallback(
    (nextProject: ProjectSelectionPayload | null) => {
      if (typeof window === "undefined") {
        return;
      }

      if (!nextProject || typeof nextProject.id !== "number") {
        localStorage.removeItem(PROJECT_CONTEXT_KEY);
        return;
      }

      localStorage.setItem(PROJECT_CONTEXT_KEY, JSON.stringify(nextProject));
    },
    [],
  );

  useEffect(() => {
    const syncProjectContext = () => {
      setProject(readProjectContext());
    };

    window.addEventListener(PROJECT_CONTEXT_CHANGED_EVENT, syncProjectContext);
    window.addEventListener(CLEAR_PROJECT_SELECTION_EVENT, syncProjectContext);
    window.addEventListener(AUTH_LOGOUT_EVENT, syncProjectContext);
    window.addEventListener("storage", syncProjectContext);

    return () => {
      window.removeEventListener(
        PROJECT_CONTEXT_CHANGED_EVENT,
        syncProjectContext,
      );
      window.removeEventListener(
        CLEAR_PROJECT_SELECTION_EVENT,
        syncProjectContext,
      );
      window.removeEventListener(AUTH_LOGOUT_EVENT, syncProjectContext);
      window.removeEventListener("storage", syncProjectContext);
    };
  }, []);

  const updateProjectThemes = useCallback(
    (themes: string[]) => {
      setProject((currentProject) => {
        if (!currentProject || typeof currentProject.id !== "number") {
          return currentProject;
        }

        const nextProject: ProjectSelectionPayload = {
          ...currentProject,
          projectThemes: normalizeStringList(themes),
          projectThemesLoaded: true,
        };

        persistProjectContext(nextProject);
        return nextProject;
      });
    },
    [persistProjectContext],
  );

  const value = useMemo<ActiveProjectContextValue>(
    () => {
      const scopedThemes = Array.isArray(project?.temasPermitidos)
        ? project.temasPermitidos
        : Array.isArray(project?.allowedThemes)
          ? project.allowedThemes
          : [];
      const projectThemes = Array.isArray(project?.projectThemes)
        ? project.projectThemes
        : [];

      return {
        project,
        projectId: typeof project?.id === "number" ? project.id : null,
        projectName: typeof project?.name === "string" ? project.name : "",
        projectSlug: typeof project?.slug === "string" ? project.slug : "",
        hiddenTabs: Array.isArray(project?.hiddenTabs) ? project.hiddenTabs : [],
        allowedThemes: scopedThemes,
        temasPermitidos: scopedThemes,
        projectThemes,
        projectThemesLoaded: project?.projectThemesLoaded === true,
        hasThemeScope: scopedThemes.length > 0,
        updateProjectThemes,
        refreshProjectContext: () => setProject(readProjectContext()),
      };
    },
    [project, updateProjectThemes],
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within ProjectProvider");
  }
  return context;
}
