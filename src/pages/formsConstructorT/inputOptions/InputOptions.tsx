import styles from "./inputOptions.module.css";
import InputText from "@/components/InputText";
import TextArea from "@/components/TextArea";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { FIELD_OPTIONS, type BuilderBlock } from "../types/formsTypes";
import { Draggable } from "@/components/Draggable/Draggable";
import SelectButton from "@/components/selectButtom";
import { useEffect, useMemo, useState } from "react";
import { listForms } from "@/services/forms/formsService";
import Button from "@/components/Button";
import ExpandableCard from "@/components/expandable-card";

export type FormOptionItem = {
  id?: number | string;
  name?: string;
  [key: string]: unknown;
};

type PrimitiveSelectValue = string | number | boolean;

function resolveFormOptionMeta(form: FormOptionItem) {
  const nestedForm =
    (form.form as Record<string, unknown> | undefined) ?? undefined;

  const rawId = form.id ?? nestedForm?.id;
  const rawLabel = form.name ?? nestedForm?.name;

  const label = typeof rawLabel === "string" ? rawLabel.trim() : "";
  const idNumber = Number(rawId);

  return {
    label,
    idNumber: Number.isFinite(idNumber) ? idNumber : null,
  };
}

type InputOptionsProps = {
  titleForm: string;
  setTitleForm: (value: string) => void;
  descriptionForm: string;
  setDescriptionForm: (value: string) => void;
  blocks: BuilderBlock[];
  selectedBlockIndex: number;
  availableFieldNames: string[];
  onSelectBlock: (blockIndex: number) => void;
  onAddBlock: () => void;
  onRenameBlock: (blockIndex: number, title: string) => void;
  onRemoveBlock: (blockIndex: number) => void;
  onAssignFieldToBlock: (fieldName: string, blockIndex: number) => void;
  onDetachSelectedForm: () => void;
  onTogglePreview: () => void;
  onSelectForm: (form: FormOptionItem | null) => void;
};

export default function InputOptions({
  titleForm,
  setTitleForm,
  descriptionForm,
  setDescriptionForm,
  blocks,
  selectedBlockIndex,
  availableFieldNames,
  onSelectBlock,
  onAddBlock,
  onRenameBlock,
  onRemoveBlock,
  onAssignFieldToBlock,
  onDetachSelectedForm,
  onTogglePreview,
  onSelectForm,
}: InputOptionsProps) {
  const [formsOptions, setFormsOptions] = useState<FormOptionItem[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [expandedTabs, setExpandedTabs] = useState(true);

  const selectOptions = formsOptions
    .map((form) => {
      const { label, idNumber } = resolveFormOptionMeta(form);
      if (!label || idNumber === null) {
        return null;
      }
      return {
        label,
        value: idNumber as PrimitiveSelectValue,
      };
    })
    .filter(
      (option): option is { label: string; value: PrimitiveSelectValue } =>
        Boolean(option),
    );

  async function fetchOptions() {
    try {
      const response = await listForms("ale-cmjp");
      setFormsOptions(response as FormOptionItem[]);
    } catch (error) {
      console.log("Erro ao carregar formularios", error);
    }
  }

  useEffect(() => {
    void fetchOptions();
  }, []);

  const blockSelectOptions = useMemo(
    () =>
      blocks.map((block, index) => ({
        label: block.title?.trim() || `Aba ${index + 1}`,
        value: index,
      })),
    [blocks],
  );

  const selectedBlock = blocks[selectedBlockIndex] ?? null;
  const selectedBlockFieldNames = selectedBlock?.fields ?? [];
  const fieldsFromSelectedBlock = availableFieldNames.filter((name) =>
    selectedBlockFieldNames.includes(name),
  );

  const findFieldBlockIndex = (fieldName: string) =>
    blocks.findIndex((block) => block.fields.includes(fieldName));

  const handleSelectForm = (value: number | string | null) => {
    if (value === null || value === undefined || value === "") {
      setSelectedFormId(null);
      onDetachSelectedForm();
      return;
    }

    const normalizedId = Number(value);
    if (!Number.isFinite(normalizedId)) {
      setSelectedFormId(null);
      onDetachSelectedForm();
      return;
    }

    setSelectedFormId(normalizedId);
    const selected =
      formsOptions.find((form) => {
        const { idNumber } = resolveFormOptionMeta(form);
        return idNumber === normalizedId;
      }) ?? null;
    onSelectForm(selected);
  };

  return (
    <Box className={styles.containerBoxInputs}>
      <Box className={styles.headerRow}>
        <Box className={styles.headerText}>
          <Typography className={styles.tu}>
            Informacoes padrao do Forms
          </Typography>
          <Typography className={styles.sectionHint}>
            Configure metadados, abas e campos do formulario.
          </Typography>
        </Box>
        <Button onClick={onTogglePreview} className={styles.previewButton}>
          Preview
        </Button>
      </Box>

      <Box className={styles.metaSection}>
        <SelectButton
          label="Formularios do projeto"
          options={selectOptions}
          value={selectedFormId}
          onChange={(value) =>
            handleSelectForm(value as number | string | null)
          }
        />
        <Box className={styles.formInfo}>
          <Box>
            <InputText
              label="Titulo do formulario"
              value={titleForm}
              onChange={(event) => setTitleForm(event.target.value)}
            />
          </Box>
          <Box>
            <TextArea
              label="Descricao do formulario"
              value={descriptionForm}
              onChange={(event) => setDescriptionForm(event.target.value)}
            />
          </Box>
        </Box>
      </Box>

      <ExpandableCard
        title="Abas do Formulario"
        expanded={expandedTabs}
        onToggle={(next) => setExpandedTabs(next)}
        className={styles.card}
      >
        <Box className={styles.tabsActions}>
          <Box className={styles.tabSelectWrap}>
            <SelectButton
              label="Aba ativa"
              options={blockSelectOptions}
              value={selectedBlockIndex}
              onChange={(value) => {
                const next = Number(value);
                if (!Number.isFinite(next)) return;
                onSelectBlock(next);
              }}
            />
          </Box>
          <Button onClick={onAddBlock} className={styles.previewButton}>
            Adicionar aba
          </Button>
        </Box>

        {selectedBlock ? (
          <Box className={styles.tabsList}>
            <Typography className={styles.blockLabel}>Aba ativa</Typography>
            <Box className={styles.tabItem}>
              <TextField
                label={`Nome da aba ${selectedBlockIndex + 1}`}
                value={selectedBlock.title}
                onChange={(event) =>
                  onRenameBlock(selectedBlockIndex, event.target.value)
                }
                fullWidth
                size="small"
              />
              <Typography className={styles.helperText}>
                {selectedBlock.fields.length} campo(s)
              </Typography>
              <IconButton
                aria-label={`Remover aba ${selectedBlockIndex + 1}`}
                onClick={() => onRemoveBlock(selectedBlockIndex)}
                size="small"
                disabled={blocks.length <= 1}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ) : null}

        {fieldsFromSelectedBlock.length ? (
          <Box className={styles.fieldTabsGrid}>
            {fieldsFromSelectedBlock.map((fieldName) => (
              <Box
                key={`field-tab-${fieldName}`}
                className={styles.fieldTabRow}
              >
                <Typography className={styles.fieldName}>
                  {fieldName}
                </Typography>
                <SelectButton
                  label="Aba"
                  options={blockSelectOptions}
                  value={findFieldBlockIndex(fieldName)}
                  onChange={(value) => {
                    const blockIndex = Number(value);
                    if (!Number.isFinite(blockIndex)) return;
                    onAssignFieldToBlock(fieldName, blockIndex);
                  }}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Typography className={styles.helperText}>
            Nenhum campo nesta aba.
          </Typography>
        )}
      </ExpandableCard>

      <ExpandableCard
        title="Opções do Formulario"
        expanded={expanded}
        onToggle={(next) => setExpanded(next)}
        className={styles.card}
      >
        <Box className={styles.buttomOptions}>
          {FIELD_OPTIONS.map((input) => (
            <Box
              component="li"
              key={input.id}
              className={styles.bottonsContent}
            >
              <Draggable id={`input-${input.id}`}>
                <Box className={styles.menuItem}>
                  <span className={styles.label}>{input.label}</span>
                </Box>
              </Draggable>
            </Box>
          ))}
        </Box>
      </ExpandableCard>
    </Box>
  );
}
