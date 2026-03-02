import type { FormValues } from "../../../../types/filter";
import type { InputType } from "../../../../components/Forms";

export type SelectOption<T = string | number> = { label: string; value: T };

export type FilterSelectOptions = {
  tipo: SelectOption<string>[];
  tema: SelectOption<string>[];
  genero: SelectOption<string>[];
  faixaEtaria: SelectOption<string>[];
};

const defaultSelectOptions: FilterSelectOptions = {
  tipo: [
    { label: "Denúncia", value: "Denúncia" },
    { label: "Elogio", value: "Elogio" },
    { label: "Reclamação", value: "Reclamação" },
    { label: "Sugestão", value: "Sugestão" },
  ],
  tema: [
    { label: "Educação", value: "educacao" },
    { label: "Infraestrutura", value: "Infraestrutura" },
    { label: "Mobilidade", value: "Mobilidade" },
    { label: "Outros", value: "Outros" },
    { label: "Saúde", value: "saude" },
    { label: "Segurança", value: "Segurança" },
  ],
  genero: [
    { label: "Feminino", value: "Feminino" },
    { label: "Masculino", value: "Masculino" },
    { label: "Não-Binário", value: "Não-Binário" },
    { label: "Outros", value: "Outros" },
    { label: "Prefiro não responder", value: "Prefiro não responder" },
    { label: "Transgênero", value: "Transgênero" },
  ],
  faixaEtaria: [
    { label: "18-24", value: "18-24" },
    { label: "25-34", value: "25-34" },
    { label: "35-44", value: "35-44" },
    { label: "45-54", value: "45-54" },
    { label: "55-64", value: "55-64" },
    { label: "65+", value: "65+" },
    { label: "Até 17", value: "Até 17" },
  ],
};

export const getFilterInputs = (
  options: Partial<FilterSelectOptions> = {},
): InputType<FormValues>[] => {
  const resolved = {
    tipo: options.tipo ?? defaultSelectOptions.tipo,
    tema: options.tema ?? defaultSelectOptions.tema,
    genero: options.genero ?? defaultSelectOptions.genero,
    faixaEtaria: options.faixaEtaria ?? defaultSelectOptions.faixaEtaria,
  };

  return [
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
      selectOptions: resolved.tipo,
    },
    {
      name: "tema",
      title: "Tema",
      placeholder: "Selecione o tema",
      type: "Select",
      colSpan: 4,
      selectOptions: resolved.tema,
    },
    {
      name: "genero",
      title: "Gênero",
      placeholder: "Selecione o gênero",
      type: "Select",
      colSpan: 4,
      selectOptions: resolved.genero,
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
      selectOptions: resolved.faixaEtaria,
    },
    {
      name: "texto_opiniao",
      title: "Pesquisa por palavra chave”",
      placeholder: "Busque por palavra-chave",
      type: "text",
      colSpan: 12,
    },
  ];
};
