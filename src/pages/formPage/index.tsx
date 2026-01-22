import { Box, Button, IconButton } from "@mui/material";
import styles from "./FormsPage.module.css";
import HorizontalLinearAlternativeLabelStepper from "../../components/stepper";
import { useMemo, useState } from "react";
import Forms from "../../components/Forms";
import { getUserInputs } from "./userImputList/user";
import { useForm } from "react-hook-form";
import type { UserFormValues } from "../../types/user";
import type { OpinionFormValues } from "../../types/opiniao";
import { getOpinionInputs } from "./opinionList/opinionImputList";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import { createUSer } from "../../services/user/userService";
import { useNavigate } from "react-router-dom";
import { submitOpinion } from "../../services/opiniao/opiniaoService";

const steps = ["Dados do Usuário", "Dados da Opinião", "Concluído"];

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

const PHONE_FULL_REGEX = /^\d{2} 9 \d{4} - \d{4}$/;

const formatPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const ddd = digits.slice(0, 2);
  const ninth = digits.slice(2, 3);
  const part1 = digits.slice(3, 7);
  const part2 = digits.slice(7, 11);

  let formatted = "";
  if (ddd) formatted += ddd;
  if (ninth) formatted += ` ${ninth}`;
  if (part1) formatted += ` ${part1}`;
  if (part2) formatted += ` - ${part2}`;
  return formatted;
};

const normalizePhoneForSubmit = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  const ddd = digits.slice(0, 2);
  let rest = digits.slice(2);

  if (rest.length === 9 && rest.startsWith("9")) {
    rest = rest.slice(1);
  }

  if (!ddd || !rest) return digits;
  return `55${ddd}${rest}`;
};

export default function FormsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOutraOpiniao, setShowOutraOpiniao] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [summary, setSummary] = useState<SubmitSummary | null>(null);
  const [isOpinionTextModalOpen, setIsOpinionTextModalOpen] = useState(false);
  const [userAlert, setUserAlert] = useState<{
    severity: "success" | "error";
    message: string;
  } | null>(null);
  const [opinionAlert, setOpinionAlert] = useState<{
    severity: "success" | "error";
    message: string;
  } | null>(null);
  const navigate = useNavigate();
  const {
    control: userControl,
    formState: { errors: userErrors },
    handleSubmit: handleUserSubmit,
    setValue: setUserValue,
    setError: setUserError,
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
    setUserAlert(null);
    let newUserId = data.id?.trim() || "";
    if (!PHONE_FULL_REGEX.test(data.telefone)) {
      setUserError("telefone", {
        type: "pattern",
        message: "Use o formato 83 9 9999 - 9999",
      });
      return;
    }
    const payload = {
      ...data,
      telefone: normalizePhoneForSubmit(data.telefone),
    };

    try {
      const response: any = await createUSer(payload);
      console.log("Create user response:", response);

      const idFromResponse = Array.isArray(response)
        ? response[0]?.id
        : (response as any)?.id;

      newUserId = idFromResponse || newUserId || crypto.randomUUID();
      setUserAlert({
        severity: "success",
        message: "Usuário cadastrado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao criar usuário, usando ID local:", error);
      newUserId = newUserId || crypto.randomUUID();
      setUserAlert({
        severity: "error",
        message:
          "Não foi possível cadastrar o usuário na API. Geramos um ID local para continuar.",
      });
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
    setOpinionAlert(null);
    try {
      console.log("entrei");
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
      console.log(payload);
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
      setOpinionAlert({
        severity: "success",
        message: "Opinião enviada com sucesso.",
      });

      setCurrentStep(2);
    } catch (err) {
      console.error("Erro ao enviar opinião:", err);
      setOpinionAlert({
        severity: "error",
        message: "Não foi possível enviar a opinião. Tente novamente.",
      });
    }
  }

  async function saveOptInPreference() {
    navigate("/");
  }

  const handleOpinionInputChange = (
    name: keyof OpinionFormValues,
    value: unknown,
  ) => {
    if (name === "opiniao") {
      const isOutros = value === "Outros";
      setShowOutraOpiniao(isOutros);

      if (!isOutros) {
        setOpinionValue("outra_opiniao", "");
      }
    }
  };

  const handleUserInputChange = (
    name: keyof UserFormValues,
    value: unknown,
  ) => {
    if (name !== "telefone") return;

    const raw = String(value ?? "");
    const formatted = formatPhoneInput(raw);
    if (formatted !== raw) {
      setUserValue("telefone", formatted, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const opinionInputs = useMemo(() => {
    const base = getOpinionInputs();

    const filtered = base.filter((i) =>
      showOutraOpiniao ? true : i.name !== "outra_opiniao",
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

  const getOpinionPreviewText = (text: string) =>
    text.length > 70 ? `${text.slice(0, 70)}...` : text;

  return (
    <Box className={styles.container}>
      <Box className={styles.formBox}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ mb: 3, textAlign: "center" }}
        >
          Registre Sua Opinião
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
              onInputChange={handleUserInputChange}
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
          {(currentStep === 0 || currentStep === 1) && userAlert && (
            <Alert severity={userAlert.severity} sx={{ mt: 2 }}>
              {userAlert.message}
            </Alert>
          )}
          {currentStep === 1 && opinionAlert && (
            <Alert severity={opinionAlert.severity} sx={{ mt: 2 }}>
              {opinionAlert.message}
            </Alert>
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
                          label={`Texto da opinião: ${getOpinionPreviewText(
                            summary.texto_opiniao,
                          )}`}
                          onClick={() => setIsOpinionTextModalOpen(true)}
                          clickable
                          title="Ver texto completo"
                          sx={{
                            maxWidth: "100%",
                            ".MuiChip-label": {
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      )}
                    </Stack>

                    <Divider sx={{ width: "100%", maxWidth: 720 }} />

                    <Dialog
                      open={isOpinionTextModalOpen}
                      onClose={() => setIsOpinionTextModalOpen(false)}
                      fullWidth
                      maxWidth="sm"
                    >
                      <DialogTitle>Texto da opinião</DialogTitle>
                      <DialogContentText component="div" sx={{ px: 2, pb: 2 }}>
                        {summary?.texto_opiniao || "Sem texto"}
                      </DialogContentText>
                    </Dialog>

                    {/* CTAs */}
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{ pt: 1 }}
                    >
                      <Button
                        variant="contained"
                        onClick={async () => {
                          setIsOpinionTextModalOpen(false);
                          // salva opt-in se marcado
                          await saveOptInPreference();

                          // finalizar fluxo (você escolhe)
                          // 1) reset total:
                          // setCurrentStep(0);

                          // 2) ou levar pro início:
                          setCurrentStep(0);
                        }}
                      >
                        Concluir
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSummary(null);
                          setShowOutraOpiniao(false);
                          setOpinionAlert(null);
                          setIsOpinionTextModalOpen(false);

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
