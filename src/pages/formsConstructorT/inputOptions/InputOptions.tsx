import styles from "./inputOptions.module.css";
import InputText from "@/components/InputText";
import TextArea from "@/components/TextArea";
import { Box, Typography } from "@mui/material";
import { FIELD_OPTIONS } from "../types/formsTypes";
import { Draggable } from "@/components/Draggable/Draggable";
import SelectButton from "@/components/selectButtom";
import { useEffect, useState } from "react";
import { listForms } from "@/services/forms/formsService";
import Button from "@/components/Button";

export type FormOptionItem = {
  id?: number | string;
  name?: string;
  [key: string]: unknown;
};

type PrimitiveSelectValue = string | number | boolean;

type InputOptionsProps = {
  titleForm: string;
  setTitleForm: (value: string) => void;
  descriptionForm: string;
  setDescriptionForm: (value: string) => void;
  onTogglePreview: () => void;
  onSelectForm: (form: FormOptionItem | null) => void;
};

export default function InputOptions({
  titleForm,
  setTitleForm,
  descriptionForm,
  setDescriptionForm,
  onTogglePreview,
  onSelectForm,
}: InputOptionsProps) {
  const [formsOptions, setFormsOptions] = useState<FormOptionItem[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  const selectOptions = formsOptions
    .map((form) => {
      const label = typeof form.name === "string" ? form.name.trim() : "";
      const value = form.id;
      if (
        !label ||
        !(
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        )
      ) {
        return null;
      }
      return {
        label,
        value: value as PrimitiveSelectValue,
      };
    })
    .filter((option): option is { label: string; value: PrimitiveSelectValue } =>
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

  const handleSelectForm = (value: number | string | null) => {

    if (value === null || value === undefined || value === "") {
      setSelectedFormId(null);
      onSelectForm(null);
      return;
    }

    const normalizedId = Number(value);
    if (!Number.isFinite(normalizedId)) {
      setSelectedFormId(null);
      onSelectForm(null);
      return;
    }

    setSelectedFormId(normalizedId);
    const selected =
      formsOptions.find((form) => Number(form.id) === normalizedId) ?? null;
    onSelectForm(selected);
  };

  return (
    <Box className={styles.containerBoxInputs}>
      <Box className={styles.headerRow}>
        <Typography className={styles.tu}>Informacoes padrao do Forms</Typography>
        <Button onClick={onTogglePreview} className={styles.previewButton}>
          Preview
        </Button>
      </Box>
      <SelectButton
        label="Formularios do projeto"
        options={selectOptions}
        value={selectedFormId}
        onChange={(value) => handleSelectForm(value as number | string | null)}
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
      <Typography className={styles.tu}>Opcoes do Formulario</Typography>
      <Box className={styles.buttomOptions}>
        {FIELD_OPTIONS.map((input) => (
          <Box component="li" key={input.id} className={styles.bottonsContent}>
            <Draggable id={`input-${input.id}`}>
              <Box className={styles.menuItem}>
                <span className={styles.label}>{input.label}</span>
              </Box>
            </Draggable>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
