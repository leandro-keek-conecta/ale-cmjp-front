import styles from "./inputOptions.module.css";
import InputText from "@/components/InputText";
import TextArea from "@/components/TextArea";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  DEFAULT_FORM_STYLE_OPTIONS,
  FIELD_OPTIONS,
  type BuilderBlock,
  type FormStyleOptions,
} from "../types/formsTypes";
import { Draggable } from "@/components/Draggable/Draggable";
import SelectButton from "@/components/selectButtom";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import ExpandableCard from "@/components/expandable-card";
import { getStoredProjectId } from "@/utils/project";
import { getFormsById } from "@/services/forms/formsService";
import buildLink from "@/utils/buildLinksWithSlug.ts";

export type FormOptionItem = {
  id?: number | string;
  name?: string;
  [key: string]: unknown;
};

type PrimitiveSelectValue = string | number | boolean;
const DEFAULT_PROJECT_SLUG = "ale-cmjp";

const STYLE_INPUTS: Array<{
  key: keyof FormStyleOptions;
  label: string;
}> = [
  { key: "formBackgroundColor", label: "Fundo do formulario" },
  { key: "formBorderColor", label: "Borda do formulario" },
  { key: "titleColor", label: "Titulo" },
  { key: "descriptionColor", label: "Descricao" },
  { key: "buttonBackgroundColor", label: "Fundo do botao" },
  { key: "buttonTextColor", label: "Texto do botao" },
];

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

function resolveProjectSlug(form: FormOptionItem) {
  const nestedForm =
    (form.form as Record<string, unknown> | undefined) ?? undefined;
  const projeto =
    (form.projeto as Record<string, unknown> | undefined) ?? undefined;
  const project =
    (form.project as Record<string, unknown> | undefined) ?? undefined;
  const rawProjectSlug =
    form.projetoSlug ??
    form.projectSlug ??
    form.projetoUrl ??
    form.projectUrl ??
    form.url ??
    projeto?.slug ??
    projeto?.url ??
    project?.slug ??
    project?.url ??
    nestedForm?.projetoSlug ??
    nestedForm?.projectSlug ??
    nestedForm?.projetoUrl ??
    nestedForm?.projectUrl;

  if (typeof rawProjectSlug === "string") {
    const cleaned = rawProjectSlug
      .trim()
      .replace(/^https?:\/\/[^/]+\/form\//i, "")
      .replace(/^\/+|\/+$/g, "");
    if (cleaned) return cleaned;
  }

  return "";
}

type InputOptionsProps = {
  titleForm: string;
  setTitleForm: (value: string) => void;
  descriptionForm: string;
  setDescriptionForm: (value: string) => void;
  formStyles: FormStyleOptions;
  setFormStyles: (value: FormStyleOptions) => void;
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
  onSubmitForm: () => void;
  isSavingForm: boolean;
  isEditingForm: boolean;
};

export default function InputOptions({
  titleForm,
  setTitleForm,
  descriptionForm,
  setDescriptionForm,
  formStyles,
  setFormStyles,
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
  onSubmitForm,
  isSavingForm,
  isEditingForm,
}: InputOptionsProps) {
  const [formsOptions, setFormsOptions] = useState<FormOptionItem[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [expandedLayout, setExpandedLayout] = useState(false);
  const [expandedLinks, setExpandedLinks] = useState(false);
  const [expandedTabs, setExpandedTabs] = useState(false);
  const projectId = getStoredProjectId();

  const selectOptions = (Array.isArray(formsOptions) ? formsOptions : [])
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
      const parsedProjectId = Number(projectId);
      if (!Number.isFinite(parsedProjectId) || parsedProjectId <= 0) {
        setFormsOptions([]);
        return;
      }

      const response = await getFormsById(parsedProjectId);
      setFormsOptions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.log("Erro ao carregar formularios", error);
      setFormsOptions([]);
    }
  }

  useEffect(() => {
    void fetchOptions();
  }, [projectId]);

  const blockSelectOptions = useMemo(
    () =>
      blocks.map((block, index) => ({
        label: block.title?.trim() || `Aba ${index + 1}`,
        value: index,
      })),
    [blocks],
  );

  const selectedBlock = blocks[selectedBlockIndex] ?? null;
  const formLinks = useMemo(
    () =>
      formsOptions
        .map((form) => {
          const { label } = resolveFormOptionMeta(form);
          const formName = label;
          if (!formName) return null;

          const resolvedProjectSlug =
            resolveProjectSlug(form) || DEFAULT_PROJECT_SLUG;
          const href = buildLink(formName, resolvedProjectSlug);

          return { formName, href };
        })
        .filter(
          (item): item is { formName: string; href: string } => Boolean(item),
        ),
    [formsOptions],
  );

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

  const handleUpdateStyle = (key: keyof FormStyleOptions, value: string) => {
    setFormStyles({
      ...formStyles,
      [key]: value,
    });
  };

  const handleClearSelectedForm = () => {
    setSelectedFormId(null);
    onDetachSelectedForm();
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
      setTimeout(() => setCopiedLink((current) => (current === link ? null : current)), 1800);
    } catch (error) {
      console.error("Erro ao copiar link", error);
    }
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
        {isEditingForm ? (
          <Box className={styles.selectedFormActions}>
            <Typography className={styles.sectionHint}>
              Modo edicao ativo. Limpe a selecao para criar um novo formulario.
            </Typography>
            <Button
              onClick={handleClearSelectedForm}
              className={styles.previewButton}
            >
              Desmarcar
            </Button>
          </Box>
        ) : null}
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
        title="Links dos formularios"
        expanded={expandedLinks}
        onToggle={(next) => setExpandedLinks(next)}
        className={styles.card}
      >
        {formLinks.length ? (
          <Box className={styles.linksList}>
            {formLinks.map((formLink) => (
              <Box key={formLink.href} className={styles.linkItem}>
                <Typography className={styles.fieldName}>
                  {formLink.formName}
                </Typography>
                <Box className={styles.linkRow}>
                  <a
                    href={formLink.href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.formLink}
                  >
                    {formLink.href}
                  </a>
                  <IconButton
                    size="small"
                    aria-label={`Copiar link ${formLink.formName}`}
                    onClick={() => void handleCopyLink(formLink.href)}
                    className={styles.copyButton}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                {copiedLink === formLink.href ? (
                  <Typography className={styles.copyFeedback}>
                    Link copiado
                  </Typography>
                ) : null}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography className={styles.helperText}>
            Nenhum formulario disponivel para gerar link.
          </Typography>
        )}
      </ExpandableCard>

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
        title="Opcoes do Formulario"
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

      <ExpandableCard
        title="Opcoes de estilizacao"
        expanded={expandedLayout}
        onToggle={(next) => setExpandedLayout(next)}
        className={styles.card}
      >
        <Box className={styles.layoutOptions}>
          <Typography className={styles.sectionHint}>
            As cores sao aplicadas no canvas e no preview.
          </Typography>
          <Box className={styles.styleGrid}>
            {STYLE_INPUTS.map((styleInput) => (
              <Box key={styleInput.key} className={styles.styleItem}>
                <Typography className={styles.fieldName}>
                  {styleInput.label}
                </Typography>
                <input
                  type="color"
                  value={formStyles[styleInput.key]}
                  onChange={(event) =>
                    handleUpdateStyle(styleInput.key, event.target.value)
                  }
                  className={styles.colorInput}
                  aria-label={styleInput.label}
                />
                <Typography className={styles.colorValue}>
                  {formStyles[styleInput.key]}
                </Typography>
              </Box>
            ))}
          </Box>
          <Button
            variant="secondary"
            onClick={() => setFormStyles({ ...DEFAULT_FORM_STYLE_OPTIONS })}
          >
            Restaurar cores padrao
          </Button>
        </Box>
      </ExpandableCard>
      <Button onClick={onSubmitForm} isLoading={isSavingForm}>
        {isEditingForm ? "Atualizar formulario" : "Cadastrar formulario"}
      </Button>
    </Box>
  );
}
