import { useEffect, useRef, useState } from "react";
import styles from "./login.module.css";
import keekLogo from "@/assets/logo-horizontal-n.png";
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  LockOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import { login, logout } from "../../services/auth/authService";
import { useAuth } from "../../context/AuthContext";
import type UserLogin from "../../types/userLogin";
import { useNavigate } from "react-router-dom";
import CustomAlert from "../../components/Alert";

type AlertState = {
  show: boolean;
  category?: "success" | "error" | "info" | "warning";
  title?: string;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [mostraSenha, setMostraSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false });
  const isMountedRef = useRef(true);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const toggleMostraSenha = () => setMostraSenha((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    logout();
    setFormData({ email: "", password: "" });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setAlert({ show: false });

    const nextErrors: FieldErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Informe seu e-mail.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Informe sua senha.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const data: UserLogin = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await login(data);
      const user = response.data?.response?.user;
      const token = response.data?.response?.accessToken;

      if (!user || !token) {
        throw new Error("Falha ao autenticar. Tente novamente.");
      }

      if (isMountedRef.current) {
        setUser(user);
        setAlert({
          show: true,
          category: "success",
          title: "Login feito com sucesso!",
        });
      }

      if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
        navigate("/projetos");
        return;
      }

      navigate("/panorama");
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Falha ao autenticar. Tente novamente.";

      if (isMountedRef.current) {
        setAlert({
          show: true,
          category: "error",
          title: errorMessage,
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }

  return (
    <Box className={styles.container}>
      {alert.show && (
        <CustomAlert
          category={alert.category}
          title={alert.title ?? ""}
          onClose={() => setAlert({ show: false })}
        />
      )}

      <Box className={styles.leftSide}>
        <Box className={styles.heroImage} />

        <Box className={styles.brandContent}>
          <h1 className={styles.brandHeadline}>
            Dê voz à sua cidade com inteligência de dados.
          </h1>
          <p className={styles.brandSubline}>
            Transforme opiniões em decisões com monitoramento em tempo real.
          </p>
        </Box>

        <Box className={styles.glassCard}>
          <h3>
            <span className={styles.statusDot}></span> Monitoramento ativo
          </h3>
          <p>
            <strong>320 novas opiniões</strong> coletadas em Mangabeira e
            Bancários nas últimas 24h.
          </p>
        </Box>
      </Box>

      <Box className={styles.rightSide}>
        <Box className={styles.loginContainer}>
          <Box className={styles.cardHeader}>
            <img src={keekLogo} className={styles.logoLarge} alt="Keek" />

            <Box className={styles.welcomeText}>
              <h2>Bem-vindo 👋</h2>
            </Box>
          </Box>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <TextField
              className={styles.inputField}
              fullWidth
              label="E-mail"
              type="email"
              name="email"
              variant="outlined"
              size="medium"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline className={styles.fieldIcon} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              className={styles.inputField}
              fullWidth
              label="Senha"
              type={mostraSenha ? "text" : "password"}
              name="password"
              variant="outlined"
              size="medium"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined className={styles.fieldIcon} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      className={styles.passwordToggle}
                      onClick={toggleMostraSenha}
                      edge="end"
                      aria-label={
                        mostraSenha ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {mostraSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box className={styles.actionsRow}>
              <FormControlLabel
                className={styles.rememberControl}
                control={<Checkbox size="small" />}
                label="Manter sessão ativa"
              />
              <Typography>Esqueci minha senha</Typography>
            </Box>

            <Button
              className={styles.submitButton}
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loadingInline}>
                  <CircularProgress size={18} sx={{ color: "white" }} />
                  Entrando...
                </span>
              ) : (
                "Entrar no painel"
              )}
            </Button>
          </form>

          <div className={styles.footerCopy}>
            &copy; 2026 Keek Inteligência de Dados
          </div>
        </Box>
      </Box>
    </Box>
  );
}
