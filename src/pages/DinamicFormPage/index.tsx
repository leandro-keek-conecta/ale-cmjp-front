import { Box, Button, IconButton } from "@mui/material";
import styles from "./FormsPage.module.css";
import HorizontalLinearAlternativeLabelStepper from "../../components/stepper";
import { useEffect, useMemo, useState } from "react";
import Forms, { type InputType } from "../../components/Forms";
import { useForm } from "react-hook-form";
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
import { useNavigate, useParams } from "react-router-dom";
import getForms from "@/services/forms/formsService";
import { submitOpiniionTest } from "@/services/opiniao/opiniaoService";
import { useAuth } from "@/context/AuthContext";

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

const DEFAULT_PROJECT_ID = 1;
const DEFAULT_FORM_VERSION_ID = 1;

export type SubmitSummary = {
  id?: string;
  tema?: string;
  tipo?: string;
  texto_opiniao?: string;
};

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

const compactObject = (obj: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  );

const getUtmParams = () => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const getParam = (key: string) => {
    const value = params.get(key);
    return value && value.trim() ? value : undefined;
  };

  return {
    utmSource: getParam("utm_source"),
    utmMedium: getParam("utm_medium"),
    utmCampaign: getParam("utm_campaign"),
  };
};

const getDeviceTypeFromUA = (ua: string) => {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
};

const getOSFromUA = (ua: string) => {
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return undefined;
};

const getBrowserFromUA = (ua: string) => {
  if (/Edg/i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Chrome/i.test(ua) && !/Edg|OPR|Opera/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua) && !/Chrome|Edg|OPR|Opera/i.test(ua)) return "Safari";
  return undefined;
};

const buildFormResponseContext = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {};
  }

  const userAgent = navigator.userAgent || undefined;
  const locale = navigator.language || undefined;
  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  const referrer = typeof document === "undefined" ? "" : document.referrer;

  const context = {
    userAgent,
    locale,
    timezone,
    deviceType: userAgent ? getDeviceTypeFromUA(userAgent) : undefined,
    os: userAgent ? getOSFromUA(userAgent) : undefined,
    browser: userAgent ? getBrowserFromUA(userAgent) : undefined,
    metadata: referrer ? { referrer } : undefined,
    ...getUtmParams(),
  };

  return compactObject(context);
};

const coerceNumberValue = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return null;
};

const coerceValueForInput = (input: InputType<any>, value: unknown) => {
  switch (input.type) {
    case "number":
      return coerceNumberValue(value);
    case "switch":
      return typeof value === "boolean" ? value : Boolean(value);
    default:
      return value;
  }
};

function toTrimmedString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function getFieldOptions(source: unknown) {
  return (source && typeof source === "object"
    ? (source as Record<string, unknown>).options
    : undefined) as Record<string, unknown> | undefined;
}

function resolveFieldInputType(
  field: Record<string, unknown>,
  schemaRule?: Record<string, unknown>,
): InputType<any>["type"] {
  const mergedField = {
    ...(schemaRule ?? {}),
    ...field,
  };
  const rawType = toTrimmedString(mergedField.type).toLowerCase();
  const options = getFieldOptions(mergedField);
  const hasSelectItems = Array.isArray(options?.items);
  const hasSelectOptions = Array.isArray(options?.selectOptions);
  const rows = toOptionalNumber(mergedField.rows ?? options?.rows);

  if (rawType === "number") return "number";
  if (rawType === "email") return "email";
  if (rawType === "password") return "password";
  if (rawType === "date") return "Date";
  if (rawType === "textarea" || (rawType === "text" && (rows ?? 0) > 1)) {
    return "textarea";
  }
  if (rawType === "switch" || rawType === "boolean") return "switch";
  if (rawType === "inputfile" || rawType === "file") return "inputFile";
  if (rawType === "select" || hasSelectItems || hasSelectOptions) {
    return "Select";
  }

  return "text";
}

function normalizeSelectOptions(
  field: Record<string, unknown>,
  schemaRule?: Record<string, unknown>,
) {
  const fieldOptions = getFieldOptions(field);
  const schemaOptions = getFieldOptions(schemaRule);

  const rawItems = Array.isArray(fieldOptions?.items)
    ? fieldOptions.items
    : Array.isArray(fieldOptions?.selectOptions)
      ? fieldOptions.selectOptions
      : Array.isArray(schemaOptions?.items)
        ? schemaOptions.items
        : Array.isArray(schemaOptions?.selectOptions)
          ? schemaOptions.selectOptions
          : [];

  return rawItems
    .map((item) => {
      if (typeof item === "string") {
        const label = item.trim();
        return label ? { label, value: label } : null;
      }

      if (item && typeof item === "object") {
        const option = item as Record<string, unknown>;
        const rawLabel = option.label ?? option.value ?? option.id;
        const rawValue = option.value ?? option.label ?? option.id;

        const label = toTrimmedString(rawLabel);
        if (!label) return null;

        if (
          typeof rawValue === "string" ||
          typeof rawValue === "number" ||
          typeof rawValue === "boolean"
        ) {
          return { label, value: rawValue };
        }

        return { label, value: label };
      }

      return null;
    })
    .filter(Boolean) as { label: string; value: string | number | boolean }[];
}

function isRuleObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rule = value as Record<string, unknown>;
  return (
    "type" in rule ||
    "required" in rule ||
    "options" in rule ||
    "rows" in rule ||
    "min" in rule ||
    "max" in rule
  );
}

function extractSchemaRulesByName(schema: unknown) {
  const result: Record<string, Record<string, unknown>> = {};

  const collectRules = (source: unknown) => {
    if (!source || typeof source !== "object" || Array.isArray(source)) return;
    const sourceObject = source as Record<string, unknown>;

    Object.entries(sourceObject).forEach(([key, value]) => {
      if (
        key === "blocks" ||
        key === "styles" ||
        key === "title" ||
        key === "description" ||
        key === "fields" ||
        key === "schema"
      ) {
        return;
      }
      if (!isRuleObject(value)) return;
      result[key] = value;
    });
  };

  if (schema && typeof schema === "object" && !Array.isArray(schema)) {
    const schemaObject = schema as Record<string, unknown>;
    collectRules(schemaObject.schema);
    collectRules(schemaObject);
  }

  return result;
}

export default function DinamicFormsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [pages, setPages] = useState<FormPage[]>([]);
  const [formVersionId, setFormVersionId] = useState<number>(
    DEFAULT_FORM_VERSION_ID,
  );
  const [projectId, setProjectId] = useState<number>(DEFAULT_PROJECT_ID);
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
  const { project: projectParam, slug: slugParam } = useParams<{
    project?: string;
    slug?: string;
  }>();
  const projectName = projectParam ?? "";
  const formSlug = slugParam ?? "";
  const { user } = useAuth();
  const responseContext = useMemo(() => buildFormResponseContext(), []);

  const {
    control,
    formState: { errors },
    trigger,
    getValues,
    setValue,
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
        let resolvedValue: unknown;
        if (input.name === "telefone") {
          resolvedValue = formatPhoneInput(String(values[input.name] ?? ""));
          acc[input.name] = coerceValueForInput(input, resolvedValue);
          return acc;
        }
        if (input.name === "outra_opiniao") {
          const rawValue = values[input.name];
          resolvedValue =
            rawValue === undefined || rawValue === "" ? "" : rawValue;
          acc[input.name] = coerceValueForInput(input, resolvedValue);
          return acc;
        }
        resolvedValue =
          values[input.name] ?? (input.type === "switch" ? false : "");
        acc[input.name] = coerceValueForInput(input, resolvedValue);
        return acc;
      },
      {} as Record<string, any>,
    );
  };

  async function onSubmitUser(values: Record<string, any>) {
    setUserAlert(null);
    try {
      const fields = buildFieldsPayloadForInputs(
        values,
        pages.flatMap((pageItem) => pageItem.inputs),
      );
      console.log("Payload parcial acumulado para envio final:", fields);
      setUserAlert({
        severity: "success",
        message: "Dados do usuário validados com sucesso.",
      });
      setCurrentStep((prev) => Math.min(prev + 1, pages.length));
    } catch (error) {
      console.error("Erro ao validar dados do usuário:", error);
      setUserAlert({
        severity: "error",
        message: "Não foi possível validar os dados do usuário. Tente novamente.",
      });
    }
  }

  async function onSubmitOpinion(values: Record<string, any>) {
    setOpinionAlert(null);
    try {
      const fields = buildFieldsPayloadForInputs(
        values,
        pages.flatMap((p) => p.inputs),
      );
      const now = new Date().toISOString();
      await submitOpiniionTest({
        formVersionId,
        projetoId: projectId,
        status: "COMPLETED",
        submittedAt: now,
        completedAt: now,
        fields,
        userId: user?.id,
        ...responseContext,
      });

      setSummary({
        tema:
          fields.opiniao === "Outros" ? fields.outra_opiniao : fields.opiniao,
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

  function mapBackendFieldToInput(
    field: Record<string, unknown>,
    schemaRule?: Record<string, unknown>,
  ): InputType<any> {
    const inputType = resolveFieldInputType(field, schemaRule);
    const label =
      toTrimmedString(field.label) ||
      toTrimmedString(field.name) ||
      "Campo";
    const fieldName = toTrimmedString(field.name);
    const fieldOptions = getFieldOptions(field);
    const schemaOptions = getFieldOptions(schemaRule);
    const isRequired = Boolean(field.required ?? schemaRule?.required);
    const placeholder =
      toTrimmedString(field.placeholder) ||
      toTrimmedString(fieldOptions?.placeholder) ||
      toTrimmedString(schemaRule?.placeholder) ||
      toTrimmedString(schemaOptions?.placeholder) ||
      undefined;

    const base = {
      name: fieldName,
      title: label,
      colSpan: 12,
      ...(placeholder ? { placeholder } : {}),
      rules: isRequired
        ? { required: `${label} e obrigatorio` }
        : undefined,
    };

    if (inputType === "Select") {
      return {
        ...base,
        type: "Select",
        selectOptions: normalizeSelectOptions(field, schemaRule),
      };
    }

    return {
      ...base,
      type: inputType,
    };
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
    fields: Record<string, unknown>[],
    schemaRulesByName: Record<string, Record<string, unknown>>,
  ) {
    const fieldMap = new Map<string, Record<string, unknown>>();
    fields.forEach((field) => {
      const fieldName = toTrimmedString(field.name);
      if (!fieldName) return;
      fieldMap.set(fieldName, field);
    });

    const mappedPages = blocks.map((block) => ({
      title: block.title,
      inputs: block.fields.reduce<InputType<any>[]>((accumulator, fieldName) => {
        const field = fieldMap.get(fieldName);
        if (!field) return accumulator;
        const resolvedName = toTrimmedString(field.name);
        accumulator.push(
          mapBackendFieldToInput(field, schemaRulesByName[resolvedName]),
        );
        return accumulator;
      }, []),
    }));

    const assignedNames = new Set(
      blocks.flatMap((block) =>
        Array.isArray(block.fields) ? block.fields : [],
      ),
    );
    const unassignedFields = fields.filter(
      (field) => !assignedNames.has(toTrimmedString(field.name)),
    );

    if (unassignedFields.length) {
      mappedPages.push({
        title: "Formulario",
        inputs: unassignedFields.map((field) => {
          const fieldName = toTrimmedString(field.name);
          return mapBackendFieldToInput(field, schemaRulesByName[fieldName]);
        }),
      });
    }

    return mappedPages.filter((page) => page.inputs.length > 0);
  }
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await getForms(formSlug, projectName);

        const activeVersion = response.data.data.activeVersion;
        const projectFromResponse = response.data.data.projeto;

        const blocks = Array.isArray(activeVersion?.schema?.blocks)
          ? activeVersion.schema.blocks
          : [];
        const fields = Array.isArray(activeVersion?.fields)
          ? activeVersion.fields
          : [];
        const schemaRulesByName = extractSchemaRulesByName(activeVersion?.schema);

        const pages = groupFieldsByBlocks(blocks, fields, schemaRulesByName);
        setPages(pages);
        if (typeof activeVersion?.id === "number") {
          setFormVersionId(activeVersion.id);
        }
        if (typeof projectFromResponse?.id === "number") {
          setProjectId(projectFromResponse.id);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do formulário:", error);
      }
    };

    fetchFormData();
  }, [formSlug, projectName]);

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
    console.log("Submitting step", currentStep, values);
    if (currentStep === 0) {
      await onSubmitUser(values);
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

