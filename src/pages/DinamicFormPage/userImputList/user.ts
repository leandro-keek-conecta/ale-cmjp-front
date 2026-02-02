import type { FormValues } from "../../../types/user";
import type { InputType } from "../../../components/Forms";

export type SelectOption<T = string | number> = { label: string; value: T };

const campanhaOptions: SelectOption<string>[] = [
  { label: "Sim", value: "Sim" },
  { label: "N\u00e3o", value: "N\u00e3o" },
];

const PHONE_PARTIAL_REGEX =
  /^(?:\d{0,2}|\d{2} 9|\d{2} 9 \d{0,4}|\d{2} 9 \d{4} - \d{0,4})$/;
const PHONE_FULL_REGEX = /^\d{2} 9 \d{4} - \d{4}$/;

// horario ser\u00e1 gerado internamente, ent\u00e3o n\u00e3o entra nos inputs
export const getUserInputs = (): InputType<FormValues>[] => [
  {
    name: "nome",
    title: "Nome",
    placeholder: "Digite seu nome completo",
    type: "text",
    colSpan: 12,
    rules: { required: "Nome \u00e9 obrigat\u00f3rio" },
  },
  {
    name: "telefone",
    title: "Telefone",
    placeholder: "83 9 9999 - 9999",
    type: "text",
    colSpan: 12,
    rules: {
      required: "Telefone \u00e9 obrigat\u00f3rio",
      validate: (value: string) => {
        if (!value) return true;
        if (!PHONE_PARTIAL_REGEX.test(value)) {
          return "Use o formato 83 9 9999 - 9999";
        }
        const digits = value.replace(/\D/g, "");
        if (digits.length >= 11 && !PHONE_FULL_REGEX.test(value)) {
          return "Use o formato 83 9 9999 - 9999";
        }
        return true;
      },
    },
  },
  {
    name: "bairro",
    title: "Bairro",
    placeholder: "Digite o bairro",
    type: "text",
    colSpan: 12,
    rules: { required: "Bairro \u00e9 obrigat\u00f3rio" },
  },
  {
    name: "campanha",
    title: "Deseja Receber Novidades?",
    placeholder: "Participa da campanha?",
    type: "Select",
    colSpan: 12,
    selectOptions: campanhaOptions,
    rules: { required: "Campanha \u00e9 obrigat\u00f3ria" },
  },
];
