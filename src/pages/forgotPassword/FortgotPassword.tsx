import {
  Alert,
  Box,
  Button,
  Card,
  Fade,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmail } from "@/services/restorePassword/restorePassword";

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsMounted(true), 80);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFeedback({
        type: "error",
        message: "Informe um email valido.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Aqui")
      await sendEmail(trimmedEmail);
      setFeedback({
        type: "success",
        message:
          "Email enviado! Se encontrarmos este endereco, voce recebera as instrucoes para redefinir a senha.",
      });
      setEmail("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar o pedido. Tente novamente.";
      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
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
              Esqueci minha senha
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Informe o email cadastrado para receber um link seguro e redefinir sua senha com tranquilidade.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              label="Email corporativo"
              placeholder="nome.sobrenome@empresa.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              margin="normal"
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="contained"
              disableElevation
              fullWidth
              disabled={isSubmitting}
              sx={{
                mt: 2,
                py: 1.25,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              {isSubmitting ? "Enviando..." : "Enviar link de recuperacao"}
            </Button>
          </Box>

          {feedback && (
            <Alert
              severity={feedback.type}
              sx={{
                mt: 1,
                borderRadius: 2,
              }}
            >
              {feedback.message}
            </Alert>
          )}
        </Card>
      </Fade>
    </Box>
  );
}
