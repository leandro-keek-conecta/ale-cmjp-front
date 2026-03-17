import CustomAlert from "@/components/Alert";
import { resetPassword } from "@/services/restorePassword/restorePassword";
import {
  ArrowBack,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Fade,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type AlertState = {
  show: boolean;
  category?: "success" | "error" | "info" | "warning";
  title?: string;
};

export default function ChangePassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") ?? "";
  const uid = searchParams.get("uid") ?? "";

  const [mostraSenha, setMostraSenha] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false });
  const [isMounted, setIsMounted] = useState(false);

  const redirectTimeout = useRef<number | null>(null);

  useEffect(() => {
    const mountTimeout = window.setTimeout(() => setIsMounted(true), 80);

    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
      window.clearTimeout(mountTimeout);
    };
  }, []);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  function toggleMostraSenha() {
    setMostraSenha((prev) => !prev);
  }

  function closeAlert() {
    setAlert({ show: false });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlert({ show: false });

    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current);
      redirectTimeout.current = null;
    }

    if (password !== confirm) {
      setAlert({
        show: true,
        category: "error",
        title: "As senhas nao coincidem.",
      });
      return;
    }

    if (!token || !uid) {
      setAlert({
        show: true,
        category: "error",
        title: "Link de redefinicao invalido ou expirado.",
      });
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, uid, password);

      setAlert({
        show: true,
        category: "success",
        title: "Senha alterada com sucesso! Voce sera redirecionado...",
      });

      setPassword("");
      setConfirm("");

      redirectTimeout.current = window.setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Falha ao redefinir senha. Tente novamente.";

      setAlert({
        show: true,
        category: "error",
        title: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        overflow: "hidden",
        padding: { xs: 3, md: 6 },
      }}
    >
      <IconButton
        aria-label="Voltar"
        onClick={handleBack}
        sx={{
          position: "absolute",
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 32 },
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#fff",
            transform: "translateX(-2px)",
          },
        }}
      >
        <ArrowBack />
      </IconButton>

      {alert.show && alert.title && (
        <CustomAlert
          category={alert.category}
          title={alert.title}
          onClose={closeAlert}
          autoHideDuration={alert.category === "success" ? 3000 : 5000}
        />
      )}

      <Fade in={isMounted} timeout={600}>
        <Card
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 440,
            padding: { xs: 4, md: 5 },
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            borderRadius: 4,
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(255,255,255,0.92)",
            boxShadow:
              "0 20px 45px rgba(31, 41, 55, 0.12), 0 8px 24px rgba(31, 41, 55, 0.08)",
          }}
        >
          <Box>
            <Typography variant="overline" color="primary">
              Recuperar acesso
            </Typography>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={600}
              sx={{ mt: 0.5 }}
            >
              Redefinir senha
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Escolha uma nova senha forte para manter sua conta segura.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Sua senha"
              type={mostraSenha ? "text" : "password"}
              margin="normal"
              variant="outlined"
              size="medium"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              sx={{ backgroundColor: "white", borderRadius: "4px" }}
              InputProps={{
                style: { color: "#333" },
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip
                      title="Digite sua senha"
                      placement="top"
                      arrow
                      enterTouchDelay={0}
                    >
                      <LockOutlined
                        sx={{ fontSize: "1rem", color: "text.secondary" }}
                      />
                    </Tooltip>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={mostraSenha ? "Ocultar senha" : "Mostrar senha"}
                      placement="top"
                      arrow
                      enterTouchDelay={0}
                    >
                      <IconButton
                        onClick={toggleMostraSenha}
                        edge="end"
                        aria-label={
                          mostraSenha ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {mostraSenha ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirme a senha"
              type={mostraSenha ? "text" : "password"}
              margin="normal"
              variant="outlined"
              size="medium"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
              sx={{ backgroundColor: "white", borderRadius: "4px" }}
              InputProps={{
                style: { color: "#333" },
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip
                      title="Digite sua senha novamente"
                      placement="top"
                      arrow
                      enterTouchDelay={0}
                    >
                      <LockOutlined
                        sx={{ fontSize: "1rem", color: "text.secondary" }}
                      />
                    </Tooltip>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={mostraSenha ? "Ocultar senha" : "Mostrar senha"}
                      placement="top"
                      arrow
                      enterTouchDelay={0}
                    >
                      <IconButton
                        onClick={toggleMostraSenha}
                        edge="end"
                        aria-label={
                          mostraSenha ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {mostraSenha ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disableElevation
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.25,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              {loading ? "Enviando..." : "Atualizar senha"}
            </Button>
          </Box>
        </Card>
      </Fade>
    </Box>
  );
}
