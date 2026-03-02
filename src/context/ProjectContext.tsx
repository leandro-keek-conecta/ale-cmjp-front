import {
  createContext,
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

type ActiveProjectContextValue = {
  project: ProjectSelectionPayload | null;
  projectId: number | null;
  projectName: string;
  projectSlug: string;
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

  const value = useMemo<ActiveProjectContextValue>(
    () => ({
      project,
      projectId: typeof project?.id === "number" ? project.id : null,
      projectName: typeof project?.name === "string" ? project.name : "",
      projectSlug: typeof project?.slug === "string" ? project.slug : "",
      refreshProjectContext: () => setProject(readProjectContext()),
    }),
    [project],
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
