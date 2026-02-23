import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import Forms, { type InputType } from "@/components/Forms";
import Button from "@/components/Button";
import HorizontalLinearAlternativeLabelStepper from "@/components/stepper";
import type {
  BuilderBlock,
  BuilderFieldLayout,
  BuilderSchema,
  FormStyleOptions,
} from "../types/formsTypes";
import styles from "./formPreview.module.css";

type PreviewValues = Record<string, unknown>;

type FormPreviewProps = {
  formSchema: BuilderSchema;
  activeBlockIndex?: number;
  formStyles: FormStyleOptions;
};

type PreviewPage = {
  title: string;
  inputs: InputType<any>[];
};

function sortFields(a: BuilderFieldLayout, b: BuilderFieldLayout) {
  if (a.ordem !== b.ordem) return a.ordem - b.ordem;
  if (a.layout.row !== b.layout.row) return a.layout.row - b.layout.row;
  return a.layout.column - b.layout.column;
}

function resolveColSpan(rowSize: number) {
  if (rowSize >= 3) return 4;
  if (rowSize === 2) return 6;
  return 12;
}

function buildFieldRules(field: BuilderFieldLayout) {
  const rules: Record<string, unknown> = {};

  if (field.required) {
    rules.required = `${field.label} e obrigatorio`;
  }

  if (field.type === "number") {
    if (typeof field.min === "number") {
      rules.min = {
        value: field.min,
        message: `Valor minimo: ${field.min}`,
      };
    }
    if (typeof field.max === "number") {
      rules.max = {
        value: field.max,
        message: `Valor maximo: ${field.max}`,
      };
    }
  }

  if (field.type === "textarea") {
    if (typeof field.min === "number") {
      rules.minLength = {
        value: field.min,
        message: `Minimo de ${field.min} caracteres`,
      };
    }
    if (typeof field.max === "number") {
      rules.maxLength = {
        value: field.max,
        message: `Maximo de ${field.max} caracteres`,
      };
    }
  }

  return Object.keys(rules).length ? rules : undefined;
}

function mapBuilderFieldToInput(
  field: BuilderFieldLayout,
  rowSize: number,
): InputType<any> {
  const base: InputType<any> = {
    name: field.name,
    title: field.label,
    placeholder: field.placeholder,
    colSpan: resolveColSpan(rowSize),
    rules: buildFieldRules(field),
    type: "text",
  };

  switch (field.type) {
    case "text":
      return {
        ...base,
        type: "text",
      };
    case "number":
      return {
        ...base,
        type: "number",
      };
    case "email":
      return {
        ...base,
        type: "email",
      };
    case "Select":
      return {
        ...base,
        type: "Select",
        selectOptions: (field.options?.items ?? [])
          .map((option) => option.trim())
          .filter(Boolean)
          .map((option) => ({
            label: option,
            value: option,
          })),
      };
    case "inputFile":
      return {
        ...base,
        type: "inputFile",
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
      return base;
  }
}

function buildDefaultValues(fields: BuilderFieldLayout[]) {
  return fields.reduce<PreviewValues>((accumulator, field) => {
    if (field.type === "switch") {
      accumulator[field.name] = Boolean(field.options?.defaultOn);
      return accumulator;
    }

    if (field.type === "Select") {
      accumulator[field.name] = null;
      return accumulator;
    }

    accumulator[field.name] = "";
    return accumulator;
  }, {});
}

function normalizeBlocks(blocks: BuilderBlock[]) {
  return blocks
    .map((block, index) => ({
      title: block.title?.trim() || `Aba ${index + 1}`,
      fields: (Array.isArray(block.fields) ? block.fields : [])
        .map((name) => name.trim())
        .filter(Boolean),
    }))
    .filter((block) => block.fields.length > 0);
}

function mapFieldsToInputs(fields: BuilderFieldLayout[]) {
  const rowSizes = fields.reduce<Record<number, number>>((accumulator, field) => {
    const row = field.layout.row;
    accumulator[row] = (accumulator[row] ?? 0) + 1;
    return accumulator;
  }, {});

  return fields.map((field) =>
    mapBuilderFieldToInput(field, rowSizes[field.layout.row] ?? 1),
  );
}

export default function FormPreview({
  formSchema,
  activeBlockIndex = 0,
  formStyles,
}: FormPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const fields = useMemo(
    () => [...formSchema.fields].sort(sortFields),
    [formSchema.fields],
  );

  const pages = useMemo<PreviewPage[]>(() => {
    const fieldMap = new Map(fields.map((field) => [field.name, field]));
    const blocks = normalizeBlocks(formSchema.blocks ?? []);

    if (blocks.length) {
      const blockPages = blocks
        .map((block) => ({
          title: block.title,
          fields: block.fields
            .map((name) => fieldMap.get(name))
            .filter((field): field is BuilderFieldLayout => Boolean(field)),
        }))
        .filter((page) => page.fields.length > 0)
        .map((page) => ({
          title: page.title,
          inputs: mapFieldsToInputs(page.fields),
        }));

      if (blockPages.length) {
        return blockPages;
      }
    }

    if (!fields.length) return [];
    return [
      {
        title: "Formulario",
        inputs: mapFieldsToInputs(fields),
      },
    ];
  }, [fields, formSchema.blocks]);

  const hasInputs = pages.some((page) => page.inputs.length > 0);

  const defaultValues = useMemo(() => buildDefaultValues(fields), [fields]);

  const {
    control,
    formState: { errors },
    reset,
  } = useForm<PreviewValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    setCurrentStep(0);
  }, [pages.length, formSchema.title]);

  useEffect(() => {
    if (!pages.length) {
      setCurrentStep(0);
      return;
    }
    const nextStep = Math.min(
      Math.max(activeBlockIndex, 0),
      Math.max(pages.length - 1, 0),
    );
    setCurrentStep(nextStep);
  }, [activeBlockIndex, pages.length]);

  const steps = useMemo(() => {
    if (!pages.length) return [];
    return [...pages.map((page) => page.title), "Concluido"];
  }, [pages]);

  const isCompleted = pages.length > 0 && currentStep >= pages.length;
  const currentPage = !isCompleted ? pages[currentStep] : null;

  const handleNext = () => {
    if (isCompleted) {
      setCurrentStep(0);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, pages.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const themeStyle = {
    "--preview-bg": formStyles.formBackgroundColor,
    "--preview-border": formStyles.formBorderColor,
    "--preview-title": formStyles.titleColor,
    "--preview-description": formStyles.descriptionColor,
    "--preview-button-bg": formStyles.buttonBackgroundColor,
    "--preview-button-text": formStyles.buttonTextColor,
  } as CSSProperties;

  return (
    <Box className={styles.container} style={themeStyle}>
      <Typography className={styles.title}>
        {formSchema.title || "Formulario sem titulo"}
      </Typography>
      {formSchema.description ? (
        <Typography className={styles.description}>
          {formSchema.description}
        </Typography>
      ) : null}

      {!hasInputs ? (
        <Alert severity="info">
          Adicione campos no construtor para visualizar o preview.
        </Alert>
      ) : (
        <>
          {steps.length > 1 ? (
            <Box className={styles.stepperBox}>
              <HorizontalLinearAlternativeLabelStepper
                step={steps}
                activeNumberStep={currentStep}
              />
            </Box>
          ) : null}

          {isCompleted ? (
            <Alert severity="success">
              Fluxo de abas concluido no preview.
            </Alert>
          ) : (
            <>
              {currentPage?.title ? (
                <Typography className={styles.blockTitle}>
                  {currentPage.title}
                </Typography>
              ) : null}
              <Forms<any>
                inputsList={currentPage?.inputs ?? []}
                control={control}
                errors={errors}
              />
            </>
          )}

          {pages.length > 0 ? (
            <Box className={styles.actions}>
              <Button
                onClick={handleBack}
                className={styles.navButton}
                disabled={currentStep === 0}
              >
                Voltar
              </Button>
              <Button onClick={handleNext} className={styles.navButton}>
                {isCompleted
                  ? "Reiniciar"
                  : currentStep === pages.length - 1
                    ? "Concluir"
                    : "Proximo"}
              </Button>
            </Box>
          ) : null}
        </>
      )}
    </Box>
  );
}
