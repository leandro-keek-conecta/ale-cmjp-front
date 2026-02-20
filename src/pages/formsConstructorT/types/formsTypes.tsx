export type FieldType =
  | "text"
  | "number"
  | "email"
  | "Select"
  | "inputFile"
  | "textarea"
  | "switch";

export type FieldOption = {
  id: FieldType;
  label: string;
};

export type BuilderField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;

  helpText?: string;
  helpStyle?: "default" | "highlight";

  min?: number;
  max?: number;
  rows?: number;

  options?: {
    items?: string[];
    onLabel?: string;
    offLabel?: string;
    defaultOn?: boolean;
  };
};

export type BuilderFieldRow = BuilderField[];

export type BuilderFieldLayout = BuilderField & {
  ordem: number;
  layout: {
    row: number;
    column: number;
  };
};

export type GeneratedFieldRule = {
  type: string;
  required: boolean;
  min?: number;
  max?: number;
  rows?: number;
  helpText?: string;
  helpStyle?: "default" | "highlight";
  options?: {
    items?: string[];
    onLabel?: string;
    offLabel?: string;
    defaultOn?: boolean;
  };
};

export type BuilderSchema = {
  title: string;
  description: string;
  fields: BuilderFieldLayout[];
  schema: Record<string, GeneratedFieldRule>;
};

export const FIELD_OPTIONS: FieldOption[] = [
  { id: "text", label: "Texto" },
  { id: "number", label: "Numero" },
  { id: "email", label: "E-mail" },
  { id: "Select", label: "Selecao" },
  { id: "inputFile", label: "Arquivo" },
  { id: "textarea", label: "Area de texto" },
  { id: "switch", label: "Switch" },
];

function createFieldId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeFieldName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function createBuilderField(type: FieldType, label: string): BuilderField {
  const id = createFieldId();
  const normalizedLabel = normalizeFieldName(label);
  const fallbackName = normalizeFieldName(type) || "campo";

  return {
    id,
    name: `${normalizedLabel || fallbackName}_${id.slice(0, 6)}`,
    type,
    label,
    placeholder: `Campo ${label.toLowerCase()}`,
    required: false,
    helpStyle: "default",
    options:
      type === "switch"
        ? { onLabel: "Ligado", offLabel: "Desligado", defaultOn: false }
        : type === "Select"
          ? { items: [] }
          : undefined,
  };
}

function mapToSchemaType(type: FieldType) {
  switch (type) {
    case "textarea":
    case "Select":
      return "text";
    case "switch":
      return "boolean";
    case "inputFile":
      return "file";
    default:
      return type;
  }
}

export function generateSchemaFromBuilder(
  fields: BuilderFieldLayout[],
): Record<string, GeneratedFieldRule> {
  return fields.reduce<Record<string, GeneratedFieldRule>>((accumulator, field) => {
    const nextRule: GeneratedFieldRule = {
      type: mapToSchemaType(field.type),
      required: field.required,
    };

    if (typeof field.min === "number") {
      nextRule.min = field.min;
    }

    if (typeof field.max === "number") {
      nextRule.max = field.max;
    }

    if (typeof field.rows === "number") {
      nextRule.rows = field.rows;
    }

    if (field.helpText) {
      nextRule.helpText = field.helpText;
    }

    if (field.helpStyle) {
      nextRule.helpStyle = field.helpStyle;
    }

    if (field.type === "Select") {
      const cleanedItems = (field.options?.items ?? [])
        .map((item) => item.trim())
        .filter(Boolean);
      nextRule.options = cleanedItems.length ? { items: cleanedItems } : undefined;
    }

    if (field.type === "switch") {
      nextRule.options = {
        onLabel: field.options?.onLabel ?? "Ligado",
        offLabel: field.options?.offLabel ?? "Desligado",
        defaultOn: Boolean(field.options?.defaultOn),
      };
    }

    accumulator[field.name] = nextRule;
    return accumulator;
  }, {});
}
