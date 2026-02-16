import { useCallback, useMemo } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
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
import { ensureThemeColor } from "@/utils/project";
import {
  normalizeProjectFromUser,
  type RawUserProject,
} from "@/utils/projectSelection";
import type { ProjetoAccessLevel } from "@/types/IUserType";
import { useProjectSelection } from "@/hooks/useProjectSelection";

type ProjectCardData = {
  id: number;
  name: string;
  logoUrl?: string;
  color: string;
  access: ProjetoAccessLevel;
  hiddenTabsCount: number;
  payload: {
    id: number;
    name: string;
    access: ProjetoAccessLevel;
    hiddenTabs: string[];
    token?: string;
  };
};

const ACCESS_LABEL: Record<ProjetoAccessLevel, string> = {
  FULL_ACCESS: "Acesso total",
  AUTOMATIONS_ONLY: "Somente automacoes",
  DASH_ONLY: "Somente dashboards",
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

  const avatarFallback = useMemo(() => {
    if (!user) return "U";
    if ((user as any).initials) return (user as any).initials;
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

  const projects = useMemo<ProjectCardData[]>(() => {
    const sources =
      Array.isArray(user?.projetos) && user.projetos.length
        ? user.projetos
        : user?.projeto
          ? [user.projeto]
          : [];

    const dedupe = new Set<number>();
    const list: ProjectCardData[] = [];

    sources.forEach((source) => {
      const normalized = normalizeProjectFromUser(source as unknown as RawUserProject);
      if (typeof normalized.id !== "number" || dedupe.has(normalized.id)) {
        return;
      }

      const projeto =
        (source as any)?.projeto && typeof (source as any).projeto === "object"
          ? (source as any).projeto
          : source;

      const name = normalized.name || projeto?.nome || projeto?.name || `Projeto ${normalized.id}`;
      const logoUrl =
        typeof projeto?.url === "string" && projeto.url.trim().length
          ? projeto.url
          : typeof projeto?.logoUrl === "string" && projeto.logoUrl.trim().length
            ? projeto.logoUrl
            : undefined;

      list.push({
        id: normalized.id,
        name,
        logoUrl,
        color: ensureThemeColor(projeto?.corHex, "#0b5cff"),
        access: normalized.access ?? "FULL_ACCESS",
        hiddenTabsCount: normalized.hiddenTabs?.length ?? 0,
        payload: {
          id: normalized.id,
          name,
          access: normalized.access ?? "FULL_ACCESS",
          hiddenTabs: Array.isArray(normalized.hiddenTabs)
            ? normalized.hiddenTabs
            : [],
          token: normalized.token ?? "",
        },
      });

      dedupe.add(normalized.id);
    });

    return list;
  }, [user?.projeto, user?.projetos]);

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
            avatar={{ src: (user as any)?.photoUrl, fallback: avatarFallback }}
            options={menuOptions}
          />
        </Toolbar>
      </CabecalhoEstilizado>

      <Box className={styles.content}>
        <Typography component="h1" className={styles.title}>
          Selecione um projeto
        </Typography>

        {projects.length ? (
          <Box className={styles.grid}>
            {projects.map((project) => (
              <Card
                key={project.id}
                className={styles.card}
                sx={{ borderTop: `4px solid ${project.color}` }}
              >
                <CardContent className={styles.cardContent}>
                  <Box className={styles.cardHeader}>
                    {project.logoUrl ? (
                      <img
                        src={project.logoUrl}
                        alt={project.name}
                        className={styles.projectLogo}
                      />
                    ) : (
                      <Box
                        className={styles.projectBadge}
                        sx={{ backgroundColor: project.color }}
                      >
                        {project.name.slice(0, 1).toUpperCase()}
                      </Box>
                    )}

                    <Box className={styles.cardTitleWrap}>
                      <Typography className={styles.cardTitle}>
                        {project.name}
                      </Typography>
                      <Typography className={styles.cardSubtitle}>
                        Projeto #{project.id}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={ACCESS_LABEL[project.access]} size="small" />
                    <Chip
                      label={`${project.hiddenTabsCount} telas ocultas`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={() => handleSelectProject(project)}
                    className={styles.selectButton}
                  >
                    Entrar no projeto
                  </Button>
                </CardContent>
              </Card>
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
