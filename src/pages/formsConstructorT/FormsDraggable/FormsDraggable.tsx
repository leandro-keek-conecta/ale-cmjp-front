import { useDroppable } from "@dnd-kit/react";
import { useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import styles from "./formraggable.module.css";
import type {
  BuilderField,
  BuilderFieldRow,
  BuilderSchema,
  FieldType,
} from "../types/formsTypes";
import ExpandableCard from "@/components/expandable-card";

type FormsDraggableProps = {
  rows: BuilderFieldRow[];
  visibleFieldNames?: string[];
  activeBlockTitle?: string;
  titleForm: string;
  descriptionForm?: string;
  onDeleteField: (fieldId: string) => void;
  onEditField: (fieldId: string, updates: Partial<BuilderField>) => void;
  formSchema: BuilderSchema;
};

type DropZoneProps = {
  id: string;
  className: string;
  activeClassName: string;
  children: ReactNode;
};

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Texto",
  number: "Numero",
  email: "E-mail",
  Select: "Lista de Opções",
  inputFile: "Arquivo",
  textarea: "Area de texto",
  switch: "Switch",
};

const FIELD_APPEARANCE: Record<FieldType, string> = {
  text: "Exemplo de campo de texto",
  number: "Exemplo de campo numerico",
  email: "Exemplo de campo de e-mail",
  Select: "Exemplo de campo de lista de opções",
  inputFile: "Exemplo de upload de arquivo",
  textarea: "Exemplo de area de texto",
  switch: "Exemplo de chave liga/desliga",
};

function DropZone({ id, className, activeClassName, children }: DropZoneProps) {
  const { ref, isDropTarget } = useDroppable({ id });

  return (
    <div
      className={`${className} ${isDropTarget ? activeClassName : ""}`}
      ref={ref}
    >
      {children}
    </div>
  );
}

function trimOrUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function FormsDraggable({
  rows,
  visibleFieldNames,
  activeBlockTitle,
  titleForm = "Titulo do Formulario",
  descriptionForm,
  onDeleteField,
  onEditField,
  formSchema,
}: FormsDraggableProps) {
  const [editingField, setEditingField] = useState<BuilderField | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftPlaceholder, setDraftPlaceholder] = useState("");
  const [draftRequired, setDraftRequired] = useState(false);
  const [draftHelp, setDraftHelp] = useState("");
  const [draftHelpStyle, setDraftHelpStyle] = useState<"default" | "highlight">(
    "default",
  );
  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");
  const [draftRows, setDraftRows] = useState("");
  const [draftOptions, setDraftOptions] = useState<string[]>([]);
  const [draftSwitchOnLabel, setDraftSwitchOnLabel] = useState("Ligado");
  const [draftSwitchOffLabel, setDraftSwitchOffLabel] = useState("Desligado");
  const [draftSwitchDefaultOn, setDraftSwitchDefaultOn] = useState(false);

  const openEditModal = (field: BuilderField) => {
    setEditingField(field);
    setDraftLabel(field.label);
    setDraftPlaceholder(field.placeholder ?? "");
    setDraftRequired(field.required);
    setDraftHelp(field.helpText ?? "");
    setDraftHelpStyle(field.helpStyle ?? "default");
    setDraftMin(typeof field.min === "number" ? String(field.min) : "");
    setDraftMax(typeof field.max === "number" ? String(field.max) : "");
    setDraftRows(typeof field.rows === "number" ? String(field.rows) : "");
    setDraftOptions(field.options?.items ? [...field.options.items] : []);
    setDraftSwitchOnLabel(field.options?.onLabel ?? "Ligado");
    setDraftSwitchOffLabel(field.options?.offLabel ?? "Desligado");
    setDraftSwitchDefaultOn(Boolean(field.options?.defaultOn));
  };

  const closeEditModal = () => {
    setEditingField(null);
    setDraftLabel("");
    setDraftPlaceholder("");
    setDraftRequired(false);
    setDraftHelp("");
    setDraftHelpStyle("default");
    setDraftMin("");
    setDraftMax("");
    setDraftRows("");
    setDraftOptions([]);
    setDraftSwitchOnLabel("Ligado");
    setDraftSwitchOffLabel("Desligado");
    setDraftSwitchDefaultOn(false);
  };

  const addOption = () => {
    setDraftOptions((previous) => [...previous, ""]);
  };

  const updateOption = (index: number, value: string) => {
    setDraftOptions((previous) =>
      previous.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  };

  const removeOption = (index: number) => {
    setDraftOptions((previous) =>
      previous.filter((_, optionIndex) => optionIndex !== index),
    );
  };

  const getOptionsByType = (type: FieldType): BuilderField["options"] => {
    if (type === "Select") {
      const items = draftOptions.map((option) => option.trim()).filter(Boolean);
      return { items };
    }

    if (type === "switch") {
      return {
        onLabel: trimOrUndefined(draftSwitchOnLabel) ?? "Ligado",
        offLabel: trimOrUndefined(draftSwitchOffLabel) ?? "Desligado",
        defaultOn: draftSwitchDefaultOn,
      };
    }

    return undefined;
  };

  const saveEdit = () => {
    if (!editingField) return;

    const normalizedLabel = draftLabel.trim();
    if (!normalizedLabel) return;

    const supportsMinMax =
      editingField.type === "number" || editingField.type === "textarea";

    onEditField(editingField.id, {
      label: normalizedLabel,
      placeholder: trimOrUndefined(draftPlaceholder),
      required: draftRequired,
      helpText: trimOrUndefined(draftHelp),
      helpStyle: draftHelpStyle,
      min: supportsMinMax ? parseOptionalNumber(draftMin) : undefined,
      max: supportsMinMax ? parseOptionalNumber(draftMax) : undefined,
      rows:
        editingField.type === "textarea"
          ? parseOptionalNumber(draftRows)
          : undefined,
      options: getOptionsByType(editingField.type),
    });

    closeEditModal();
  };

  const renderCommonFields = () => (
    <>
      <TextField
        label="Rotulo"
        value={draftLabel}
        onChange={(event) => setDraftLabel(event.target.value)}
        fullWidth
      />

      <TextField
        label="Placeholder"
        value={draftPlaceholder}
        onChange={(event) => setDraftPlaceholder(event.target.value)}
        fullWidth
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={draftRequired}
            onChange={(event) => setDraftRequired(event.target.checked)}
          />
        }
        label="Campo obrigatorio"
      />

      <TextField
        label="Texto de ajuda"
        value={draftHelp}
        onChange={(event) => setDraftHelp(event.target.value)}
        fullWidth
      />

      <TextField
        select
        label="Estilo do texto de ajuda"
        value={draftHelpStyle}
        onChange={(event) =>
          setDraftHelpStyle(event.target.value as "default" | "highlight")
        }
        fullWidth
        SelectProps={{ native: true }}
      >
        <option value="default">Padrao</option>
        <option value="highlight">Destaque</option>
      </TextField>
    </>
  );

  const renderTextConfig = () => (
    <Typography variant="body2" color="text.secondary">
      Este tipo nao possui configuracoes adicionais.
    </Typography>
  );

  const renderSelectConfig = () => (
    <Box sx={{ display: "grid", gap: 1 }}>
      <Typography variant="subtitle2">Opcoes</Typography>

      {draftOptions.map((option, index) => (
        <Box key={`option-${index}`} sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            label={`Opcao ${index + 1}`}
            value={option}
            onChange={(event) => updateOption(index, event.target.value)}
          />
          <IconButton
            aria-label="Remover opcao"
            onClick={() => removeOption(index)}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      ))}

      <Button onClick={addOption} variant="outlined">
        Adicionar opcao
      </Button>
    </Box>
  );

  const renderTextareaConfig = () => (
    <>
      <TextField
        label="Minimo de caracteres"
        type="number"
        value={draftMin}
        onChange={(event) => setDraftMin(event.target.value)}
        fullWidth
      />

      <TextField
        label="Maximo de caracteres"
        type="number"
        value={draftMax}
        onChange={(event) => setDraftMax(event.target.value)}
        fullWidth
      />

      <TextField
        label="Numero de linhas"
        type="number"
        value={draftRows}
        onChange={(event) => setDraftRows(event.target.value)}
        fullWidth
      />
    </>
  );

  const renderNumberConfig = () => (
    <>
      <TextField
        label="Valor minimo"
        type="number"
        value={draftMin}
        onChange={(event) => setDraftMin(event.target.value)}
        fullWidth
      />

      <TextField
        label="Valor maximo"
        type="number"
        value={draftMax}
        onChange={(event) => setDraftMax(event.target.value)}
        fullWidth
      />
    </>
  );

  const renderSwitchConfig = () => (
    <>
      <TextField
        label="Label ON"
        value={draftSwitchOnLabel}
        onChange={(event) => setDraftSwitchOnLabel(event.target.value)}
        fullWidth
      />

      <TextField
        label="Label OFF"
        value={draftSwitchOffLabel}
        onChange={(event) => setDraftSwitchOffLabel(event.target.value)}
        fullWidth
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={draftSwitchDefaultOn}
            onChange={(event) => setDraftSwitchDefaultOn(event.target.checked)}
          />
        }
        label="Valor padrao ligado"
      />
    </>
  );

  const renderTypeSpecificFields = () => {
    if (!editingField) return null;

    switch (editingField.type) {
      case "Select":
        return renderSelectConfig();
      case "textarea":
        return renderTextareaConfig();
      case "number":
        return renderNumberConfig();
      case "text":
      case "email":
        return renderTextConfig();
      case "switch":
        return renderSwitchConfig();
      default:
        return null;
    }
  };

  const visibleNamesSet = new Set(visibleFieldNames ?? []);
  const hasBlockFilter = Array.isArray(visibleFieldNames);
  const rowsToRender = hasBlockFilter
    ? rows
        .map((row, rowIndex) => ({
          rowIndex,
          originalLength: row.length,
          fields: row.filter((field) => visibleNamesSet.has(field.name)),
        }))
        .filter((row) => row.fields.length > 0)
    : rows.map((row, rowIndex) => ({
        rowIndex,
        originalLength: row.length,
        fields: row,
      }));

  return (
    <Box className={styles.canvas}>
      <Box className={styles.header}>
        <Box className={styles.headerTop}>
          <Typography className={styles.title}>
            {titleForm || "Formulario sem titulo"}
          </Typography>
          {activeBlockTitle ? (
            <Typography className={styles.activeBlockLabel}>
              Aba ativa: {activeBlockTitle}
            </Typography>
          ) : null}
        </Box>
        {descriptionForm ? (
          <Typography className={styles.description}>
            {descriptionForm}
          </Typography>
        ) : null}
      </Box>

      {!rowsToRender.length ? (
        <DropZone
          id="drop-new-row"
          className={styles.emptyState}
          activeClassName={styles.dropZoneActive}
        >
          <Typography className={styles.emptyTitle}>
            Arraste um campo para iniciar o layout do formulario
          </Typography>
          <Typography className={styles.emptyText}>
            O primeiro campo sempre inicia uma nova linha.
          </Typography>
        </DropZone>
      ) : (
        <Box className={styles.rowsContainer}>
          {rowsToRender.map((rowEntry) => (
            <Box key={`row-${rowEntry.rowIndex}`} className={styles.rowWrapper}>
              <Box
                className={styles.rowGrid}
                style={{
                  gridTemplateColumns: `repeat(${Math.max(rowEntry.fields.length, 1)}, minmax(0, 1fr))`,
                }}
              >
                {rowEntry.fields.map((field, columnIndex) => (
                  <Box key={field.id} className={styles.fieldCard}>
                    <Box className={styles.cardHeader}>
                      <Box>
                        <Typography className={styles.fieldTitle}>
                          {field.label}
                        </Typography>
                        <Typography className={styles.fieldType}>
                          {FIELD_TYPE_LABELS[field.type]}
                        </Typography>
                      </Box>
                      <Box className={styles.actions}>
                        <IconButton
                          size="small"
                          aria-label="Editar campo"
                          onClick={() => openEditModal(field)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Excluir campo"
                          onClick={() => onDeleteField(field.id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box className={styles.fakeInput}>
                      {FIELD_APPEARANCE[field.type]}
                    </Box>
                    <Typography className={styles.position}>
                      Linha {rowEntry.rowIndex + 1} | Coluna {columnIndex + 1}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {rowEntry.originalLength < 3 ? (
                <DropZone
                  id={`drop-side-${rowEntry.rowIndex}`}
                  className={styles.sideDropZone}
                  activeClassName={styles.dropZoneActive}
                >
                  <Typography className={styles.dropZoneText}>
                    Solte aqui para adicionar ao lado
                  </Typography>
                </DropZone>
              ) : null}

              <DropZone
                id={`drop-below-${rowEntry.rowIndex}`}
                className={styles.belowDropZone}
                activeClassName={styles.dropZoneActive}
              >
                <Typography className={styles.belowDropText}>
                  Solte aqui para criar nova linha abaixo
                </Typography>
              </DropZone>
            </Box>
          ))}
        </Box>
      )}
      <ExpandableCard
        title="JSON do formulario"
        expanded={expanded}
        onToggle={(next) => setExpanded(next)}
        className={styles.card}
      >
        {" "}
        <pre className={styles.schemaCode}>
          {JSON.stringify(formSchema, null, 2)}
        </pre>
      </ExpandableCard>

      <Dialog
        open={Boolean(editingField)}
        onClose={closeEditModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar campo</DialogTitle>
        <DialogContent
          sx={{ display: "grid", gap: 2, paddingTop: "12px !important" }}
        >
          {renderCommonFields()}
          {renderTypeSpecificFields()}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal}>Cancelar</Button>
          <Button
            onClick={saveEdit}
            variant="contained"
            disabled={!draftLabel.trim()}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
