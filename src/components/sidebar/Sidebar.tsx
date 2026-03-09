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
import { useProjectContext } from "@/context/ProjectContext";
import {
  buildThemeRoutePath,
  filterThemesByScope,
  isScreenHidden,
  normalizeAccessKey,
  normalizeStringList,
} from "@/utils/userProjectAccess";

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
};

const getThemeIcon = (themeLabel: string) => {
  const key = normalizeAccessKey(themeLabel);

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

const toProjectThemeList = (payload: unknown): ProjectThemeSource[] => {
  if (Array.isArray(payload)) {
    return payload.filter(
      (entry): entry is ProjectThemeSource =>
        Boolean(entry && typeof entry === "object"),
    );
  }

  if (payload && typeof payload === "object") {
    return [payload as ProjectThemeSource];
  }

  return [];
};

export function Sidebar({ estaAberta, aoFechar }: PropriedadesSidebar) {
  const location = useLocation();
  const { user } = useAuth();
  const {
    projectId: selectedProjectId,
    hiddenTabs,
    temasPermitidos,
    hasThemeScope,
  } = useProjectContext();
  const [projectThemes, setProjectThemes] = useState<string[]>([]);

  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN";
  const hasManagementSection = isSuperAdmin || isAdmin;
  const hasOnlyThemeReportAccess = useMemo(
    () => user?.role === "USER" && hasThemeScope,
    [hasThemeScope, user?.role],
  );
  const themeRoutes = useMemo(
    () =>
      filterThemesByScope(projectThemes, temasPermitidos)
        .filter(
          (theme) => !isScreenHidden(hiddenTabs, buildThemeRoutePath(theme)),
        )
        .map((theme) => ({
          label: theme,
          path: buildThemeRoutePath(theme),
        })),
    [hiddenTabs, projectThemes, temasPermitidos],
  );

  useEffect(() => {
    if (typeof selectedProjectId !== "number") {
      setProjectThemes([]);
      return;
    }

    let cancelled = false;
    setProjectThemes([]);

    const loadThemes = async () => {
      try {
        const projects = await listAllProjects(selectedProjectId);
        if (cancelled) return;

        const projectList = toProjectThemeList(projects);
        const selectedProject =
          projectList.length > 0 ? projectList[projectList.length - 1] : null;

        if (!selectedProject) {
          setProjectThemes([]);
          return;
        }

        setProjectThemes(normalizeStringList(selectedProject.temasDoProjeto));
      } catch {
        if (!cancelled) {
          setProjectThemes([]);
        }
      }
    };

    void loadThemes();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const hidePanorama = isScreenHidden(hiddenTabs, "/panorama");
  const hideRelatorio =
    hasOnlyThemeReportAccess || isScreenHidden(hiddenTabs, "/relatorio");
  const hideRelatorioOpiniao =
    hasOnlyThemeReportAccess ||
    isScreenHidden(hiddenTabs, "/relatorio-opiniao");
  const hideCadastroTheme = isScreenHidden(hiddenTabs, "/cadastro-thema");
  const hideConstructorForms = isScreenHidden(hiddenTabs, "/constructor-forms");

  return (
    <nav className={styles.sidebarNav}>
      <ul className={styles.ulStyle}>
        <Fragment>
          <ItemMenu rotulo="Menu" isTitle estaAberta={estaAberta} />
          {!hidePanorama ? (
            <ItemMenu
              icone={<DashboardCustomizeIcon />}
              rotulo="Visão geral"
              para="/panorama"
              estaAberta={estaAberta}
              isActive={isActive("/panorama")}
              onClick={aoFechar}
            />
          ) : null}
          {!hideRelatorio ? (
            <ItemMenu
              icone={<InsightsIcon />}
              rotulo="Relatórios"
              para="/relatorio"
              estaAberta={estaAberta}
              isActive={isActive("/relatorio")}
              onClick={aoFechar}
            />
          ) : null}
          {!hideRelatorioOpiniao ? (
            <ItemMenu
              icone={<ForumIcon />}
              rotulo="Relatório de opiniões"
              para="/relatorio-opiniao"
              estaAberta={estaAberta}
              isActive={isActive("/relatorio-opiniao")}
              onClick={aoFechar}
            />
          ) : null}
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
              {!hideCadastroTheme ? (
                <ItemMenu
                  icone={<PaletteIcon />}
                  rotulo="Aparência e Conteúdo"
                  para="/cadastro-thema"
                  estaAberta={estaAberta}
                  isActive={isActive("/cadastro-thema")}
                  onClick={aoFechar}
                />
              ) : null}
              {!hideConstructorForms ? (
                <ItemMenu
                  icone={<DynamicFormIcon />}
                  rotulo="Cadastro de formulário"
                  para="/constructor-forms"
                  estaAberta={estaAberta}
                  isActive={isActive("/constructor-forms")}
                  onClick={aoFechar}
                />
              ) : null}
            </>
          ) : null}

          {isAdmin && !hideConstructorForms ? (
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


