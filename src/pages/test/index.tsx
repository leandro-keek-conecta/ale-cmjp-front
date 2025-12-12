import { Box, Button, Card } from "@mui/material";
import styles from "./FormsPage.module.css";
import HorizontalLinearAlternativeLabelStepper from "../../components/stepper";
import { useEffect, useState } from "react";
import Forms from "../../components/Forms";
import { getUserInputs } from "./userImputList/user";
import { useForm } from "react-hook-form";
import type { FormValues, UserFormValues } from "../../@types/user";
import type { OpinionFormValues } from "../../@types/opiniao";
import { getOpinionInputs } from "./opinionList/opinionImputList";

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

const buildOpinionDefaultValues = (): OpinionFormValues => ({
  opiniao_id: "",
  usuario_id: "",
  horario_opiniao: "",
  acao: "",
  opiniao: "",
  outra_opiniao: "",
  tipo_opiniao: "",
  texto_opiniao: "",
});

export default function FormsPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    control: userControl,
    formState: { errors: userErrors },
    handleSubmit: handleUserSubmit,
    reset: resetUser,
  } = useForm<UserFormValues>({
    defaultValues: buildDefaultValues(),
  });

  const {
    control: opinionControl,
    formState: { errors: opinionErrors },
    handleSubmit: handleOpinionSubmit,
    reset: resetOpinion,
  } = useForm<OpinionFormValues>({
    defaultValues: buildOpinionDefaultValues(),
  });

  function onSubmitUser(data: UserFormValues) {
    console.log("User form:", data);
    setCurrentStep(1);
  }

  function onSubmitOpinion(data: OpinionFormValues) {
    console.log("Opinion form:", data);
    setCurrentStep(2);
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
          {currentStep === 0 && (
            <Forms<UserFormValues>
              inputsList={getUserInputs()}
              control={userControl}
              errors={userErrors}
              onInputChange={() => {}}
            />
          )}

          {currentStep === 1 && (
            <Forms<OpinionFormValues>
              inputsList={getOpinionInputs()}
              control={opinionControl}
              errors={opinionErrors}
              onInputChange={() => {}}
            />
          )}

          <Box className={styles.buttonsBox}>
            {currentStep === 0 && (
              <Button
                className={styles.submitButton}
                onClick={handleUserSubmit(onSubmitUser)}
              >
                Enviar usuário
              </Button>
            )}

            {currentStep === 1 && (
              <Button
                className={styles.submitButton}
                onClick={handleOpinionSubmit(onSubmitOpinion)}
              >
                Enviar opinião
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
