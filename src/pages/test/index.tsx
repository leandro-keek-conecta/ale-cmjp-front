import { Avatar, Box, Button, IconButton } from "@mui/material";
import styles from "./FormsPage.module.css";
import HorizontalLinearAlternativeLabelStepper from "../../components/stepper";
import { useMemo, useState } from "react";
import Forms from "../../components/Forms";
import { getUserInputs } from "./userImputList/user";
import { set, useForm } from "react-hook-form";
import type { UserFormValues } from "../../@types/user";
import type { OpinionFormValues } from "../../@types/opiniao";
import { getOpinionInputs } from "./opinionList/opinionImputList";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Alert,
} from "@mui/material";
import { createUSer } from "../../services/user/userService";
import { useNavigate } from "react-router-dom";
import { submitOpinion } from "../../services/opiniao/opiniaoService";

const steps = ["Cadastro de usuário", "Cadastro de Opinião", "Concluido"];

const buildUserDefaultValues = (): UserFormValues => ({
  id: "",
  horario: "",
  nome: "",
  telefone: "",
  ano_nascimento: "",
  genero: "",
  bairro: "",
  campanha: "",
});

export type SubmitSummary = {
  id?: string;
  tema?: string;
  tipo?: string;
  texto_opiniao?: string;
};

const buildOpinionDefaultValues = (): OpinionFormValues => ({
  opiniao_id: "",
  usuario_id: "",
  horario_opiniao: "",
  acao: "Registrar opinião",
  opiniao: "",
  outra_opiniao: "",
  tipo_opiniao: "",
  texto_opiniao: "",
});

export default function FormsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOutraOpiniao, setShowOutraOpiniao] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<UserFormValues | null>(null);
  const [summary, setSummary] = useState<SubmitSummary | null>(null);
  const [optIn, setOptIn] = useState(false);
  const [savingOptIn, setSavingOptIn] = useState(false);
  const [optInSaved, setOptInSaved] = useState(false);
  const navigate = useNavigate();
  const {
    control: userControl,
    formState: { errors: userErrors },
    handleSubmit: handleUserSubmit,
  } = useForm<UserFormValues>({
    defaultValues: buildUserDefaultValues(),
  });

  const {
    control: opinionControl,
    formState: { errors: opinionErrors },
    handleSubmit: handleOpinionSubmit,
    setValue: setOpinionValue,
    reset: resetOpinionForm,
  } = useForm<OpinionFormValues>({
    defaultValues: buildOpinionDefaultValues(),
  });

  async function onSubmitUser(data: UserFormValues) {
    console.log("User form:", data);
    let newUserId = data.id?.trim() || "";

    try {
      const response: any = await createUSer(data);
      console.log("Create user response:", response);

      const idFromResponse = Array.isArray(response)
        ? response[0]?.id
        : (response as any)?.id;

      newUserId = idFromResponse || newUserId || crypto.randomUUID();
      setUser(Array.isArray(response) ? response[0] : response);
    } catch (error) {
      console.error("Erro ao criar usuário, usando ID local:", error);
      newUserId = newUserId || crypto.randomUUID();
    }

    console.log("Generated user ID:", newUserId);
    setUserId(newUserId);

    // Pré-preenche campos da opinião:
    setOpinionValue("usuario_id", newUserId);
    setOpinionValue("acao", "Registrar opinião");
    setOpinionValue("horario_opiniao", new Date().toISOString());

    setCurrentStep(1);
  }

  async function onSubmitOpinion(data: OpinionFormValues) {
    console.log("Opinion form:", data);
    try {
      console.log("entrei")
      // garante consistência do payload
      const payload = {
        usuario_id: userId || data.usuario_id,
        opiniao: data.opiniao,
        outra_opiniao: data.opiniao === "Outros" ? data.outra_opiniao : "",
        tipo_opiniao: data.tipo_opiniao,
        texto_opiniao: data.texto_opiniao,
        horario_opiniao: new Date().toISOString(),
        acao: "Registrar opinião",
      };
      console.log(payload)
      await submitOpinion(payload);

      setSummary({
        id: payload.usuario_id,
        tema:
          payload.opiniao === "Outros"
            ? payload.outra_opiniao
            : payload.opiniao,
        tipo: payload.tipo_opiniao,
        texto_opiniao: payload.texto_opiniao,
      });

      setCurrentStep(2);
    } catch (err) {
      console.error("Erro ao enviar opinião:", err);
      // aqui você pode mostrar um <Alert /> no step 1
    }
  }

  async function saveOptInPreference() {
    navigate("/");
  }

  const handleOpinionInputChange = (
    name: keyof OpinionFormValues,
    value: unknown
  ) => {
    if (name === "opiniao") {
      const isOutros = value === "Outros";
      setShowOutraOpiniao(isOutros);

      if (!isOutros) {
        setOpinionValue("outra_opiniao", "");
      }
    }
  };

  const opinionInputs = useMemo(() => {
    const base = getOpinionInputs();

    const filtered = base.filter((i) =>
      showOutraOpiniao ? true : i.name !== "outra_opiniao"
    );

    return filtered.map((i) => {
      if (i.name === "usuario_id") {
        // (Opcional) se seu InputType suportar "disabled", deixe travado
        return {
          ...i,
          disabled: false,
          readOnly: true, // ou inputProps: { readOnly: true } (depende do seu Forms)
        };
      }

      if (i.name === "outra_opiniao") {
        return {
          ...i,
          rules: showOutraOpiniao
            ? { required: "Descreva qual é a outra opinião" }
            : undefined,
        };
      }

      return i;
    });
  }, [showOutraOpiniao, userId]);

  return (
    <Box className={styles.container}>
      <Box className={styles.formBox}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <Button
            variant="text"
            startIcon={<KeyboardBackspaceIcon />}
            onClick={() => navigate("/")}
            sx={{ mb: 1, color: "#1e8e9c" }}
          >
            Ir para tela padrão do projeto
          </Button>
        </Box>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ mb: 3, textAlign: "center" }}
        >
          Formulário de Opinião
        </Typography>
        <Box className={styles.stepperBox}>
          <HorizontalLinearAlternativeLabelStepper
            step={steps}
            activeNumberStep={currentStep}
          />
        </Box>

        <Box>
          {currentStep === 0 && (
            <Forms<UserFormValues>
              inputsList={getUserInputs()}
              control={userControl}
              errors={userErrors}
              onInputChange={() => {}}
            />
          )}

          {currentStep === 1 && (
            <Forms<OpinionFormValues>
              inputsList={opinionInputs}
              control={opinionControl}
              errors={opinionErrors}
              onInputChange={handleOpinionInputChange}
            />
          )}

          <Box className={styles.buttonsBox}>
            {currentStep === 0 && (
              <Button
                className={styles.submitButton}
                onClick={handleUserSubmit(onSubmitUser)}
              >
                Enviar usuário
              </Button>
            )}

            {currentStep === 1 && (
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  className={styles.submitButton}
                  onClick={handleOpinionSubmit(onSubmitOpinion)}
                  sx={{ minWidth: { xs: "100%", sm: "35%" } }}
                >
                  Enviar opinião
                </Button>
                <IconButton
                  aria-label="Voltar para cadastro do usuário"
                  onClick={() => setCurrentStep(0)}
                  sx={{
                    position: "absolute",
                    left: 0,
                    color: "#1e8e9c",
                  }}
                >
                  <KeyboardBackspaceIcon />
                </IconButton>
              </Box>
            )}
            {currentStep === 2 && (
              <Card
                elevation={0}
                sx={{ border: "1px solid #eee", borderRadius: 3 }}
              >
                <CardContent>
                  <Stack spacing={2.5} alignItems="center" textAlign="center">
                    {/* Sucesso */}
                    <Typography variant="h5" fontWeight={700}>
                      Opinião registrada com sucesso ✅
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ maxWidth: 520 }}
                    >
                      Valeu por participar! Isso ajuda a priorizar melhorias e
                      ações reais.
                    </Typography>
                    {/* Resumo */}
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                      justifyContent="center"
                      sx={{ maxWidth: 720 }}
                    >
                      {summary?.tema && (
                        <Chip label={`Tema: ${summary.tema}`} />
                      )}
                      {summary?.tipo && (
                        <Chip label={`Tipo: ${summary.tipo}`} />
                      )}
                      {summary?.texto_opiniao && (
                        <Chip
                          label={`Texto da opinião: ${summary.texto_opiniao}`}
                        />
                      )}
                    </Stack>

                    <Divider sx={{ width: "100%", maxWidth: 720 }} />

                    {/* CTAs */}
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{ pt: 1 }}
                    >
                      <Button
                        variant="contained"
                        disabled={savingOptIn}
                        onClick={async () => {
                          // salva opt-in se marcado
                          await saveOptInPreference();

                          // finalizar fluxo (você escolhe)
                          // 1) reset total:
                          // setCurrentStep(0);

                          // 2) ou levar pro início:
                          setCurrentStep(0);
                        }}
                      >
                        {savingOptIn ? "Salvando..." : "Concluir"}
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSummary(null);
                          setShowOutraOpiniao(false);

                          resetOpinionForm({
                            ...buildOpinionDefaultValues(),
                            usuario_id: userId,
                            acao: "Registrar opinião",
                            horario_opiniao: new Date().toISOString(),
                          });

                          setCurrentStep(1);
                        }}
                      >
                        Enviar outra opinião
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
