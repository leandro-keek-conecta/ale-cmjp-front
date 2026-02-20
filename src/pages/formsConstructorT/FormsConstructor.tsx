import { Box } from "@mui/material";
import styles from "./form.module.css";
import CabecalhoEstilizado from "@/components/CabecalhoEstilizado";
import { useMemo, useState } from "react";
import InputOptions from "./inputOptions/InputOptions";
import Button from "@/components/Button";
import {
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

export default function ConstructorForm() {
  const [fieldRows, setFieldRows] = useState<BuilderFieldRow[]>([]);
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

    return {
      title: titleForm,
      description: descriptionForm,
      fields: layoutFields,
      schema: generateSchemaFromBuilder(layoutFields),
    };
  }, [descriptionForm, fieldRows, titleForm]);

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
          <Box className={styles.leftContent}>
            <Box className={styles.formContent}>
              <InputOptions
                titleForm={titleForm}
                setTitleForm={setTitleForm}
                descriptionForm={descriptionForm}
                setDescriptionForm={setDescriptionForm}
              />
              <Box className={styles.buttomContent}>
                <Button
                  onClick={() => setPreview((prev) => !prev)}
                  className={styles.buttom}
                >
                  {preview ? "Ocultar preview" : "Preview"}
                </Button>
              </Box>
            </Box>
          </Box>
          <Box className={styles.hightContent}>
            <FormsDraggable
              rows={fieldRows}
              titleForm={titleForm}
              descriptionForm={descriptionForm}
              onDeleteField={handleDeleteField}
              onEditField={handleEditField}
              formSchema={formSchema}
            />
          </Box>
          {preview && (
            <Box className={styles.previewFormsContent}>
              <div>Conteudo</div>
            </Box>
          )}
        </DragDropProvider>
      </Box>
    </Box>
  );
}
