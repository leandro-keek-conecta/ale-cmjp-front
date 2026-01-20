import type { FormValues } from "../../../../@types/filter";
import type { InputType } from "../../../../components/Forms";

export type SelectOption<T = string | number> = { label: string; value: T };

const tipoOptions: SelectOption<string>[] = [
  { label: "Sugestão", value: "Sugestão" },
  { label: "Reclamação", value: "Reclamação" },
  { label: "Denúncia", value: "Denúncia" },
  { label: "Elogio", value: "Elogio" },
];

const temaOptions: SelectOption<string>[] = [
  { label: "Educação", value: "Educação" },
  { label: "Saúde", value: "Saúde" },
  { label: "Infraestrutura", value: "Infraestrutura" },
  { label: "Segurança", value: "Segurança" },
  { label: "Mobilidade", value: "Mobilidade" },
  { label: "Outros", value: "Outros" },
];

const generoOptions: SelectOption<string>[] = [
  { label: "Feminino", value: "Feminino" },
  { label: "Masculino", value: "Masculino" },
  { label: "Transgênero", value: "Transgênero" },
  { label: "Não-Binário", value: "Não-Binário" },
  { label: "Outros", value: "Outros" },
  { label: "Prefiro não responder", value: "Prefiro não responder" },
];

const faixaEtariaOptions: SelectOption<string>[] = [
  { label: "Até 17", value: "Até 17" },
  { label: "18-24", value: "18-24" },
  { label: "25-34", value: "25-34" },
  { label: "35-44", value: "35-44" },
  { label: "45-54", value: "45-54" },
  { label: "55-64", value: "55-64" },
  { label: "65+", value: "65+" },
];

export const getFilterInputs = (): InputType<FormValues>[] => [
  {
    name: "dataInicio",
    title: "Data inicial",
    placeholder: "Selecione a data inicial",
    type: "Date",
    colSpan: 6,
  },
  {
    name: "dataFim",
    title: "Data final",
    placeholder: "Selecione a data final",
    type: "Date",
    colSpan: 6,
  },
  {
    name: "tipo",
    title: "Tipo",
    placeholder: "Selecione o tipo",
    type: "Select",
    colSpan: 4,
    selectOptions: tipoOptions,
  },
  {
    name: "tema",
    title: "Tema",
    placeholder: "Selecione o tema",
    type: "Select",
    colSpan: 4,
    selectOptions: temaOptions,
  },
  {
    name: "genero",
    title: "Gênero",
    placeholder: "Selecione o gênero",
    type: "Select",
    colSpan: 4,
    selectOptions: generoOptions,
  },
  {
    name: "bairro",
    title: "Bairro",
    placeholder: "Digite o bairro",
    type: "text",
    colSpan: 6,
  },
  {
    name: "faixaEtaria",
    title: "Faixa etária",
    placeholder: "Selecione a faixa",
    type: "Select",
    colSpan: 6,
    selectOptions: faixaEtariaOptions,
  },
  {
    name: "texto_opiniao",
    title: "Texto da opinião",
    placeholder: "Busque por palavra-chave",
    type: "text",
    colSpan: 12,
  },
];
