import { Box } from "@mui/material";
import styles from "./form.module.css";
import CabecalhoEstilizado from "@/components/CabecalhoEstilizado";
import { useEffect, useMemo, useState } from "react";
import InputOptions, { type FormOptionItem } from "./inputOptions/InputOptions";
import Button from "@/components/Button";
import {
  type BuilderBlock,
  createBuilderField,
  FIELD_OPTIONS,
  generateSchemaFromBuilder,
  type BuilderField,
  type BuilderFieldRow,
  type BuilderSchema,
  type FieldType,
} from "./types/formsTypes";
import { FormsDraggable } from "./FormsDraggable/FormsDraggable";
import { DragDropProvider } from "@dnd-kit/react";
import FormPreview from "./FormsPreview/FormPreview";
import getForms from "@/services/forms/formsService";

const DEFAULT_PROJECT_SLUG = "ale-cmjp";

function generateImportedFieldId(index: number) {
  return `imported-${Date.now()}-${index}-${Math.random().toString(16).slice(2, 6)}`;
}

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
      toTrimmedString(field.id) ||
      toTrimmedString(field.name) ||
      generateImportedFieldId(index),
    name: rawName || `campo_${index + 1}`,
    label: rawLabel || fallbackLabel,
    type: fieldType,
    required: Boolean(field.required ?? schemaRule?.required),
    placeholder: toTrimmedString(field.placeholder) || undefined,
    helpText:
      toTrimmedString(field.helpText) ||
      toTrimmedString(schemaRule?.helpText) ||
      undefined,
    helpStyle:
      field.helpStyle === "highlight" || field.helpStyle === "default"
        ? field.helpStyle
        : schemaRule?.helpStyle === "highlight" || schemaRule?.helpStyle === "default"
          ? (schemaRule.helpStyle as "default" | "highlight")
          : "default",
    min: toOptionalNumber(field.min ?? schemaRule?.min),
    max: toOptionalNumber(field.max ?? schemaRule?.max),
    rows: toOptionalNumber(field.rows ?? schemaRule?.rows),
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
    row: toOptionalNumber((field.layout as Record<string, unknown> | undefined)?.row),
    column: toOptionalNumber((field.layout as Record<string, unknown> | undefined)?.column),
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
  return (
    pickFirstText(
      form.projetoSlug,
      form.projectSlug,
      (form.projeto as Record<string, unknown> | undefined)?.slug,
      (form.project as Record<string, unknown> | undefined)?.slug,
    ) || DEFAULT_PROJECT_SLUG
  );
}

function extractSchemaRulesByName(schema: Record<string, unknown>) {
  return Object.entries(schema).reduce<Record<string, Record<string, unknown>>>(
    (accumulator, [key, value]) => {
      if (key === "blocks") return accumulator;
      if (!value || typeof value !== "object") return accumulator;
      accumulator[key] = value as Record<string, unknown>;
      return accumulator;
    },
    {},
  );
}

function resolveActiveVersion(form: FormOptionItem) {
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

export default function ConstructorForm() {
  const [fieldRows, setFieldRows] = useState<BuilderFieldRow[]>([]);
  const [formBlocks, setFormBlocks] = useState<BuilderBlock[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [titleForm, setTitleForm] = useState("Titulo do Formulario");
  const [descriptionForm, setDescriptionForm] = useState("");
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
      schema: {
        ...generatedSchema,
        blocks: normalizedBlocks,
      },
    };
  }, [descriptionForm, fieldRows, formBlocks, titleForm]);

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

    const sourceId = event.operation.source?.id;
    if (typeof sourceId !== "string") return;
    if (!sourceId.startsWith("input-")) return;

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
      const rows = previous.map((row) => [...row]);

      if (dropTargetId === "drop-new-row") {
        return [...rows, [newField]];
      }

      if (dropTargetId.startsWith("drop-side-")) {
        const rowIndex = Number(dropTargetId.replace("drop-side-", ""));
        if (
          !Number.isInteger(rowIndex) ||
          rowIndex < 0 ||
          rowIndex >= rows.length
        ) {
          return rows;
        }

        if (rows[rowIndex].length < 3) {
          rows[rowIndex].push(newField);
          return rows;
        }

        rows.splice(rowIndex + 1, 0, [newField]);
        return rows;
      }

      if (dropTargetId.startsWith("drop-below-")) {
        const rowIndex = Number(dropTargetId.replace("drop-below-", ""));
        if (!Number.isInteger(rowIndex) || rowIndex < 0) {
          return rows;
        }
        const insertAt = Math.min(rowIndex + 1, rows.length);
        rows.splice(insertAt, 0, [newField]);
        return rows;
      }

      return rows;
    });
  }

  const handleSelectForm = async (selectedForm: FormOptionItem | null) => {
    if (!selectedForm) {
      return;
    }

    try {
      let payload: Record<string, unknown> = selectedForm;
      let activeVersion = resolveActiveVersion(selectedForm);

      if (!activeVersion) {
        const formSlug = resolveFormSlug(selectedForm);
        if (!formSlug) {
          console.warn("Formulario selecionado sem versao ativa e sem slug.");
          return;
        }
        const projectSlug = resolveProjectSlug(selectedForm);
        const response = await getForms(formSlug, projectSlug);
        payload = (response?.data?.data ?? {}) as Record<string, unknown>;
        activeVersion = (payload.activeVersion ??
          null) as Record<string, unknown> | null;
      }

      if (!activeVersion) {
        console.warn("Formulario sem versao ativa para edicao.");
        return;
      }

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

      setTitleForm(loadedTitle || "Titulo do Formulario");
      setDescriptionForm(loadedDescription);
    } catch (error) {
      console.error("Erro ao carregar formulario selecionado", error);
    }
  };

  const handleDetachSelectedForm = () => {
    // Mantem os dados atuais no construtor e apenas remove o vinculo com o item selecionado.
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
              />
            </Box>
          )}
        </DragDropProvider>
      </Box>
    </Box>
  );
}
