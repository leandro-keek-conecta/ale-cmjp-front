import { Box, Button, Card } from "@mui/material";
import styles from "./FormsPage.module.css";
import HorizontalLinearAlternativeLabelStepper from "../../components/stepper";
import { useState } from "react";
import Forms from "../../components/Forms";
import { getUserInputs } from "./userImputList/user";
import { useForm } from "react-hook-form";
import type { FormValues } from "../../@types/user";

const steps = [
  "Cadastro de usuário",
  "Cadastro de Opinião",
  "Quer Receber Novidades?",
];

const buildDefaultValues = (): FormValues => ({
  id: "",
  horario: "",
  nome: "",
  telefone: "",
  ano_nascimento: "",
  genero: "",
  bairro: "",
  campanha: "",
});

export default function FormsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const {
    control,
    formState: { errors },
    reset: resetEdit,
    handleSubmit: handleCreate,
    getValues,
    setValue,
  } = useForm<FormValues>({
    defaultValues: buildDefaultValues(),
  });

  function onSubmit(data: FormValues) {
    console.log("Form Data:", data);
    const userData = {
      ...data,
      horario: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour12: false,
      }),
    };
    console.log("User Data with horario:", userData);
  }

  function handleResetForm() {
    resetEdit(buildDefaultValues());
    setCurrentStep(0);
  }

  function handleChangeInputList() {
    if (currentStep === 0) {
      return (
        <Forms
          inputsList={getUserInputs()}
          onInputChange={() => {}}
          errors={errors}
          control={control}
        />
      );
      setCurrentStep((prevStep) => prevStep + 1);
    }
    if (currentStep === 1) {
      setCurrentStep((prevStep) => prevStep + 1);
      return (
        <Forms
          inputsList={getOpinionInputs()}
          onInputChange={() => {}}
          errors={errors}
          control={control}
        />
      );
    } else {
    }
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.formBox}>
        <Box className={styles.stepperBox}>
          <HorizontalLinearAlternativeLabelStepper
            step={steps}
            activeNumberStep={currentStep}
          />
        </Box>
        <Box>
          <Forms
            inputsList={getUserInputs()}
            onInputChange={() => {}}
            errors={errors}
            control={control}
          />

          <Box className={styles.buttonsBox}>
            <Button
              className={styles.submitButton}
              onClick={handleCreate(onSubmit)}
            >
              Enviar
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
