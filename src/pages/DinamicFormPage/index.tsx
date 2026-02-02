import { Box, Button, IconButton } from "@mui/material";
import styles from "./FormsPage.module.css";
import HorizontalLinearAlternativeLabelStepper from "../../components/stepper";
import { useEffect, useMemo, useState } from "react";
import Forms, { type InputType } from "../../components/Forms";
import { useForm } from "react-hook-form";
import type { UserFormValues } from "../../types/user";
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
import { useNavigate } from "react-router-dom";
import {
  checkFormResponseExists,
  createFormResponse,
  updateFormResponse,
} from "../../services/formResponse/formResponseService";
import getForms from "@/services/forms/formsService";

type FormPage = {
  title: string;
  inputs: InputType<any>[];
};

const USER_FIELDS = [
  "id",
  "horario",
  "nome",
  "telefone",
  "ano_nascimento",
  "genero",
  "bairro",
  "campanha",
] as const;

const DEFAULT_PROJECT_ID = 5;

export type SubmitSummary = {
  id?: string;
  tema?: string;
  tipo?: string;
  texto_opiniao?: string;
};

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

export default function DinamicFormsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [pages, setPages] = useState<FormPage[]>([]);
  const [formVersionId, setFormVersionId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number>(DEFAULT_PROJECT_ID);
  const [responseId, setResponseId] = useState<number | string | null>(null);
  const steps = useMemo(() => {
    const labels = pages.map((p) => p.title);
    return labels.length ? [...labels, "Concluído"] : [];
  }, [pages]);
  const [showOutraOpiniao, setShowOutraOpiniao] = useState(false);
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
    control,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    setError,
    reset,
  } = useForm({
    defaultValues: buildDefaultValuesFromPages(pages),
  });

  const buildFieldsPayloadForInputs = (
    values: Record<string, any>,
    inputs: InputType<any>[],
  ) => {
    return inputs.reduce(
      (acc, input) => {
        if (input.name === "telefone") {
          acc[input.name] = formatPhoneInput(String(values[input.name] ?? ""));
          return acc;
        }
        if (input.name === "outra_opiniao") {
          const rawValue = values[input.name];
          acc[input.name] =
            rawValue === undefined || rawValue === "" ? null : rawValue;
          return acc;
        }
        acc[input.name] =
          values[input.name] ?? (input.type === "switch" ? false : "");
        return acc;
      },
      {} as Record<string, any>,
    );
  };

  const resolveResponseId = (payload: any) => {
    if (!payload) return null;
    return (
      payload?.data?.id ??
      payload?.id ??
      payload?.data?.responseId ??
      payload?.responseId ??
      null
    );
  };

  async function onSubmitUser(
    values: Record<string, any>,
    inputs: InputType<any>[],
  ) {
    const data = values as UserFormValues;
    setUserAlert(null);
    const formattedPhone = formatPhoneInput(data.telefone || "");
    if (!PHONE_FULL_REGEX.test(formattedPhone)) {
      setError("telefone", {
        type: "pattern",
        message: "Use o formato 83 9 9999 - 9999",
      });
      return;
    }
    if (formattedPhone !== data.telefone) {
      setValue("telefone", formattedPhone, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    const resolvedProjectId = projectId || DEFAULT_PROJECT_ID;
    try {
      const existsPayload = await checkFormResponseExists(
        resolvedProjectId,
        "telefone",
        formattedPhone,
      );
      const existsId = resolveResponseId(existsPayload);
      const exists = Boolean(
        existsPayload?.data?.exists ?? existsPayload?.exists ?? existsId,
      );
      if (exists) {
        if (!existsId) {
          setUserAlert({
            severity: "error",
            message:
              "Usuário já cadastrado, mas não foi possível recuperar o ID da resposta.",
          });
          return;
        }
        setResponseId(existsId);
        setUserAlert({
          severity: "success",
          message: "Usuário já cadastrado. Continuando com a opinião.",
        });
        setCurrentStep((prev) => Math.min(prev + 1, pages.length));
        return;
      }

      const versionId = formVersionId ?? 0;
      if (!versionId) {
        setUserAlert({
          severity: "error",
          message: "Versão do formulário não encontrada.",
        });
        return;
      }

      const fields = buildFieldsPayloadForInputs(values, inputs);
      const response = await createFormResponse({
        formVersionId: versionId,
        projetoId: resolvedProjectId,
        status: "STARTED",
        fields,
      });
      const createdId = resolveResponseId(response);
      if (!createdId) {
        setUserAlert({
          severity: "error",
          message: "Não foi possível criar o cadastro do usuário.",
        });
        return;
      }
      setResponseId(createdId);
      setUserAlert({
        severity: "success",
        message: "Usuário cadastrado com sucesso.",
      });
      setCurrentStep((prev) => Math.min(prev + 1, pages.length));
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      setUserAlert({
        severity: "error",
        message: "Não foi possível cadastrar o usuário. Tente novamente.",
      });
    }
  }

  async function onSubmitOpinion(values: Record<string, any>) {
    setOpinionAlert(null);
    try {
      if (!responseId) {
        setOpinionAlert({
          severity: "error",
          message: "Cadastro do usuário não encontrado para atualização.",
        });
        return;
      }

      const fields = buildFieldsPayloadForInputs(
        values,
        pages.flatMap((p) => p.inputs),
      );
      const now = new Date().toISOString();
      await updateFormResponse(responseId, {
        status: "COMPLETED",
        submittedAt: now,
        completedAt: now,
        fields,
      });

      setSummary({
        tema:
          fields.opiniao === "Outros"
            ? fields.outra_opiniao
            : fields.opiniao,
        tipo: fields.tipo_opiniao,
        texto_opiniao: fields.texto_opiniao,
      });
      setOpinionAlert({
        severity: "success",
        message: "Opinião enviada com sucesso.",
      });

      setCurrentStep(pages.length);
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

  /*   const opinionInputs = useMemo(() => {
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
  }, [showOutraOpiniao, userId]); */

  function mapBackendFieldToInput(field: any): InputType<any> {
    const base = {
      name: field.name,
      title: field.label,
      colSpan: 12,
      rules: field.required
        ? { required: `${field.label} é obrigatório` }
        : undefined,
    };

    switch (field.type) {
      case "text":
        return {
          ...base,
          type: field.options?.selectOptions ? "Select" : "text",
          selectOptions: field.options?.selectOptions,
        };

      case "number":
        return {
          ...base,
          type: "text",
        };

      case "textarea":
        return {
          ...base,
          type: "textarea",
        };

      case "switch":
        return {
          ...base,
          type: "switch",
        };

      default:
        return {
          ...base,
          type: "text",
        };
    }
  }

  function buildDefaultValuesFromPages(pages: FormPage[]) {
    return pages
      .flatMap((p) => p.inputs)
      .reduce(
        (acc, input) => {
          acc[input.name] = input.type === "switch" ? false : "";
          return acc;
        },
        {} as Record<string, any>,
      );
  }

  const inputChangeHandlers: Record<string, (value: unknown) => void> = {
    opiniao: (value) => {
      const isOutros = value === "Outros";
      setShowOutraOpiniao(isOutros);
      if (!isOutros) {
        setValue("outra_opiniao", "");
      }
    },
    telefone: (value) => {
      const formatted = formatPhoneInput(String(value ?? ""));
      setValue("telefone", formatted, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
  };

  const handleInputChange = (name: string, value: unknown) => {
    inputChangeHandlers[name]?.(value);
  };

  useEffect(() => {
    if (!pages.length) return;
    reset(buildDefaultValuesFromPages(pages));
  }, [pages, reset]);

  function groupFieldsByBlocks(
    blocks: { title: string; fields: string[] }[],
    fields: any[],
  ) {
    const fieldMap = new Map<string, any>();
    fields.forEach((field) => fieldMap.set(field.name, field));

    return blocks.map((block) => ({
      title: block.title,
      inputs: block.fields
        .map((name) => fieldMap.get(name))
        .filter(Boolean)
        .map(mapBackendFieldToInput),
    }));
  }

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const projectName = "ale-cmjp";
        const slug = "formulario-de-opiniao";

        const response = await getForms(slug, projectName);

        const activeVersion = response.data.data.activeVersion;
        const projectFromResponse = response.data.data.projeto;

        const blocks = activeVersion.schema.blocks;
        const fields = activeVersion.fields;

        const pages = groupFieldsByBlocks(blocks, fields);
        setPages(pages);
        setFormVersionId(
          typeof activeVersion?.id === "number" ? activeVersion.id : null,
        );
        if (typeof projectFromResponse?.id === "number") {
          setProjectId(projectFromResponse.id);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do formulário:", error);
      }
    };

    fetchFormData();
  }, []);

  const page = currentStep < pages.length ? pages[currentStep] : null;
  const resolvedPageInputs = useMemo(() => {
    if (!page) return [];

    return page.inputs.flatMap((input) => {
      if (input.name === "outra_opiniao") {
        if (!showOutraOpiniao) return [];
        return [
          {
            ...input,
            rules: {
              ...(input.rules ?? {}),
              required: "Descreva qual é a outra opinião",
            },
          },
        ];
      }

      return [input];
    });
  }, [page, showOutraOpiniao]);

  const handleStepSubmit = async () => {
    if (!page) return;
    const fields = resolvedPageInputs.map((i) => i.name);
    const valid = await trigger(fields);
    if (!valid) return;

    const values = getValues() as Record<string, any>;
    if (currentStep === 0) {
      await onSubmitUser(values, page.inputs);
      return;
    }
    if (currentStep === pages.length - 1) {
      await onSubmitOpinion(values);
      return;
    }

    setCurrentStep((s) => Math.min(s + 1, pages.length));
  };

  const getOpinionPreviewText = (text: string) =>
    text.length > 70 ? `${text.slice(0, 70)}...` : text;

  const isFormStep = currentStep < pages.length;
  const showBackButton = currentStep > 0 && currentStep < pages.length;
  const primaryButtonLabel =
    currentStep === 0
      ? "Enviar usuário"
      : currentStep === pages.length - 1
        ? "Enviar opinião"
        : "Próximo";

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
          {page && resolvedPageInputs.length > 0 && (
            <Forms
              inputsList={resolvedPageInputs}
              control={control}
              errors={errors}
              onInputChange={handleInputChange}
            />
          )}
          {(currentStep === 0 || currentStep === 1) && userAlert && (
            <Alert severity={userAlert.severity} sx={{ mt: 2 }}>
              {userAlert.message}
            </Alert>
          )}
          {currentStep === pages.length - 1 && opinionAlert && (
            <Alert severity={opinionAlert.severity} sx={{ mt: 2 }}>
              {opinionAlert.message}
            </Alert>
          )}

          <Box className={styles.buttonsBox}>
            {isFormStep && !showBackButton && (
              <Button
                className={styles.submitButton}
                onClick={handleStepSubmit}
              >
                {primaryButtonLabel}
              </Button>
            )}

            {showBackButton && (
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
                  onClick={handleStepSubmit}
                  sx={{ minWidth: { xs: "100%", sm: "35%" } }}
                >
                  {primaryButtonLabel}
                </Button>
                <IconButton
                  aria-label="Voltar para cadastro do usuário"
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(prev - 1, 0))
                  }
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
            {currentStep === pages.length && (
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
                          const currentValues = getValues() as Record<
                            string,
                            any
                          >;
                          const nextValues = buildDefaultValuesFromPages(pages);
                          USER_FIELDS.forEach((field) => {
                            if (currentValues?.[field] !== undefined) {
                              (nextValues as Record<string, any>)[field] =
                                currentValues[field];
                            }
                          });
                          reset(nextValues);
                          setCurrentStep(Math.min(1, pages.length - 1));
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
