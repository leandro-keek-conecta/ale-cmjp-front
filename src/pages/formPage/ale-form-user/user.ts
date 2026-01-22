import type { FormValues } from "../../../types/user";
import type { InputType } from "../../../components/Forms";

export type SelectOption<T = string | number> = { label: string; value: T };

const genderOptions: SelectOption<string>[] = [
  { label: "Feminino", value: "Feminino" },
  { label: "Masculino", value: "Masculino" },
  { label: "Transg\u00eenero", value: "Transg\u00eenero" },
  { label: "N\u00e3o-Bin\u00e1rio", value: "N\u00e3o-Bin\u00e1rio" },
  { label: "Outros", value: "Outros" },
  { label: "Prefiro n\u00e3o responder", value: "Prefiro n\u00e3o responder" },
];

const campanhaOptions: SelectOption<string>[] = [
  { label: "Sim", value: "Sim" },
  { label: "N\u00e3o", value: "N\u00e3o" },
];

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
    placeholder: "Digite seu telefone",
    type: "text",
    colSpan: 12,
    rules: { required: "Telefone \u00e9 obrigat\u00f3rio" },
  },
  {
    name: "ano_nascimento",
    title: "Ano de nascimento",
    placeholder: "Digite o ano de nascimento",
    type: "text",
    colSpan: 12,
    rules: { required: "Ano de nascimento \u00e9 obrigat\u00f3rio" },
  },
  {
    name: "genero",
    title: "G\u00eanero",
    placeholder: "Selecione o g\u00eanero",
    type: "Select",
    colSpan: 12,
    selectOptions: genderOptions,
    rules: { required: "G\u00eanero \u00e9 obrigat\u00f3rio" },
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
