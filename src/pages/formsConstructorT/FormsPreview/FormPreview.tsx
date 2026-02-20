import { useEffect, useMemo } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import Forms, { type InputType } from "@/components/Forms";
import type {
  BuilderFieldLayout,
  BuilderSchema,
} from "../types/formsTypes";
import styles from "./formPreview.module.css";

type PreviewValues = Record<string, unknown>;

type FormPreviewProps = {
  formSchema: BuilderSchema;
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

export default function FormPreview({ formSchema }: FormPreviewProps) {
  const fields = useMemo(
    () => [...formSchema.fields].sort(sortFields),
    [formSchema.fields],
  );

  const rowSizes = useMemo(() => {
    return fields.reduce<Record<number, number>>((accumulator, field) => {
      const row = field.layout.row;
      accumulator[row] = (accumulator[row] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [fields]);

  const inputs = useMemo<InputType<any>[]>(() => {
    return fields.map((field) =>
      mapBuilderFieldToInput(field, rowSizes[field.layout.row] ?? 1),
    );
  }, [fields, rowSizes]);

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

  return (
    <Box className={styles.container}>
      <Typography className={styles.title}>
        {formSchema.title || "Formulario sem titulo"}
      </Typography>
      {formSchema.description ? (
        <Typography className={styles.description}>
          {formSchema.description}
        </Typography>
      ) : null}

      {!inputs.length ? (
        <Alert severity="info">
          Adicione campos no construtor para visualizar o preview.
        </Alert>
      ) : (
        <Forms<any> inputsList={inputs} control={control} errors={errors} />
      )}
    </Box>
  );
}
