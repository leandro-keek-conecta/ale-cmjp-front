import type { FormValues } from "../../../@types/user";
import type { InputType } from "../../../components/Forms";


export type SelectOption<T = string | number> = { label: string; value: T };

const genderOptions: SelectOption<string>[] = [
  { label: "Feminino", value: "Feminino" },
  { label: "Masculino", value: "Masculino" },
  { label: "Transgênero", value: "Transgênero" },
  { label: "Não-Binário", value: "Não-Binário" },
  { label: "Outros", value: "Outros" },
  { label: "Prefiro não responder", value: "Prefiro não responder" },
];

const campanhaOptions: SelectOption<string>[] = [
  { label: "Sim", value: "Sim" },
  { label: "Não", value: "Não" },
];

// horario será gerado internamente, então não entra nos inputs
export const getUserInputs = (): InputType<FormValues>[] => [
  {
    name: "nome",
    title: "Nome",
    placeholder: "Digite seu nome completo",
    type: "text",
    colSpan: 12,
    rules: { required: "Nome é obrigatório" },
  },
  {
    name: "telefone",
    title: "Telefone",
    placeholder: "Digite seu telefone",
    type: "text",
    colSpan: 12,
    rules: { required: "Telefone é obrigatório" },
  },
  {
    name: "ano_nascimento",
    title: "Ano de nascimento",
    placeholder: "Digite o ano de nascimento",
    type: "text",
    colSpan: 12,
    rules: { required: "Ano de nascimento é obrigatório" },
  },
  {
    name: "genero",
    title: "Gênero",
    placeholder: "Selecione o gênero",
    type: "Select",
    colSpan: 12,
    selectOptions: genderOptions,
    rules: { required: "Gênero é obrigatório" },
  },
  {
    name: "bairro",
    title: "Bairro",
    placeholder: "Digite o bairro",
    type: "text",
    colSpan: 12,
    rules: { required: "Bairro é obrigatório" },
  },
  {
    name: "campanha",
    title: "Deseja Receber Novidades?",
    placeholder: "Participa da campanha?",
    type: "Select",
    colSpan: 12,
    selectOptions: campanhaOptions,
    rules: { required: "Campanha é obrigatória" },
  },
];
