import { Box } from "@mui/material";
import styles from "./form.module.css";
import CabecalhoEstilizado from "@/components/CabecalhoEstilizado";
import { useEffect, useMemo, useState } from "react";
import InputOptions, {
  type FormOptionItem,
  type FormTemplateOptionItem,
} from "./inputOptions/InputOptions";
import Button from "@/components/Button";
import {
  type BuilderBlock,
  createBuilderField,
  DEFAULT_FORM_STYLE_OPTIONS,
  FIELD_OPTIONS,
  generateSchemaFromBuilder,
  type BuilderField,
  type BuilderFieldRow,
  type BuilderSchema,
  type FieldType,
  type FormStyleOptions,
} from "./types/formsTypes";
import { FormsDraggable } from "./FormsDraggable/FormsDraggable";
import { DragDropProvider } from "@dnd-kit/react";
import FormPreview from "./FormsPreview/FormPreview";
import getForms, { createForm, updateFormById } from "@/services/forms/formsService";
import { triggerAlert } from "@/services/alert/alertService";
import { getStoredProjectSlug } from "@/utils/project";
import formTemplatesData from "@/templates/form-templates.json";

const MAX_FIELDS_PER_ROW = 3;

type DropPlacement =
  | { type: "new-row" }
  | { type: "side"; rowIndex: number }
  | { type: "below"; rowIndex: number };

type FormTemplateItem = FormTemplateOptionItem & {
  initialVersion: Record<string, unknown>;
};

function normalizeFormTemplates(value: unknown): FormTemplateItem[] {
  const source =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const templates = Array.isArray(source.templates) ? source.templates : [];

  return templates
    .map<FormTemplateItem | null>((template, index) => {
      if (!template || typeof template !== "object") return null;
      const parsedTemplate = template as Record<string, unknown>;
      const rawId = toTrimmedString(parsedTemplate.id);
      const name = toTrimmedString(parsedTemplate.name);
      const initialVersion =
        parsedTemplate.initialVersion &&
        typeof parsedTemplate.initialVersion === "object"
          ? (parsedTemplate.initialVersion as Record<string, unknown>)
          : {};

      if (!name) return null;

      return {
        id: rawId || `template_${index + 1}`,
        name,
        description: toTrimmedString(parsedTemplate.description) || undefined,
        initialVersion,
      };
    })
    .filter((template): template is FormTemplateItem => template !== null);
}

const FORM_TEMPLATES = normalizeFormTemplates(formTemplatesData);

function generateImportedFieldId(index: number) {
  return `imported-${Date.now()}-${index}-${Math.random().toString(16).slice(2, 6)}`;
}

function toTrimmedString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function resolveRequestErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = toTrimmedString(error.message);
    if (message) return message;
  }

  if (error && typeof error === "object") {
    const response = (
      error as { response?: { data?: Record<string, unknown> | string } }
    ).response;
    const data = response?.data;

    if (typeof data === "string") {
      const message = toTrimmedString(data);
      if (message) return message;
    }

    if (data && typeof data === "object") {
      const payload = data as Record<string, unknown>;
      const message = toTrimmedString(payload.message);
      if (message) return message;
      const errorMessage = toTrimmedString(payload.error);
      if (errorMessage) return errorMessage;
    }
  }

  return fallback;
}

function toIdentifierString(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return toTrimmedString(value);
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

function normalizeImportedType(field: Record<string, unknown>): FieldType {
  const rawType = toTrimmedString(field.type).toLowerCase();

  if (rawType === "number") return "number";
  if (rawType === "email") return "email";
  if (rawType === "textarea") return "textarea";
  if (rawType === "switch" || rawType === "boolean") return "switch";
  if (rawType === "inputfile" || rawType === "file") return "inputFile";

  const options = field.options as Record<string, unknown> | undefined;
  const hasSelectItems = Array.isArray(options?.items);
  const hasSelectOptions = Array.isArray(options?.selectOptions);
  if (rawType === "select" || hasSelectItems || hasSelectOptions) {
    return "Select";
  }

  return "text";
}

function normalizeSelectItems(
  field: Record<string, unknown>,
  schemaRule?: Record<string, unknown>,
) {
  const options = field.options as Record<string, unknown> | undefined;
  const schemaOptions = schemaRule?.options as Record<string, unknown> | undefined;
  const rawItems = Array.isArray(options?.items)
    ? options.items
    : Array.isArray(options?.selectOptions)
      ? options.selectOptions
      : Array.isArray(schemaOptions?.items)
        ? schemaOptions.items
        : Array.isArray(schemaOptions?.selectOptions)
          ? schemaOptions.selectOptions
          : [];

  return rawItems
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const value = (item as Record<string, unknown>).label ??
          (item as Record<string, unknown>).value;
        return toTrimmedString(value);
      }
      return "";
    })
    .filter(Boolean);
}

function mapImportedField(
  field: Record<string, unknown>,
  index: number,
  schemaRule?: Record<string, unknown>,
): BuilderField {
  const fieldWithSchema: Record<string, unknown> = {
    ...schemaRule,
    ...field,
  };
  const fieldType = normalizeImportedType(fieldWithSchema);
  const rawName = toTrimmedString(field.name);
  const rawLabel = toTrimmedString(field.label);
  const fallbackLabel = rawName || `Campo ${index + 1}`;

  const options = field.options as Record<string, unknown> | undefined;
  const schemaOptions = schemaRule?.options as Record<string, unknown> | undefined;

  return {
    id:
      toIdentifierString(field.id) ||
      toTrimmedString(field.name) ||
      generateImportedFieldId(index),
    name: rawName || `campo_${index + 1}`,
    label: rawLabel || fallbackLabel,
    type: fieldType,
    required: Boolean(field.required ?? schemaRule?.required),
    placeholder:
      toTrimmedString(field.placeholder) ||
      toTrimmedString(options?.placeholder) ||
      undefined,
    helpText:
      toTrimmedString(field.helpText) ||
      toTrimmedString(options?.helpText) ||
      toTrimmedString(schemaRule?.helpText) ||
      undefined,
    helpStyle:
      field.helpStyle === "highlight" || field.helpStyle === "default"
        ? field.helpStyle
        : options?.helpStyle === "highlight" || options?.helpStyle === "default"
          ? (options.helpStyle as "default" | "highlight")
        : schemaRule?.helpStyle === "highlight" || schemaRule?.helpStyle === "default"
          ? (schemaRule.helpStyle as "default" | "highlight")
          : "default",
    min: toOptionalNumber(field.min ?? options?.min ?? schemaRule?.min),
    max: toOptionalNumber(field.max ?? options?.max ?? schemaRule?.max),
    rows: toOptionalNumber(field.rows ?? options?.rows ?? schemaRule?.rows),
    options:
      fieldType === "Select"
        ? { items: normalizeSelectItems(field, schemaRule) }
        : fieldType === "switch"
          ? {
              onLabel:
                toTrimmedString(options?.onLabel) ||
                toTrimmedString(schemaOptions?.onLabel) ||
                "Ligado",
              offLabel:
                toTrimmedString(options?.offLabel) ||
                toTrimmedString(schemaOptions?.offLabel) ||
                "Desligado",
              defaultOn: Boolean(options?.defaultOn ?? schemaOptions?.defaultOn),
            }
          : undefined,
  };
}

function chunkFields(fields: BuilderField[], size = 3): BuilderFieldRow[] {
  if (!fields.length) return [];
  const chunks: BuilderFieldRow[] = [];
  for (let index = 0; index < fields.length; index += size) {
    chunks.push(fields.slice(index, index + size));
  }
  return chunks;
}

function mapImportedFieldsToRows(
  importedFields: Record<string, unknown>[],
  blocks: Record<string, unknown>[],
  schemaRulesByName: Record<string, Record<string, unknown>>,
): BuilderFieldRow[] {
  const mappedFields = importedFields.map((field, index) => ({
    builder: mapImportedField(
      field,
      index,
      schemaRulesByName[toTrimmedString(field.name)],
    ),
    row: toOptionalNumber(
      (field.layout as Record<string, unknown> | undefined)?.row ??
        (
          (field.options as Record<string, unknown> | undefined)?.layout as
            | Record<string, unknown>
            | undefined
        )?.row,
    ),
    column: toOptionalNumber(
      (field.layout as Record<string, unknown> | undefined)?.column ??
        (
          (field.options as Record<string, unknown> | undefined)?.layout as
            | Record<string, unknown>
            | undefined
        )?.column,
    ),
    ordem: toOptionalNumber(field.ordem) ?? index + 1,
  }));

  const fieldsWithLayout = mappedFields.filter(
    (field) => typeof field.row === "number",
  );
  if (fieldsWithLayout.length) {
    const groupedByRow = new Map<number, typeof mappedFields>();
    fieldsWithLayout
      .sort((a, b) => {
        const rowA = a.row ?? 0;
        const rowB = b.row ?? 0;
        if (rowA !== rowB) return rowA - rowB;
        return (a.column ?? 0) - (b.column ?? 0);
      })
      .forEach((field) => {
        const row = field.row ?? 1;
        const current = groupedByRow.get(row) ?? [];
        groupedByRow.set(row, [...current, field]);
      });

    const orderedRows = Array.from(groupedByRow.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, rowFields]) => rowFields.map((field) => field.builder));

    const noLayoutFields = mappedFields
      .filter((field) => typeof field.row !== "number")
      .sort((a, b) => a.ordem - b.ordem)
      .map((field) => field.builder);

    return [...orderedRows, ...chunkFields(noLayoutFields)];
  }

  if (blocks.length) {
    const fieldMap = new Map(mappedFields.map((field) => [field.builder.name, field.builder]));
    const usedNames = new Set<string>();
    const rowsFromBlocks: BuilderFieldRow[] = [];

    blocks.forEach((block) => {
      const names = Array.isArray(block.fields) ? block.fields : [];
      const resolvedRow = names
        .map((name) => {
          if (typeof name !== "string") return null;
          const field = fieldMap.get(name);
          if (!field) return null;
          usedNames.add(name);
          return field;
        })
        .filter((field): field is BuilderField => Boolean(field));

      if (resolvedRow.length) {
        rowsFromBlocks.push(...chunkFields(resolvedRow));
      }
    });

    const remaining = mappedFields
      .filter((field) => !usedNames.has(field.builder.name))
      .sort((a, b) => a.ordem - b.ordem)
      .map((field) => field.builder);

    return [...rowsFromBlocks, ...chunkFields(remaining)];
  }

  const ordered = mappedFields
    .sort((a, b) => a.ordem - b.ordem)
    .map((field) => field.builder);
  return chunkFields(ordered);
}

function pickFirstText(...values: unknown[]) {
  for (const value of values) {
    const text = toTrimmedString(value);
    if (text) return text;
  }
  return "";
}

function resolveFormSlug(form: FormOptionItem) {
  return pickFirstText(
    form.slug,
    form.formSlug,
    (form.form as Record<string, unknown> | undefined)?.slug,
  );
}

function resolveProjectSlug(form: FormOptionItem) {
  return pickFirstText(
    form.projetoSlug,
    form.projectSlug,
    (form.projeto as Record<string, unknown> | undefined)?.slug,
    (form.project as Record<string, unknown> | undefined)?.slug,
    getStoredProjectSlug(),
  );
}

function toOptionalId(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function resolveFormId(source: Record<string, unknown> | null | undefined) {
  if (!source) return null;
  const nestedForm =
    (source.form as Record<string, unknown> | undefined) ?? undefined;
  return (
    toOptionalId(source.id) ??
    toOptionalId(source.formId) ??
    toOptionalId(source.form_id) ??
    toOptionalId(nestedForm?.id) ??
    toOptionalId(nestedForm?.formId) ??
    null
  );
}

function resolveVersionId(source: Record<string, unknown> | null | undefined) {
  if (!source) return null;
  return (
    toOptionalId(source.id) ??
    toOptionalId(source.versionId) ??
    toOptionalId(source.formVersionId) ??
    null
  );
}

function mapFieldIdByName(source: Record<string, unknown> | null | undefined) {
  if (!source) return {};

  const fields = Array.isArray(source.fields)
    ? (source.fields as Record<string, unknown>[])
    : [];

  return fields.reduce<Record<string, number>>((accumulator, field) => {
    const name = toTrimmedString(field.name);
    const id = toOptionalId(field.id);
    if (name && id !== null) {
      accumulator[name] = id;
    }
    return accumulator;
  }, {});
}

function extractPersistedFormId(
  response: unknown,
  fallback: number | null,
) {
  const payload =
    (response as { data?: Record<string, unknown> } | undefined)?.data ?? {};
  const data =
    (payload as { data?: Record<string, unknown> | null }).data ?? null;
  const nestedForm =
    (data as Record<string, unknown> | null)?.form as
      | Record<string, unknown>
      | undefined;

  return (
    toOptionalId((data as Record<string, unknown> | null)?.id) ??
    toOptionalId((data as Record<string, unknown> | null)?.formId) ??
    toOptionalId(nestedForm?.id) ??
    toOptionalId(payload.id) ??
    toOptionalId(payload.formId) ??
    fallback
  );
}

function extractSchemaRulesByName(schema: Record<string, unknown>) {
  return Object.entries(schema).reduce<Record<string, Record<string, unknown>>>(
    (accumulator, [key, value]) => {
      if (key === "blocks" || key === "styles") return accumulator;
      if (!value || typeof value !== "object") return accumulator;
      accumulator[key] = value as Record<string, unknown>;
      return accumulator;
    },
    {},
  );
}

function normalizeHexColor(value: unknown, fallback: string) {
  const normalized = toTrimmedString(value);
  if (/^#[0-9a-f]{6}$/i.test(normalized)) {
    return normalized;
  }
  return fallback;
}

function normalizeFormStyles(value: unknown): FormStyleOptions {
  const source = (value && typeof value === "object"
    ? value
    : {}) as Record<string, unknown>;

  return {
    formBackgroundColor: normalizeHexColor(
      source.formBackgroundColor,
      DEFAULT_FORM_STYLE_OPTIONS.formBackgroundColor,
    ),
    formBorderColor: normalizeHexColor(
      source.formBorderColor,
      DEFAULT_FORM_STYLE_OPTIONS.formBorderColor,
    ),
    inputBackgroundColor: normalizeHexColor(
      source.inputBackgroundColor,
      DEFAULT_FORM_STYLE_OPTIONS.inputBackgroundColor,
    ),
    titleColor: normalizeHexColor(
      source.titleColor,
      DEFAULT_FORM_STYLE_OPTIONS.titleColor,
    ),
    descriptionColor: normalizeHexColor(
      source.descriptionColor,
      DEFAULT_FORM_STYLE_OPTIONS.descriptionColor,
    ),
    buttonBackgroundColor: normalizeHexColor(
      source.buttonBackgroundColor,
      DEFAULT_FORM_STYLE_OPTIONS.buttonBackgroundColor,
    ),
    buttonTextColor: normalizeHexColor(
      source.buttonTextColor,
      DEFAULT_FORM_STYLE_OPTIONS.buttonTextColor,
    ),
  };
}

function resolveActiveVersion(form: FormOptionItem) {
  const pickVersionFromList = (versions: unknown) => {
    if (!Array.isArray(versions)) return null;

    const normalized = versions.filter(
      (version): version is Record<string, unknown> =>
        Boolean(version) && typeof version === "object",
    );
    if (!normalized.length) return null;

    const activeVersions = normalized.filter((version) => version.isActive === true);
    const candidates = activeVersions.length ? activeVersions : normalized;

    const toVersionNumber = (value: unknown) => toOptionalNumber(value) ?? -1;
    const toTimestamp = (value: unknown) => {
      if (typeof value === "string" && value.trim()) {
        const timestamp = Date.parse(value);
        return Number.isFinite(timestamp) ? timestamp : 0;
      }
      return 0;
    };

    return [...candidates].sort((left, right) => {
      const versionDiff =
        toVersionNumber(right.version) - toVersionNumber(left.version);
      if (versionDiff !== 0) return versionDiff;

      const timeDiff =
        toTimestamp(right.createdAt) - toTimestamp(left.createdAt);
      if (timeDiff !== 0) return timeDiff;

      return (toOptionalId(right.id) ?? 0) - (toOptionalId(left.id) ?? 0);
    })[0];
  };

  if (Array.isArray((form as Record<string, unknown>).fields)) {
    return form as Record<string, unknown>;
  }

  if (form.activeVersion && typeof form.activeVersion === "object") {
    return form.activeVersion as Record<string, unknown>;
  }

  if (
    (form as Record<string, unknown>).active_version &&
    typeof (form as Record<string, unknown>).active_version === "object"
  ) {
    return (form as Record<string, unknown>).active_version as Record<
      string,
      unknown
    >;
  }

  if (
    (form as Record<string, unknown>).currentVersion &&
    typeof (form as Record<string, unknown>).currentVersion === "object"
  ) {
    return (form as Record<string, unknown>).currentVersion as Record<
      string,
      unknown
    >;
  }

  if (
    (form as Record<string, unknown>).latestVersion &&
    typeof (form as Record<string, unknown>).latestVersion === "object"
  ) {
    return (form as Record<string, unknown>).latestVersion as Record<
      string,
      unknown
    >;
  }

  const rootVersion = pickVersionFromList(
    (form as Record<string, unknown>).versions,
  );
  if (rootVersion) {
    return rootVersion;
  }

  const nestedForm = form.form as Record<string, unknown> | undefined;
  if (nestedForm?.activeVersion && typeof nestedForm.activeVersion === "object") {
    return nestedForm.activeVersion as Record<string, unknown>;
  }

  if (
    nestedForm?.active_version &&
    typeof nestedForm.active_version === "object"
  ) {
    return nestedForm.active_version as Record<string, unknown>;
  }

  if (nestedForm && Array.isArray(nestedForm.fields)) {
    return nestedForm;
  }

  const nestedVersion = pickVersionFromList(nestedForm?.versions);
  if (nestedVersion) {
    return nestedVersion;
  }

  return null;
}

function mapImportedBlocks(blocks: Record<string, unknown>[]): BuilderBlock[] {
  return blocks
    .map((block, index) => {
      const title = toTrimmedString(block.title) || `Aba ${index + 1}`;
      const names = (Array.isArray(block.fields) ? block.fields : [])
        .filter((name): name is string => typeof name === "string")
        .map((name) => name.trim())
        .filter(Boolean);

      return {
        title,
        fields: names,
      };
    })
    .filter((block) => block.fields.length > 0);
}

function buildDefaultBlock(fieldNames: string[]): BuilderBlock[] {
  if (!fieldNames.length) return [];
  return [
    {
      title: "Aba 1",
      fields: fieldNames,
    },
  ];
}

function syncBlocksWithFieldNames(
  previousBlocks: BuilderBlock[],
  fieldNames: string[],
) {
  if (!fieldNames.length) {
    return previousBlocks.map((block, index) => ({
      title: toTrimmedString(block.title) || `Aba ${index + 1}`,
      fields: [],
    }));
  }
  if (!previousBlocks.length) return buildDefaultBlock(fieldNames);

  const availableNames = new Set(fieldNames);
  const seenNames = new Set<string>();
  const nextBlocks = previousBlocks.map((block, index) => ({
      title: toTrimmedString(block.title) || `Aba ${index + 1}`,
      fields: block.fields.filter((name) => {
        if (!availableNames.has(name)) return false;
        if (seenNames.has(name)) return false;
        seenNames.add(name);
        return true;
      }),
    }));

  if (!nextBlocks.length) {
    return buildDefaultBlock(fieldNames);
  }

  const unassignedNames = fieldNames.filter((name) => !seenNames.has(name));

  if (unassignedNames.length) {
    const firstFilledBlockIndex = nextBlocks.findIndex((block) => block.fields.length > 0);
    const targetIndex = firstFilledBlockIndex >= 0 ? firstFilledBlockIndex : 0;
    nextBlocks[targetIndex] = {
      ...nextBlocks[targetIndex],
      fields: [...nextBlocks[targetIndex].fields, ...unassignedNames],
    };
  }

  return nextBlocks;
}

function parseDropPlacement(dropTargetId: string): DropPlacement | null {
  if (dropTargetId === "drop-new-row") {
    return { type: "new-row" };
  }

  if (dropTargetId.startsWith("drop-side-")) {
    const rowIndex = Number(dropTargetId.replace("drop-side-", ""));
    if (!Number.isInteger(rowIndex) || rowIndex < 0) return null;
    return { type: "side", rowIndex };
  }

  if (dropTargetId.startsWith("drop-below-")) {
    const rowIndex = Number(dropTargetId.replace("drop-below-", ""));
    if (!Number.isInteger(rowIndex) || rowIndex < 0) return null;
    return { type: "below", rowIndex };
  }

  return null;
}

function applyFieldPlacement(
  rows: BuilderFieldRow[],
  field: BuilderField,
  placement: DropPlacement,
) {
  const nextRows = rows.map((row) => [...row]);

  if (placement.type === "new-row") {
    nextRows.push([field]);
    return nextRows;
  }

  if (placement.type === "side") {
    if (placement.rowIndex >= nextRows.length) return null;
    if (nextRows[placement.rowIndex].length < MAX_FIELDS_PER_ROW) {
      nextRows[placement.rowIndex].push(field);
      return nextRows;
    }
    const insertAt = Math.min(placement.rowIndex + 1, nextRows.length);
    nextRows.splice(insertAt, 0, [field]);
    return nextRows;
  }

  const insertAt = Math.min(placement.rowIndex + 1, nextRows.length);
  nextRows.splice(insertAt, 0, [field]);
  return nextRows;
}

function adjustPlacementAfterRowRemoval(
  placement: DropPlacement,
  removedRowIndex: number,
  rowWasRemoved: boolean,
) {
  if (!rowWasRemoved || placement.type === "new-row") return placement;
  if (placement.rowIndex > removedRowIndex) {
    return { ...placement, rowIndex: placement.rowIndex - 1 };
  }
  return placement;
}

export default function ConstructorForm() {
  const [fieldRows, setFieldRows] = useState<BuilderFieldRow[]>([]);
  const [formBlocks, setFormBlocks] = useState<BuilderBlock[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [selectedFormVersionId, setSelectedFormVersionId] = useState<number | null>(
    null,
  );
  const [selectedFieldIdByName, setSelectedFieldIdByName] = useState<
    Record<string, number>
  >({});
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [titleForm, setTitleForm] = useState("Título do Formulário");
  const [descriptionForm, setDescriptionForm] = useState("");
  const [formStyles, setFormStyles] = useState<FormStyleOptions>(() => ({
    ...DEFAULT_FORM_STYLE_OPTIONS,
  }));
  const [preview, setPreview] = useState(false);
  const contentClassName = `${styles.bodyContent} ${
    preview ? styles.bodyContentWithPreview : ""
  }`;

  const formSchema = useMemo<BuilderSchema>(() => {
    const fieldsWithoutOrder = fieldRows.flatMap((row, rowIndex) =>
      row.map((field, columnIndex) => ({
        ...field,
        layout: {
          row: rowIndex + 1,
          column: columnIndex + 1,
        },
      })),
    );
    const layoutFields = fieldsWithoutOrder.map((field, index) => ({
      ...field,
      ordem: index + 1,
    }));

    const fieldNames = layoutFields.map((field) => field.name);
    const normalizedBlocks = syncBlocksWithFieldNames(formBlocks, fieldNames);
    const generatedSchema = generateSchemaFromBuilder(layoutFields);

    return {
      title: titleForm,
      description: descriptionForm,
      fields: layoutFields,
      blocks: normalizedBlocks,
      styles: formStyles,
      schema: {
        ...generatedSchema,
        blocks: normalizedBlocks,
        styles: formStyles,
      },
    };
  }, [descriptionForm, fieldRows, formBlocks, formStyles, titleForm]);

  const templateOptions = useMemo<FormTemplateOptionItem[]>(
    () =>
      FORM_TEMPLATES.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
      })),
    [],
  );

  useEffect(() => {
    const fieldNames = fieldRows.flatMap((row) => row.map((field) => field.name));
    setFormBlocks((previous) => syncBlocksWithFieldNames(previous, fieldNames));
  }, [fieldRows]);

  useEffect(() => {
    if (!formBlocks.length) {
      setSelectedBlockIndex(0);
      return;
    }
    setSelectedBlockIndex((previous) =>
      Math.min(Math.max(previous, 0), formBlocks.length - 1),
    );
  }, [formBlocks.length]);

  const handleAddBlock = () => {
    setFormBlocks((previous) => {
      const nextIndex = previous.length + 1;
      return [
        ...previous,
        {
          title: `Aba ${nextIndex}`,
          fields: [],
        },
      ];
    });
    setSelectedBlockIndex(formBlocks.length);
  };

  const handleRenameBlock = (blockIndex: number, title: string) => {
    setFormBlocks((previous) =>
      previous.map((block, index) =>
        index === blockIndex
          ? {
              ...block,
              title,
            }
          : block,
      ),
    );
  };

  const handleRemoveBlock = (blockIndex: number) => {
    setSelectedBlockIndex((previousSelected) => {
      if (formBlocks.length <= 1) return previousSelected;
      if (previousSelected === blockIndex) {
        return Math.max(0, blockIndex - 1);
      }
      if (previousSelected > blockIndex) {
        return previousSelected - 1;
      }
      return previousSelected;
    });

    setFormBlocks((previous) => {
      if (previous.length <= 1) return previous;

      const removedBlock = previous[blockIndex];
      const nextBlocks = previous.filter((_, index) => index !== blockIndex);
      if (!removedBlock) return nextBlocks;

      const targetIndex = Math.min(blockIndex, nextBlocks.length - 1);
      const target = nextBlocks[targetIndex];
      if (!target) return nextBlocks;

      nextBlocks[targetIndex] = {
        ...target,
        fields: [...target.fields, ...removedBlock.fields],
      };

      return nextBlocks;
    });
  };

  const handleAssignFieldToBlock = (fieldName: string, blockIndex: number) => {
    setFormBlocks((previous) => {
      if (!previous.length) return previous;
      if (blockIndex < 0 || blockIndex >= previous.length) return previous;

      const withoutField = previous.map((block) => ({
        ...block,
        fields: block.fields.filter((name) => name !== fieldName),
      }));

      const target = withoutField[blockIndex];
      if (!target) return withoutField;

      withoutField[blockIndex] = {
        ...target,
        fields: [...target.fields, fieldName],
      };
      return withoutField;
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setFieldRows((previous) =>
      previous
        .map((row) => row.filter((field) => field.id !== fieldId))
        .filter((row) => row.length > 0),
    );
  };

  const handleEditField = (
    fieldId: string,
    updates: Partial<BuilderField>,
  ) => {
    setFieldRows((previous) =>
      previous.map((row) =>
        row.map((field) =>
          field.id === fieldId
            ? {
                ...field,
                ...updates,
              }
            : field,
        ),
      ),
    );
  };

  function changeFormsDrop(event: any) {
    if (event.canceled) return;

    const dropTargetId = event.operation.target?.id;
    if (typeof dropTargetId !== "string") return;
    const placement = parseDropPlacement(dropTargetId);
    if (!placement) return;

    const sourceId = event.operation.source?.id;
    if (typeof sourceId !== "string") return;

    if (sourceId.startsWith("input-")) {
      const fieldType = sourceId.replace("input-", "") as FieldType;
      const fieldOption = FIELD_OPTIONS.find((option) => option.id === fieldType);
      if (!fieldOption) return;

      const newField = createBuilderField(fieldType, fieldOption.label);

      setFormBlocks((previous) => {
        if (!previous.length) {
          return [
            {
              title: "Aba 1",
              fields: [newField.name],
            },
          ];
        }

        const targetIndex = Math.min(
          Math.max(selectedBlockIndex, 0),
          previous.length - 1,
        );

        const cleaned = previous.map((block) => ({
          ...block,
          fields: block.fields.filter((name) => name !== newField.name),
        }));
        const target = cleaned[targetIndex];
        if (!target) return cleaned;

        cleaned[targetIndex] = {
          ...target,
          fields: [...target.fields, newField.name],
        };

        return cleaned;
      });

      setFieldRows((previous) => {
        const placedRows = applyFieldPlacement(previous, newField, placement);
        return placedRows ?? previous;
      });
      return;
    }

    if (!sourceId.startsWith("field-")) return;
    const fieldId = sourceId.slice("field-".length);
    if (!fieldId) return;

    setFieldRows((previous) => {
      const sourceRowIndex = previous.findIndex((row) =>
        row.some((field) => field.id === fieldId),
      );
      if (sourceRowIndex < 0) return previous;

      const sourceColumnIndex = previous[sourceRowIndex].findIndex(
        (field) => field.id === fieldId,
      );
      if (sourceColumnIndex < 0) return previous;

      const movingField = previous[sourceRowIndex][sourceColumnIndex];
      const nextRows = previous.map((row) => [...row]);
      nextRows[sourceRowIndex].splice(sourceColumnIndex, 1);

      const rowWasRemoved = nextRows[sourceRowIndex].length === 0;
      if (rowWasRemoved) {
        nextRows.splice(sourceRowIndex, 1);
      }

      const adjustedPlacement = adjustPlacementAfterRowRemoval(
        placement,
        sourceRowIndex,
        rowWasRemoved,
      );
      const placedRows = applyFieldPlacement(nextRows, movingField, adjustedPlacement);
      return placedRows ?? previous;
    });
  }

  const handleSubmitForm = async () => {
    const normalizedTitle = titleForm.trim();
    if (!normalizedTitle) {
      console.warn("Título do formulário é obrigatório.");
      triggerAlert({
        category: "warning",
        title: "Título do formulário é obrigatório.",
      });
      return;
    }

    const payload: Record<string, unknown> = {
      name: normalizedTitle,
      title: normalizedTitle,
      description: descriptionForm.trim(),
      blocks: formSchema.blocks,
      schema: formSchema.schema,
      fields: formSchema.fields,
      activeVersion: {
        id: selectedFormVersionId,
        schema: formSchema.schema,
        fields: formSchema.fields,
      },
      versionId: selectedFormVersionId,
      fieldIdByName: selectedFieldIdByName,
    };

    try {
      setIsSavingForm(true);
      const isUpdating = selectedFormId !== null;
      const response =
        isUpdating
          ? await updateFormById(selectedFormId, payload)
          : await createForm(payload);
      const persistedId = extractPersistedFormId(response, selectedFormId);
      setSelectedFormId(persistedId);
      triggerAlert({
        category: "success",
        title: isUpdating
          ? "Formulário atualizado com sucesso."
          : "Formulário criado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar formulário", error);
      triggerAlert({
        category: "error",
        title: resolveRequestErrorMessage(
          error,
          selectedFormId !== null
            ? "Erro ao atualizar formulário."
            : "Erro ao cadastrar formulário.",
        ),
      });
    } finally {
      setIsSavingForm(false);
    }
  };

  const handleDetachSelectedForm = () => {
    setSelectedFormId(null);
    setSelectedFormVersionId(null);
    setSelectedFieldIdByName({});
    setSelectedBlockIndex(0);
    setFieldRows([]);
    setFormBlocks([]);
    setTitleForm("Título do Formulário");
    setDescriptionForm("");
    setFormStyles({ ...DEFAULT_FORM_STYLE_OPTIONS });
    setPreview(false);
  };

  const handleSelectForm = async (selectedForm: FormOptionItem | null) => {
    if (!selectedForm) {
      handleDetachSelectedForm();
      return;
    }

    const selectedId = resolveFormId(selectedForm);
    setSelectedFormId(selectedId);

    try {
      let payload: Record<string, unknown> = selectedForm;
      let activeVersion = resolveActiveVersion(selectedForm);

      if (!activeVersion) {
        const formSlug = resolveFormSlug(selectedForm);
        if (!formSlug) {
          console.warn("Formulário selecionado sem versão ativa e sem slug.");
          return;
        }
        const projectSlug = resolveProjectSlug(selectedForm);
        if (!projectSlug) {
          console.warn("Projeto ativo sem slug para carregar formulário.");
          return;
        }
        const response = await getForms(formSlug, projectSlug);
        payload = (response?.data?.data ?? {}) as Record<string, unknown>;
        activeVersion = resolveActiveVersion(payload as FormOptionItem);
      }

      if (!activeVersion) {
        console.warn("Formulário sem versão ativa para edição.");
        setSelectedFormVersionId(null);
        setSelectedFieldIdByName({});
        return;
      }

      setSelectedFormVersionId(resolveVersionId(activeVersion));
      setSelectedFieldIdByName(mapFieldIdByName(activeVersion));

      const schema =
        (activeVersion.schema as Record<string, unknown> | undefined) ?? {};
      const importedFields = Array.isArray(activeVersion.fields)
        ? (activeVersion.fields as Record<string, unknown>[])
        : [];
      const blocks = Array.isArray(
        schema.blocks,
      )
        ? (schema.blocks as Record<string, unknown>[])
        : [];
      const schemaRulesByName = extractSchemaRulesByName(schema);

      setFormBlocks(mapImportedBlocks(blocks));
      setSelectedBlockIndex(0);
      setFieldRows(mapImportedFieldsToRows(importedFields, blocks, schemaRulesByName));
      setFormStyles(normalizeFormStyles(schema.styles));

      const loadedTitle = pickFirstText(
        activeVersion.title,
        payload.title,
        payload.name,
        selectedForm.name,
      );
      const loadedDescription = pickFirstText(
        activeVersion.description,
        payload.description,
      );

      setTitleForm(loadedTitle || "Título do Formulário");
      setDescriptionForm(loadedDescription);
      setSelectedFormId(resolveFormId(payload) ?? selectedId);
    } catch (error) {
      console.error("Erro ao carregar formulário selecionado", error);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const selectedTemplate =
      FORM_TEMPLATES.find((template) => template.id === templateId) ?? null;
    if (!selectedTemplate) {
      return;
    }

    const version = selectedTemplate.initialVersion;
    const schema = (version.schema as Record<string, unknown> | undefined) ?? {};
    const importedFields = Array.isArray(version.fields)
      ? (version.fields as Record<string, unknown>[])
      : [];
    const blocks = Array.isArray(schema.blocks)
      ? (schema.blocks as Record<string, unknown>[])
      : [];
    const schemaRulesByName = extractSchemaRulesByName(schema);

    setSelectedFormId(null);
    setSelectedFormVersionId(null);
    setSelectedFieldIdByName({});
    setSelectedBlockIndex(0);
    setFormBlocks(mapImportedBlocks(blocks));
    setFieldRows(mapImportedFieldsToRows(importedFields, blocks, schemaRulesByName));
    setFormStyles(normalizeFormStyles(schema.styles));
    setTitleForm(
      pickFirstText(
        schema.title,
        selectedTemplate.name,
        "Título do Formulário",
      ),
    );
    setDescriptionForm(
      pickFirstText(
        schema.description,
        selectedTemplate.description,
      ),
    );
    setPreview(false);
  };

  return (
    <Box className={styles.container}>
      <CabecalhoEstilizado
        position="relative"
        sx={{
          zIndex: 0,
          height: "3rem",
          display: "flex",
          justifyContent: "center",
        }}
      />

      <Box className={contentClassName}>
        <DragDropProvider
          onDragEnd={(event) => {
            changeFormsDrop(event);
          }}
        >
          {preview ? (
            <Box className={styles.previewToggleContent}>
              <Button
                className={styles.previewBackButton}
                onClick={() => setPreview(false)}
              >
                Voltar
              </Button>
            </Box>
          ) : (
            <Box className={styles.leftContent}>
              <Box className={styles.formContent}>
                <InputOptions
                  titleForm={titleForm}
                  setTitleForm={setTitleForm}
                  descriptionForm={descriptionForm}
                  setDescriptionForm={setDescriptionForm}
                  formStyles={formStyles}
                  setFormStyles={setFormStyles}
                  blocks={formBlocks}
                  selectedBlockIndex={selectedBlockIndex}
                  availableFieldNames={fieldRows.flatMap((row) =>
                    row.map((field) => field.name),
                  )}
                  onSelectBlock={setSelectedBlockIndex}
                  onAddBlock={handleAddBlock}
                  onRenameBlock={handleRenameBlock}
                  onRemoveBlock={handleRemoveBlock}
                  onAssignFieldToBlock={handleAssignFieldToBlock}
                  onDetachSelectedForm={handleDetachSelectedForm}
                  onTogglePreview={() => setPreview(true)}
                  onSelectForm={handleSelectForm}
                  templateOptions={templateOptions}
                  onApplyTemplate={handleApplyTemplate}
                  onSubmitForm={handleSubmitForm}
                  isSavingForm={isSavingForm}
                  isEditingForm={selectedFormId !== null}
                />
              </Box>
            </Box>
          )}
          <Box className={styles.hightContent}>
            <FormsDraggable
              rows={fieldRows}
              activeBlockTitle={formBlocks[selectedBlockIndex]?.title}
              visibleFieldNames={formBlocks[selectedBlockIndex]?.fields}
              titleForm={titleForm}
              descriptionForm={descriptionForm}
              formStyles={formStyles}
              onDeleteField={handleDeleteField}
              onEditField={handleEditField}
              formSchema={formSchema}
            />
          </Box>
          {preview && (
            <Box className={styles.previewFormsContent}>
              <FormPreview
                formSchema={formSchema}
                activeBlockIndex={selectedBlockIndex}
                formStyles={formStyles}
              />
            </Box>
          )}
        </DragDropProvider>
      </Box>
    </Box>
  );
}
