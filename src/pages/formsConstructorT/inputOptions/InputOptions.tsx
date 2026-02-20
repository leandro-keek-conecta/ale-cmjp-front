import styles from "./inputOptions.module.css";
import InputText from "@/components/InputText";
import TextArea from "@/components/TextArea";
import { Box, Typography } from "@mui/material";
import { FIELD_OPTIONS } from "../types/formsTypes";
import { Draggable } from "@/components/Draggable/Draggable";
import SelectButton from "@/components/selectButtom";
import { useEffect, useState } from "react";
import { listForms } from "@/services/forms/formsService";

type InputOptionsProps = {
  titleForm: string;
  setTitleForm: (value: string) => void;
  descriptionForm: string;
  setDescriptionForm: (value: string) => void;
};

export default function InputOptions({
  titleForm,
  setTitleForm,
  descriptionForm,
  setDescriptionForm,
}: InputOptionsProps) {
  const [formsOptions, setFormsOptions] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  const selectOptions = formsOptions.map((form: any) => ({
    label: form.name,
    value: form.id,
  }));
  async function fetchOptions() {
    try {
      const reponse: any = await listForms("ale-cmjp");

      return setFormsOptions(reponse);
    } catch (error) {
      console.log("Erro");
    }
  }

  useEffect(() => {
    void fetchOptions();
  }, []);

  return (
    <Box className={styles.containerBoxInputs}>
      <Typography className={styles.tu}>Informacoes padrao do Forms</Typography>
      <SelectButton
        label="Formulários do projeto"
        options={selectOptions}
        value={selectedFormId}
        onChange={(value) => setSelectedFormId(value as number | null)}
      />

      <Typography className={styles.tu}>Informacoes padrao do Forms</Typography>
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
