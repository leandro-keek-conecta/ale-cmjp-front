import { Box, Typography } from "@mui/material";
import InputText from "../../../components/InputText";
import Button from "../../../components/Button";
import styles from "./formLogin.module.css";
import { useState } from "react";

export default function FormLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }
  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePassword() {
    return password.length >= 6;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    if (!isEmailValid) {
      alert("Por favor, insira um email vÃ¡lido.");
      return;
    }
    if (!isPasswordValid) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    alert("Login bem-sucedido!");
  }

  return (
    <Box component="form" className={styles.form} noValidate autoComplete="off">
      <Box className={styles.inputContainer}>
        <Typography variant="h5" gutterBottom className={styles.title}>
          Login
        </Typography>
        <InputText
          label="Email"
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={handleEmailChange}
          className={styles.loginInput}
        />
        <InputText
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={handlePasswordChange}
          className={styles.loginInput}
        />
        <Box className={styles.buttonContainer}>
          <Button
            fullWidth
            color="primary"
            onClick={handleSubmit}
            className={styles.loginButton}
          >
            Entrar
          </Button>
        </Box>
        <Box className={styles.helperRow}>
          <span className={styles.remember}>Lembrar-me</span>
          <span className={styles.forgotPassword}>Esqueci minha senha</span>
        </Box>
      </Box>
    </Box>
  );
}
