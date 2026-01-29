import { useEffect, useRef, useState } from "react";
import styles from "./login.module.css";
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
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tooltip,
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

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
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
  };

  useEffect(() => {
    
    isMountedRef.current = true;
    logout(); // limpa com seguran?a, sem hooks fora de componente
    setFormData({ email: "", password: "" });
    return () => {
      
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    
  }, [loading]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setAlert({ show: false });

    if (!formData.email || !formData.password) {
      setAlert({
        show: true,
        category: "error",
        title: "Preencha e-mail e senha antes de acessar.",
      });
      return;
    }

    
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
          title: "Login Feito Com Sucesso!",
        });
      }

      if (user.role === "ADMIN") {
        navigate("/panorama");
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
        <Box className={styles.heroImage}></Box>
        <Box className={styles.brandContent}>
          <h1 className={styles.brandHeadline}>
            Dê voz à sua cidade com inteligência de dados.
          </h1>
        </Box>

        <Box className={styles.glassCard}>
          <h3>
            <span className={styles.statusDot}></span> Monitoramento Ativo
          </h3>
          <p>
            <strong>320 novas opiniões</strong> coletadas em Mangabeira e
            Bancários nas últimas 24h.
          </p>
        </Box>
      </Box>
      <Box className={styles.rightSide}>
        <Box className={styles.loginContainer}>
          <Box className={styles.logoArea}>
            <Box className={styles.logoSymbol}>K</Box>
            <Box className={styles.logoText}>keek</Box>
          </Box>

          <Box className={styles.welcomeText}>
            <h2>Olá, Gestor! 👋</h2>
            <p>
              Insira suas credenciais para acessar o painel de inteligência.
            </p>
          </Box>

          <form className={styles.form} onSubmit={onSubmit}>
            <TextField
              fullWidth
              label="Seu e-mail"
              type="email"
              margin="normal"
              name="email"
              variant="outlined"
              size="medium"
              value={formData.email}
              onChange={handleChange}
              onFocus={(e) => e.target.setAttribute("autocomplete", "email")}
              autoComplete="off"
              sx={{ backgroundColor: "white", borderRadius: "4px" }}
              InputProps={{
                style: { color: "#333" },
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip
                      title="Preencha com seu e-mail"
                      placement="top"
                      arrow
                      enterTouchDelay={0}
                    >
                      <PersonOutline
                        sx={{ fontSize: "1rem", color: "text.secondary" }}
                      />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                shrink: true,
                style: {
                  color: "#333",
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderRadius: "8px",
                },
              }}
            />

            <TextField
              fullWidth
              label="Sua senha"
              type={mostraSenha ? "text" : "password"}
              name="password"
              margin="normal"
              variant="outlined"
              size="medium"
              value={formData.password}
              onChange={handleChange}
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
              InputLabelProps={{
                shrink: true,
                style: {
                  color: "#333",
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderRadius: "8px",
                },
              }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
              mb={2}
            >
              <FormControlLabel
                control={<Checkbox size="small" />}
                sx={{ fontSize: "0.7rem" }}
                label="Lembre de mim"
              />
              <Link
                href="forgot-password"
                fontSize="0.7rem"
                color="#FFFFF"
                sx={{
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Esqueceu a senha?
              </Link>
            </Box>

            <Button
              variant="contained"
              fullWidth
              style={{ backgroundColor: "#5070dd" }}
              sx={{ py: 1.2 }}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                <p style={{ color: "#FFFFFF", fontSize: "1rem" }}>Acessar</p>
              )}
            </Button>
          </form>

          <div className={styles.footerCopy}>
            &copy; 2026 Keek Inteligê
            ncia de Dados. Todos os direitos
            reservados.
          </div>
        </Box>
      </Box>
    </Box>
  );
}
