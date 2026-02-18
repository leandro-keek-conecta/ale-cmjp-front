import {
  Box,
  IconButton,
  Toolbar,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import ChatIcon from "@mui/icons-material/Chat";
import Logo from "../../assets/logo-horizontal-n.png";
import { Menu } from "@mui/icons-material";
import styles from "./formcontructor.module.css";
import { useCallback, useMemo, useState } from "react";
import UserMenuMinimal from "@/components/SplitButton";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/auth/authService";
import { useNavigate } from "react-router-dom";
import { useProjectSelection } from "@/hooks/useProjectSelection";
import CabecalhoEstilizado from "@/components/CabecalhoEstilizado";

export default function FormConstructor() {
  const { user, setUser } = useAuth();
  const { resetProject } = useProjectSelection();
  const [, setMobileMenuOpen] = useState(false);
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
    <Box className={styles.container}>
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
            onClick={() => setMobileMenuOpen(true)}
            sx={{ display: { xs: "block", md: "none" } }}
            aria-label="Abrir menu"
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
            avatar={{
              src: (user as { photoUrl?: string } | null)?.photoUrl,
              fallback: avatarFallback,
            }}
            options={menuOptions}
          />
        </Toolbar>
      </CabecalhoEstilizado>

      <Box className={styles.bodyContent}>
        <Box className={styles.leftContent}></Box>
        <Box className={styles.hightContent}></Box>
      </Box>
    </Box>
  );
}
