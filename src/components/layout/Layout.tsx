import { useState } from "react";
import { styled } from "@mui/material/styles";
import Logo from "../../assets/logo-horizontal-n.png";
import icone from "../../assets/Keek-Icone.png";
import { Box, Drawer, IconButton, Toolbar, Typography } from "@mui/material";
import { ChevronLeft, Menu } from "@mui/icons-material";
import { Sidebar } from "../sidebar/Sidebar";
import { defaultTheme } from "../../theme";
import { getActiveProject } from "../../utils/project";
import CabecalhoEstilizado, {
  CabecalhoMenuUsuario,
} from "../CabecalhoEstilizado";
// Interface para propriedades do componente Layout
interface PropriedadesLayout {
  children: React.ReactNode;
  titulo?: string;
  mostrarSidebar?: boolean;
  tituloIcon?: React.ReactNode; // Nova propriedade para controlar a exibição da sidebar
}

// Estilo para o cabeçalho
// Estilo para a barra lateral
const BarraLateralEstilizada = styled(Box)(() => ({
  backgroundColor: "#ffffff", // Verde similar ao sinGroup
  color: "white",
  height: "100%",
}));

export function Layout({
  children,
  titulo,
  mostrarSidebar = true,
  tituloIcon,
}: PropriedadesLayout) {
  const APPBAR_H = "3rem";
  const contentMinHeight = `calc(100dvh - ${APPBAR_H})`;
  const [barraLateralAberta, setBarraLateralAberta] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const userString = localStorage.getItem("user");
  let user: any = null;
  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (error) {
      console.error("Erro ao interpretar usuário no layout:", error);
      user = null;
    }
  }

  const activeProject = getActiveProject(user);
  const color = defaultTheme.palette.primary.main;
  const projectLogo =
    typeof activeProject?.url === "string" && activeProject.url.trim().length
      ? activeProject.url
      : Logo;
  const projectName =
    typeof activeProject?.nome === "string" && activeProject.nome.trim().length
      ? activeProject.nome
      : "Projeto";

  // Se não deve mostrar a sidebar, renderiza apenas o conteúdo principal
  if (!mostrarSidebar) {
    return (
      <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "#f5f5f5" }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "#f5f5f5" }}>
      {/* Barra lateral para desktop */}
      <Box
        component="aside"
        sx={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100dvh",
          borderRight: "1px solid #00000014",
          overflowY: "hidden", // Scroll inicialmente escondido
          overflowX: "hidden",
          width: barraLateralAberta ? "14.281vw" : "50px",
          bgcolor: "#ffffff",
          transition: "all 0.3s ease-in-out",
          zIndex: 20,
          display: { xs: "none", md: "block" },
          "&:hover": {
            overflowY: "auto", // Mostra scroll ao passar o mouse
          },
          // Estilização personalizada para a barra de rolagem
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // mantém o LOGO no centro
            height: "3rem",
            borderBottom: "1px solid black",
            position: "sticky", // pai com posição ≠ static para o absolute funcionar
            top: 0,
            zIndex: 1,
            bgcolor: "#fff",
          }}
        >
          {barraLateralAberta ? (
            <>
              <img
                src={Logo}
                alt="keekInteligencia"
                style={{ height: "2.5rem", width: "auto" }}
              />

              <IconButton
                aria-label="recolher menu"
                onClick={() => {
                  setBarraLateralAberta((prev) => {
                    const novoEstado = !prev;
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        window.dispatchEvent(new Event("resize"));
                      }, 50);
                    });
                    return novoEstado;
                  });
                }}
                sx={{
                  position: "absolute",
                  right: "0.5rem", // distância da direita
                  top: "50%",
                  transform: "translateY(-50%)", // centraliza verticalmente
                  color: "black",
                  display: { xs: "none", md: "flex" },
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <ChevronLeft />
              </IconButton>
            </>
          ) : (
            <img
              src={icone}
              onClick={() => setBarraLateralAberta((prev) => !prev)}
              alt="sinGroup"
              style={{ height: "30px", width: "30px", cursor: "pointer" }}
            />
          )}
        </Box>

        <Sidebar estaAberta={barraLateralAberta} />
      </Box>

      {/* Drawer para mobile */}
      <Drawer
        anchor="left"
        open={menuMobileAberto}
        onClose={() => setMenuMobileAberto(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "60vw",
            bgcolor: `${color}`,
          },
          display: { xs: "block", md: "none" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            height: "50px",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={projectLogo}
              alt="keekInteligencia"
              style={{ height: "32px", width: "32px", borderRadius: "50%" }}
            />
            <Typography
              variant="subtitle1"
              sx={{
                ml: 1,
                fontWeight: "bold",
                color: "white",
                fontSize: "0.9rem",
              }}
            >
              {projectName}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setMenuMobileAberto(false)}
            sx={{ color: "white" }}
          >
            <ChevronLeft />
          </IconButton>
        </Box>
        <BarraLateralEstilizada>
          <Sidebar
            estaAberta={true}
            isMobile={true}
            aoFechar={() => setMenuMobileAberto(false)}
          />
        </BarraLateralEstilizada>
      </Drawer>

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          ml: { xs: 0, md: barraLateralAberta ? "14.281vw" : "50px" },
          transition: "all 0.3s ease-in-out",
          overflowX: "hidden",
        }}
      >
        <CabecalhoEstilizado
          position="fixed"
          sx={{
            height: APPBAR_H,
            // NÃO coloque zIndex: 0 aqui
            left: { xs: 0, md: barraLateralAberta ? "14.281vw" : "50px" },
            width: {
              xs: "100%",
              md: `calc(100% - ${barraLateralAberta ? "14.281vw" : "50px"})`,
            },
            borderBottom: "0.5px solid black",
            display: "flex",
            top: 0,
            justifyContent: "center",
          }}
        >
          <Toolbar
            sx={{ display: "flex", alignItems: "center", width: "100%" }}
          >
            <IconButton
              color="inherit"
              onClick={() => setMenuMobileAberto(true)}
              sx={{
                display: { xs: "inline-flex", md: "none" },
                mr: 1,
              }}
              aria-label="Abrir menu"
            >
              <Menu />
            </IconButton>
            {titulo && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1, // espaço entre ícone e texto
                  minWidth: 0, // evita quebra estranha
                }}
              >
                {tituloIcon && (
                  <Box
                    aria-hidden
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      lineHeight: 0,
                    }}
                  >
                    {tituloIcon}
                  </Box>
                )}
                <Typography
                  variant="h6"
                  component="h1"
                  sx={{
                    fontSize: "1.2rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={titulo}
                >
                  {titulo}
                </Typography>
              </Box>
            )}

            <CabecalhoMenuUsuario menuMode="withProjects" />
          </Toolbar>
        </CabecalhoEstilizado>
        <Box
          sx={{
            flex: 1,
            mx: "auto",
            width: "100%",
            maxWidth: "100%",
            transition: "all 0.3s ease-in-out",
            mt: APPBAR_H,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: contentMinHeight,
            minWidth: 0,
          }}
        >
          {" "}
          <IconButton
            color="inherit"
            onClick={() => setBarraLateralAberta((prev) => !prev)}
            sx={{
              display: { xs: "none", md: "inline-flex" },
              width: 32,
              height: 32,
              borderRadius: "10px",
              zIndex: 5,
              position: "absolute",
              left: "5rem",
              top: "3rem",
              border: "1px solid #e0e0e0",
              backgroundColor: "#ffffff",
              color: "#333333",
              mr: 8,
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
