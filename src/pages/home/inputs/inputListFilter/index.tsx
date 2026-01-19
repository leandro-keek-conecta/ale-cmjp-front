import type { FormValues } from "../../../../@types/filter";
import type { InputType } from "../../../../components/Forms";

export type SelectOption<T = string | number> = { label: string; value: T };

const tipoOptions: SelectOption<string>[] = [
  { label: "Sugest\u00e3o", value: "Sugest\u00e3o" },
  { label: "Reclama\u00e7\u00e3o", value: "Reclama\u00e7\u00e3o" },
  { label: "Den\u00fancia", value: "Den\u00fancia" },
  { label: "Elogio", value: "Elogio" },
];

const temaOptions: SelectOption<string>[] = [
  { label: "Educa\u00e7\u00e3o", value: "Educa\u00e7\u00e3o" },
  { label: "Sa\u00fade", value: "Sa\u00fade" },
  { label: "Infraestrutura", value: "Infraestrutura" },
  { label: "Seguran\u00e7a", value: "Seguran\u00e7a" },
  { label: "Mobilidade", value: "Mobilidade" },
  { label: "Outros", value: "Outros" },
];

const generoOptions: SelectOption<string>[] = [
  { label: "Feminino", value: "Feminino" },
  { label: "Masculino", value: "Masculino" },
  { label: "Transg\u00eanero", value: "Transg\u00eanero" },
  { label: "N\u00e3o-Bin\u00e1rio", value: "N\u00e3o-Bin\u00e1rio" },
  { label: "Outros", value: "Outros" },
  { label: "Prefiro n\u00e3o responder", value: "Prefiro n\u00e3o responder" },
];

const faixaEtariaOptions: SelectOption<string>[] = [
  { label: "At\u00e9 17", value: "At\u00e9 17" },
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
    title: "G\u00eanero",
    placeholder: "Selecione o g\u00eanero",
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
    title: "Faixa et\u00e1ria",
    placeholder: "Selecione a faixa",
    type: "Select",
    colSpan: 6,
    selectOptions: faixaEtariaOptions,
  },
  {
    name: "texto_opiniao",
    title: "Texto da opini\u00e3o",
    placeholder: "Busque por palavra-chave",
    type: "text",
    colSpan: 12,
  },
];
