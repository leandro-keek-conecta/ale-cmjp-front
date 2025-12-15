import { Avatar, Box, Button } from "@mui/material";
import styles from "./FormsPage.module.css";
import HorizontalLinearAlternativeLabelStepper from "../../components/stepper";
import { useMemo, useState } from "react";
import Forms from "../../components/Forms";
import { getUserInputs } from "./userImputList/user";
import { useForm } from "react-hook-form";
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

type SubmitSummary = {
  id?: string;
  tema?: string;
  tipo?: string;
  bairro?: string;
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
  } = useForm<OpinionFormValues>({
    defaultValues: buildOpinionDefaultValues(),
  });

  async function onSubmitUser(data: UserFormValues) {
    console.log("User form:", data);
    const response: any = await createUSer(data);
    console.log("Create user response:", response);
    // ✅ Se você ainda não tem backend criando ID, pode gerar um local:
    const id = data.id?.trim() || crypto.randomUUID();
    setUser(response);
    console.log("Generated user ID:", id);
    setUserId(response.id);

    // ✅ Pré-preenche campos da opinião:
    setOpinionValue("usuario_id", id);
    setOpinionValue("acao", "Registrar opinião");
    setOpinionValue("horario_opiniao", new Date().toISOString());

    setCurrentStep(1);
  }

  function onSubmitOpinion(data: OpinionFormValues) {
    console.log("Opinion form:", data);

    setSummary({
      id: userId, // ajuste conforme seu tipo real
      tema: data.opiniao === "Outros" ? data.outra_opiniao : data.opiniao,
      tipo: data.tipo_opiniao,
      bairro: "", // se quiser puxar do user form, guarde antes em state
    });

    setCurrentStep(2);
  }

  async function saveOptInPreference() {
    if (!optIn) return; // não salva se não optou

    setSavingOptIn(true);
    setOptInSaved(false);

    try {
      // exemplo: salvar preferência vinculada ao usuario_id
      const payload = {
        usuario_id: userId, // você já tem esse state no exemplo anterior
        opt_in: true,
        updated_at: new Date().toISOString(),
      };

      const res = await fetch("/api/campaign/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Falha ao salvar opt-in");

      setOptInSaved(true);
    } catch (e) {
      console.error(e);
      // aqui você pode mostrar snackbar de erro
    } finally {
      setSavingOptIn(false);
    }
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
          placeholder: userId || "ID gerado automaticamente",
          disabled: true,
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
              <Button
                className={styles.submitButton}
                onClick={handleOpinionSubmit(onSubmitOpinion)}
              >
                Enviar opinião
              </Button>
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
                      {summary?.bairro && (
                        <Chip label={`Bairro: ${summary.bairro}`} />
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
                          // enviar outra opinião mantendo o mesmo usuário
                          // reset do form de opinião é recomendável:
                          // resetOpinion(buildOpinionDefaultValues()) -> se você tiver reset do RHF
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
