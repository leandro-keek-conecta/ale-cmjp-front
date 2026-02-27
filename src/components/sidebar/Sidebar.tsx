import { Fragment, useEffect, useMemo, useState } from "react";
import styles from "./sidebar.module.css";
import PaletteIcon from "@mui/icons-material/Palette";
import { useLocation } from "react-router-dom";
import { ItemMenu } from "../ItemMenu";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InsightsIcon from "@mui/icons-material/Insights";
import ForumIcon from "@mui/icons-material/Forum";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SchoolIcon from "@mui/icons-material/School";
import ConstructionIcon from "@mui/icons-material/Construction";
import ParkIcon from "@mui/icons-material/Park";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import SecurityIcon from "@mui/icons-material/Security";
import TopicIcon from "@mui/icons-material/Topic";
import DynamicFormIcon from "@mui/icons-material/DynamicForm";
import { useAuth } from "@/context/AuthContext";
import { listAllProjects } from "@/services/projeto/ProjetoService";
import { getStoredProjectId } from "@/utils/project";

interface PropriedadesSidebar {
  estaAberta: boolean;
  isMobile?: boolean;
  aoFechar?: () => void;
  noDashboard?: boolean;
}

type ProjectThemeSource = {
  id?: unknown;
  projetoId?: unknown;
  temasDoProjeto?: unknown;
  metrics?: unknown;
  projeto?: unknown;
};

const normalizeThemeKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getThemeIcon = (themeLabel: string) => {
  const key = normalizeThemeKey(themeLabel);

  if (key.includes("saude")) return <LocalHospitalIcon />;
  if (key.includes("educacao")) return <SchoolIcon />;
  if (key.includes("infraestrutura")) return <ConstructionIcon />;
  if (key.includes("ambiente")) return <ParkIcon />;
  if (key.includes("mobilidade") || key.includes("transito")) {
    return <DirectionsBusIcon />;
  }
  if (key.includes("seguranca")) return <SecurityIcon />;
  if (key.includes("outro")) return <TopicIcon />;

  return <AssessmentIcon />;
};

const toThemeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const toProjectId = (source: unknown): number | null => {
  if (!source || typeof source !== "object") return null;

  const entry = source as ProjectThemeSource;
  if (typeof entry.id === "number") return entry.id;
  if (typeof entry.projetoId === "number") return entry.projetoId;

  if (entry.projeto && typeof entry.projeto === "object") {
    return toProjectId(entry.projeto);
  }

  return null;
};

const extractThemesFromProject = (source: unknown): string[] => {
  if (!source || typeof source !== "object") return [];

  const entry = source as ProjectThemeSource;
  const themes: string[] = [];
  const pushUniqueTheme = (theme: unknown) => {
    const normalizedTheme = toThemeText(theme);
    if (!normalizedTheme) return;

    const normalizedKey = normalizeThemeKey(normalizedTheme);
    const alreadyExists = themes.some(
      (item) => normalizeThemeKey(item) === normalizedKey,
    );
    if (!alreadyExists) {
      themes.push(normalizedTheme);
    }
  };

  if (Array.isArray(entry.temasDoProjeto)) {
    entry.temasDoProjeto.forEach((theme) => pushUniqueTheme(theme));
  }

  if (entry.metrics && typeof entry.metrics === "object") {
    const metrics = entry.metrics as {
      responsesByTheme?: unknown;
    };

    if (Array.isArray(metrics.responsesByTheme)) {
      metrics.responsesByTheme.forEach((item) => {
        if (!item || typeof item !== "object") return;
        const row = item as Record<string, unknown>;
        pushUniqueTheme(row.tema ?? row.label ?? row.theme ?? row.name);
      });
    }
  }

  return themes;
};

const extractThemesFromUser = (
  user: unknown,
  selectedProjectId: number | null,
): string[] => {
  if (!user || typeof user !== "object") return [];

  const source = user as Record<string, unknown>;
  const projectCandidates: unknown[] = [];

  if (source.projeto && typeof source.projeto === "object") {
    projectCandidates.push(source.projeto);
  }

  if (Array.isArray(source.projetos)) {
    source.projetos.forEach((project) => {
      if (!project || typeof project !== "object") return;
      const entry = project as Record<string, unknown>;
      const nestedProject =
        entry.projeto && typeof entry.projeto === "object"
          ? entry.projeto
          : project;
      projectCandidates.push(nestedProject);
    });
  }

  if (typeof selectedProjectId === "number") {
    const selectedProject = projectCandidates.find(
      (project) => toProjectId(project) === selectedProjectId,
    );
    if (selectedProject) {
      const selectedThemes = extractThemesFromProject(selectedProject);
      if (selectedThemes.length) {
        return selectedThemes;
      }
    }
  }

  for (const project of projectCandidates) {
    const themes = extractThemesFromProject(project);
    if (themes.length) {
      return themes;
    }
  }

  return [];
};

export function Sidebar({ estaAberta, aoFechar }: PropriedadesSidebar) {
  const location = useLocation();
  const { user } = useAuth();
  const [projectThemes, setProjectThemes] = useState<string[]>([]);
  const selectedProjectId = getStoredProjectId();

  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN";
  const hasManagementSection = isSuperAdmin || isAdmin;
  const themeRoutes = useMemo(
    () =>
      projectThemes.map((theme) => ({
        label: theme,
        path: `/relatorio-opiniao/tema/${encodeURIComponent(theme)}`,
      })),
    [projectThemes],
  );

  useEffect(() => {
    setProjectThemes(extractThemesFromUser(user, selectedProjectId));
  }, [user, selectedProjectId]);

  useEffect(() => {
    if (typeof user?.id !== "number") return;

    let cancelled = false;

    const loadThemes = async () => {
      try {
        const projects = await listAllProjects(user.id as number);
        if (cancelled || !Array.isArray(projects)) return;

        const projectList = projects as ProjectThemeSource[];
        const selectedProject =
          typeof selectedProjectId === "number"
            ? projectList.find(
                (project) => toProjectId(project) === selectedProjectId,
              )
            : projectList[0];

        if (!selectedProject) return;

        const themes = extractThemesFromProject(selectedProject);
        if (themes.length) {
          setProjectThemes(themes);
        }
      } catch {
        // fallback to themes already available in user context
      }
    };

    void loadThemes();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId, user?.id]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <nav className={styles.sidebarNav}>
      <ul className={styles.ulStyle}>
        <Fragment>
          <ItemMenu rotulo="Menu" isTitle estaAberta={estaAberta} />
          <ItemMenu
            icone={<DashboardCustomizeIcon />}
            rotulo="Visão geral"
            para="/panorama"
            estaAberta={estaAberta}
            isActive={isActive("/panorama")}
            onClick={aoFechar}
          />
          <ItemMenu
            icone={<InsightsIcon />}
            rotulo="Relatórios"
            para="/relatorio"
            estaAberta={estaAberta}
            isActive={isActive("/relatorio")}
            onClick={aoFechar}
          />
          <ItemMenu
            icone={<ForumIcon />}
            rotulo="Relatório de opiniões"
            para="/relatorio-opiniao"
            estaAberta={estaAberta}
            isActive={isActive("/relatorio-opiniao")}
            onClick={aoFechar}
          />
          {(hasManagementSection || themeRoutes.length) && (
            <li className={styles.divider} aria-hidden="true" />
          )}

          {isSuperAdmin ? (
            <>
              <ItemMenu
                rotulo="Aparência e Conteúdo"
                isTitle
                estaAberta={estaAberta}
              />
              <ItemMenu
                icone={<PaletteIcon />}
                rotulo="Aparência e Conteúdo"
                para="/cadastro-thema"
                estaAberta={estaAberta}
                isActive={isActive("/cadastro-thema")}
                onClick={aoFechar}
              />
              <ItemMenu
                icone={<DynamicFormIcon />}
                rotulo="Cadastro de formulário"
                para="/constructor-forms"
                estaAberta={estaAberta}
                isActive={isActive("/constructor-forms")}
                onClick={aoFechar}
              />
            </>
          ) : null}

          {isAdmin ? (
            <ItemMenu
              icone={<DynamicFormIcon />}
              rotulo="Cadastro de formulário"
              para="/constructor-forms"
              estaAberta={estaAberta}
              isActive={isActive("/constructor-forms")}
              onClick={aoFechar}
            />
          ) : null}
          {themeRoutes.length ? (
            <>
              {hasManagementSection ? (
                <li className={styles.divider} aria-hidden="true" />
              ) : null}
              <ItemMenu
                rotulo="Relatórios por tema"
                isTitle
                estaAberta={estaAberta}
              />
              {themeRoutes.map((themeRoute) => (
                <ItemMenu
                  key={themeRoute.path}
                  icone={getThemeIcon(themeRoute.label)}
                  rotulo={themeRoute.label}
                  para={themeRoute.path}
                  estaAberta={estaAberta}
                  isActive={isActive(themeRoute.path)}
                  onClick={aoFechar}
                />
              ))}
            </>
          ) : null}
        </Fragment>
      </ul>
    </nav>
  );
}


