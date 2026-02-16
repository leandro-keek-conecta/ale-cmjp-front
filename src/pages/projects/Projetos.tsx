import { useCallback, useEffect, useMemo, useState } from "react";
import { AppBar, Box, IconButton, Toolbar, Typography, styled } from "@mui/material";
import { Menu } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import ChatIcon from "@mui/icons-material/Chat";
import Logo from "../../assets/logo-horizontal-n.png";
import styles from "./projetos.module.css";
import UserMenuMinimal from "@/components/SplitButton";
import { logout } from "@/services/auth/authService";
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

type ProjectCardData = {
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

const CabecalhoEstilizado = styled(AppBar)(({ theme }) => ({
  backgroundColor: "white",
  color: "#333333",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  zIndex: theme.zIndex.drawer + 1,
}));

export default function Projetos() {
  const { user, setUser } = useAuth();
  const { selectProject, resetProject } = useProjectSelection();
  const navigate = useNavigate();
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectSources, setProjectSources] = useState<RawProjectSource[]>([]);

  const avatarFallback = useMemo(() => {
    if (!user) return "U";
    if ((user as { initials?: string }).initials) {
      return (user as { initials?: string }).initials ?? "U";
    }
    if (user.name) {
      return (
        user.name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part: string) => part[0]?.toUpperCase() ?? "")
          .join("") || "U"
      );
    }
    return "U";
  }, [user]);

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
        console.error("Erro ao atualizar projetos vinculados do usuario:", error);
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

  const handleLogout = useCallback(() => {
    resetProject();
    logout();
    setUser(null);
    navigate("/");
  }, [navigate, resetProject, setUser]);

  const menuOptions = useMemo(() => {
    if (user?.role === "ADMIN" || user?.role === "SUPERADMIN") {
      return [
        {
          label: "Cadastro de Usuario",
          icone: <PersonAddAlt1Icon />,
          onClick: () => navigate("/cadastro-usuario"),
        },
        {
          label: "Cadastro de projeto",
          icone: <AddBusinessIcon />,
          onClick: () => navigate("/cadastro-projeto"),
        },
        {
          label: "Cadastro de automacoes",
          icone: <ChatIcon />,
          onClick: () => navigate("/cadastro-automacoes"),
        },
        {
          label: "Sair",
          icone: <LogoutIcon />,
          onClick: handleLogout,
        },
      ];
    }

    return [
      {
        label: "Sair",
        icone: <LogoutIcon />,
        onClick: handleLogout,
      },
    ];
  }, [handleLogout, navigate, user?.role]);

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
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 2,
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <Menu />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img
              src={Logo}
              alt="keekInteligencia"
              style={{ height: "2.5rem", width: "auto" }}
            />
          </Box>

          <UserMenuMinimal
            avatar={{ src: (user as { photoUrl?: string } | null)?.photoUrl, fallback: avatarFallback }}
            options={menuOptions}
          />
        </Toolbar>
      </CabecalhoEstilizado>

      <Box className={styles.content}>
        <Typography component="h1" className={styles.title}>
          Selecione um projeto
        </Typography>

        {loadingProjects ? (
          <Box className={styles.emptyState}>Carregando projetos...</Box>
        ) : projects.length ? (
          <Box className={styles.grid}>
            {projects.map((project) => (
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
            Nenhum projeto disponivel para este usuario.
          </Box>
        )}
      </Box>
    </Box>
  );
}
