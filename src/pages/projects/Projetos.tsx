import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import styles from "./projetos.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ProjetoAccessLevel } from "@/types/IUserType";
import { useProjectSelection } from "@/hooks/useProjectSelection";
import CardProject from "./cardProject";
import type { ChartDatum } from "@/types/ChartDatum";
import { groupOpinionsByMonthOnly } from "@/utils/retornMonthInDate";
import { isProjetoAccessLevel } from "@/utils/projectSelection";
import { listAllProjects } from "@/services/projeto/ProjetoService";
import type { ThemeChipDatum } from "./cardProject/chips";
import SearchProjects from "./searchOfProjects";
import CabecalhoEstilizado from "@/components/CabecalhoEstilizado";

export type ProjectCardData = {
  id: number;
  name: string;
  actived: boolean;
  access: ProjetoAccessLevel;
  hiddenTabs: string[];
  responsesLast7Days: number;
  responsesByMonthLast12Months: ChartDatum[];
  responsesByTheme: ThemeChipDatum[];
  payload: {
    id: number;
    name: string;
    access: ProjetoAccessLevel;
    hiddenTabs: string[];
    token?: string;
  };
};

type RawProjectMetrics = {
  responsesLast7Days?: unknown;
  responsesByMonthLast12Months?: unknown;
  responsesByTheme?: unknown;
};

type RawProjectUser = {
  id?: unknown;
  access?: unknown;
  hiddenTabs?: unknown;
};

type RawProjectSource = {
  id?: unknown;
  projetoId?: unknown;
  name?: unknown;
  nome?: unknown;
  ativo?: unknown;
  access?: unknown;
  hiddenTabs?: unknown;
  token?: unknown;
  metrics?: unknown;
  users?: unknown;
};

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toSafeString = (value: unknown, fallback = "") => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  return fallback;
};

const normalizeHiddenTabs = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((tab): tab is string => typeof tab === "string")
    .map((tab) => tab.trim())
    .filter(Boolean);
};

const getMetricObject = (value: unknown): RawProjectMetrics => {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as RawProjectMetrics;
};

const normalizeMonthlyMetrics = (value: unknown): ChartDatum[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedForGrouping = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const entry = item as Record<string, unknown>;
      const labelOrDate =
        entry.date ??
        entry.label ??
        entry.month ??
        entry.mes ??
        entry.monthLabel ??
        entry.reference;
      const rawValue =
        entry.count ??
        entry.value ??
        entry.total ??
        entry.responses ??
        entry.quantidade ??
        entry.quantity;

      if (labelOrDate instanceof Date) {
        return {
          date: labelOrDate,
          count: toNumber(rawValue),
        };
      }

      if (typeof labelOrDate === "string") {
        return {
          label: labelOrDate,
          value: toNumber(rawValue),
        };
      }

      return null;
    })
    .filter(Boolean) as Array<
      { label: string; value: number } | { date: string | Date; count: number }
    >;

  const grouped = groupOpinionsByMonthOnly(normalizedForGrouping);
  if (grouped.length) {
    return grouped;
  }

  return value
    .map((item, index) => {
      if (typeof item === "number") {
        return { label: `M${index + 1}`, value: item };
      }
      if (typeof item === "string") {
        return { label: `M${index + 1}`, value: toNumber(item) };
      }
      if (!item || typeof item !== "object") {
        return null;
      }

      const entry = item as Record<string, unknown>;
      const rawLabel =
        entry.label ?? entry.month ?? entry.mes ?? entry.date ?? `M${index + 1}`;
      const rawValue =
        entry.value ??
        entry.count ??
        entry.total ??
        entry.responses ??
        entry.quantidade ??
        entry.quantity;

      return {
        label: String(rawLabel),
        value: toNumber(rawValue),
      };
    })
    .filter((item): item is ChartDatum => item !== null);
};

const normalizeThemeKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const normalizeThemeMetrics = (value: unknown): ThemeChipDatum[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const grouped = new Map<string, ThemeChipDatum>();

  value.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const entry = item as Record<string, unknown>;
    const rawLabel = entry.tema ?? entry.label ?? entry.theme ?? entry.name;
    const label = toSafeString(rawLabel);
    if (!label) {
      return;
    }

    const rawValue =
      entry.total ??
      entry.value ??
      entry.count ??
      entry.responses ??
      entry.quantidade;
    const metricValue = toNumber(rawValue);
    const key = normalizeThemeKey(label);
    const current = grouped.get(key);

    if (current) {
      current.value += metricValue;
      return;
    }

    grouped.set(key, {
      label: toTitleCase(label),
      value: metricValue,
    });
  });

  return Array.from(grouped.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

export default function Projetos() {
  const { user, setUser } = useAuth();
  const { selectProject } = useProjectSelection();
  const navigate = useNavigate();
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectSources, setProjectSources] = useState<RawProjectSource[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const isSuperAdmin = user?.role === "SUPERADMIN";

  useEffect(() => {
    let mounted = true;

    const fallbackSources =
      Array.isArray(user?.projetos) && user.projetos.length
        ? (user.projetos as unknown as RawProjectSource[])
        : user?.projeto
          ? ([user.projeto] as unknown as RawProjectSource[])
          : [];

    const loadProjects = async () => {
      if (typeof user?.id !== "number") {
        if (!mounted) return;
        setProjectSources(fallbackSources);
        setLoadingProjects(false);
        return;
      }

      if (mounted) {
        setLoadingProjects(true);
      }

      try {
        const freshProjects = await listAllProjects(user.id);

        if (!mounted) return;
        setProjectSources(
          Array.isArray(freshProjects)
            ? (freshProjects as RawProjectSource[])
            : fallbackSources,
        );
      } catch (error) {
        console.error("Erro ao atualizar projetos vinculados do usuário:", error);
        if (!mounted) return;
        setProjectSources(fallbackSources);
      } finally {
        if (mounted) {
          setLoadingProjects(false);
        }
      }
    };

    void loadProjects();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const projects = useMemo<ProjectCardData[]>(() => {
    const dedupe = new Set<number>();
    const list: ProjectCardData[] = [];

    projectSources.forEach((source) => {
      const projectId =
        typeof source?.id === "number"
          ? source.id
          : typeof source?.projetoId === "number"
            ? source.projetoId
            : null;

      if (typeof projectId !== "number" || dedupe.has(projectId)) {
        return;
      }

      const metrics = getMetricObject(source.metrics);
      const users = Array.isArray(source.users)
        ? (source.users as RawProjectUser[])
        : [];

      const userAccess = users.find((projectUser) => projectUser?.id === user?.id)?.access;
      const rawAccess = userAccess ?? source.access;
      const access = isProjetoAccessLevel(rawAccess)
        ? rawAccess
        : "FULL_ACCESS";

      const hiddenTabs =
        normalizeHiddenTabs(
          users.find((projectUser) => projectUser?.id === user?.id)?.hiddenTabs,
        ).length > 0
          ? normalizeHiddenTabs(
              users.find((projectUser) => projectUser?.id === user?.id)?.hiddenTabs,
            )
          : normalizeHiddenTabs(source.hiddenTabs);

      const name =
        toSafeString(source.name) ||
        toSafeString(source.nome) ||
        `Projeto ${projectId}`;

      list.push({
        id: projectId,
        name,
        actived: typeof source.ativo === "boolean" ? source.ativo : true,
        access,
        hiddenTabs,
        responsesLast7Days: toNumber(metrics.responsesLast7Days),
        responsesByMonthLast12Months: normalizeMonthlyMetrics(
          metrics.responsesByMonthLast12Months,
        ),
        responsesByTheme: normalizeThemeMetrics(metrics.responsesByTheme),
        payload: {
          id: projectId,
          name,
          access,
          hiddenTabs,
          token: toSafeString(source.token),
        },
      });

      dedupe.add(projectId);
    });

    return list;
  }, [projectSources, user?.id]);

  useEffect(() => {
    if (!projects.length) {
      setSelectedProjectId(null);
      return;
    }

    const exists = projects.some((project) => project.id === selectedProjectId);
    if (!exists && selectedProjectId !== null) {
      setSelectedProjectId(null);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const normalizedSearchTerm = useMemo(
    () => normalizeSearch(searchTerm),
    [searchTerm],
  );

  const filteredProjects = useMemo(() => {
    if (normalizedSearchTerm.length < 3) {
      return projects;
    }

    return projects.filter((project) =>
      normalizeSearch(project.name).includes(normalizedSearchTerm),
    );
  }, [normalizedSearchTerm, projects]);

  const handleSelectProject = useCallback(
    (project: ProjectCardData) => {
      selectProject(project.payload);

      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        try {
          setUser(JSON.parse(rawUser));
        } catch {
          // ignore invalid storage
        }
      }

      navigate("/panorama");
    },
    [navigate, selectProject, setUser],
  );

  const handleCreateProject = useCallback(() => {
    if (isSuperAdmin) {
      navigate("/cadastro-projeto");
      return;
    }

    setCreateProjectModalOpen(true);
  }, [isSuperAdmin, navigate]);

  return (
    <Box className={styles.page}>
      <CabecalhoEstilizado
        position="relative"
        sx={{
          zIndex: 0,
          height: "3rem",
          display: "flex",
          justifyContent: "center",
        }}
      />

      <Box className={styles.content}>
        <SearchProjects
          projects={projects}
          selectedProject={selectedProject}
          searchTerm={searchTerm}
          onProjectChange={(project) => setSelectedProjectId(project?.id ?? null)}
          onSearchTermChange={setSearchTerm}
          onCreateProject={handleCreateProject}
        />

        {loadingProjects ? (
          <Box className={styles.emptyState}>Carregando projetos...</Box>
        ) : filteredProjects.length ? (
          <Box className={styles.grid}>
            {filteredProjects.map((project) => (
              <CardProject
                key={project.id}
                title={project.name}
                actived={project.actived}
                responsesLast7Days={project.responsesLast7Days}
                responsesByMonthLast12Months={project.responsesByMonthLast12Months}
                responsesByTheme={project.responsesByTheme}
                onSelect={() => handleSelectProject(project)}
              />
            ))}
          </Box>
        ) : (
          <Box className={styles.emptyState}>
            {normalizedSearchTerm.length >= 3
              ? "Nenhum projeto encontrado para a busca."
              : "Nenhum projeto disponível para este usuário."}
          </Box>
        )}
      </Box>

      <Dialog
        open={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Novo projeto</DialogTitle>
        <DialogContent>
          Solicite ao administrador a criacao de um novo projeto.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateProjectModalOpen(false)} autoFocus>
            Entendi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

