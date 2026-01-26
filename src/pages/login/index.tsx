import type { InputType } from "../../components/Forms";
import Forms from "../../components/Forms";
import styles from "./login.module.css";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  type LoginFormValues = {
    email: string;
    password: string;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const inputsList: InputType<LoginFormValues>[] = [
    {
      name: "email",
      title: "E-mail corporativo",
      type: "email",
      containerClassName: styles.formGroup,
    },
    {
      name: "password",
      title: "Senha",
      type: "password",
      containerClassName: styles.formGroup,
    },
  ];

  function onSubmit() {}

  return (
    <Box className={styles.container}>
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <Forms inputsList={inputsList} control={control} errors={errors} />

            <div className={styles.formFooter}>
              <label className={styles.rememberMe}>
                <p>Lembrar de mim</p>
              </label>
              <a href="#" className={styles.forgotLink}>
                Esqueceu a senha?
              </a>
            </div>

            <button type="submit" className={styles.btnPrimary}>
              Acessar Painel
            </button>
          </form>

          <div className={styles.footerCopy}>
            &copy; 2026 Keek Inteligência de Dados. Todos os direitos
            reservados.
          </div>
        </Box>
      </Box>
    </Box>
  );
}
