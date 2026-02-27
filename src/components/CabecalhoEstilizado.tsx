import { Menu } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { AppBarProps } from "@mui/material";
import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo-horizontal-n.png";
import UserMenuMinimal, { type MenuOption } from "./SplitButton";
import { useAuth } from "@/context/AuthContext";
import { useProjectSelection } from "@/hooks/useProjectSelection";
import { logout } from "@/services/auth/authService";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "white",
  color: "#333333",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  zIndex: theme.zIndex.drawer + 1,
}));

type CabecalhoEstilizadoProps = AppBarProps & {
  children?: ReactNode;
  avatar?: {
    src?: string;
    alt?: string;
    fallback?: string;
  };
  options?: MenuOption[];
  onMobileMenuClick?: () => void;
  logoSrc?: string;
  logoAlt?: string;
  menuMode?: "default" | "withProjects";
};

type CabecalhoMenuUsuarioProps = {
  avatar?: {
    src?: string;
    alt?: string;
    fallback?: string;
  };
  options?: MenuOption[];
  menuMode?: "default" | "withProjects";
};

export function CabecalhoMenuUsuario({
  avatar,
  options,
  menuMode = "default",
}: CabecalhoMenuUsuarioProps) {
  const { user, setUser } = useAuth();
  const { resetProject } = useProjectSelection();
  const navigate = useNavigate();

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

  const handleLogout = useCallback(() => {
    resetProject();
    logout();
    setUser(null);
    navigate("/");
  }, [navigate, resetProject, setUser]);

  const defaultOptions = useMemo<MenuOption[]>(() => {
    const allProjectsOption: MenuOption[] =
      menuMode === "withProjects"
        ? [
            {
              label: "Todos os projetos",
              icone: <PersonAddAlt1Icon />,
              onClick: () => navigate("/projetos"),
            },
          ]
        : [];

    if (user?.role === "ADMIN" || user?.role === "SUPERADMIN") {
      return [
        ...allProjectsOption,
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
          label: "Sair",
          icone: <LogoutIcon />,
          onClick: handleLogout,
        },
      ];
    }

    return [
      ...allProjectsOption,
      {
        label: "Sair",
        icone: <LogoutIcon />,
        onClick: handleLogout,
      },
    ];
  }, [handleLogout, menuMode, navigate, user?.role]);

  const resolvedAvatar = avatar ?? {
    src: (user as { photoUrl?: string } | null)?.photoUrl,
    fallback: avatarFallback,
  };

  const resolvedOptions = options ?? defaultOptions;

  return <UserMenuMinimal avatar={resolvedAvatar} options={resolvedOptions} />;
}

export default function CabecalhoEstilizado({
  children,
  avatar,
  options,
  onMobileMenuClick,
  logoSrc = Logo,
  logoAlt = "keekInteligencia",
  menuMode = "default",
  ...appBarProps
}: CabecalhoEstilizadoProps) {
  const navigate = useNavigate();

  if (children) {
    return <StyledAppBar {...appBarProps}>{children}</StyledAppBar>;
  }

  return (
    <StyledAppBar {...appBarProps}>
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
          onClick={onMobileMenuClick}
          sx={{ display: { xs: "block", md: "none" } }}
          aria-label="Abrir menu"
        >
          <Menu />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            "&:hover": {
              cursor: "pointer",
            },
          }}
        >
          <img
            onClick={() => navigate("/panorama")}
            src={logoSrc}
            alt={logoAlt}
            style={{ height: "2.5rem", width: "auto" }}
          />
        </Box>

        <CabecalhoMenuUsuario
          avatar={avatar}
          options={options}
          menuMode={menuMode}
        />
      </Toolbar>
    </StyledAppBar>
  );
}
