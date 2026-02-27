import type { FormValues } from "../../../../types/filter";
import type { InputType } from "../../../../components/Forms";

export type SelectOption<T = string | number> = { label: string; value: T };

export type FilterSelectOptions = {
  tipo: SelectOption<string>[];
  tema: SelectOption<string>[];
  genero: SelectOption<string>[];
  faixaEtaria: SelectOption<string>[];
};

type FilterInputsConfig = {
  hideTema?: boolean;
};

const defaultSelectOptions: FilterSelectOptions = {
  tipo: [
    { label: "Denuncia", value: "Denuncia" },
    { label: "Elogio", value: "Elogio" },
    { label: "Reclamação", value: "Reclamação" },
    { label: "Sugestão", value: "Sugestão" },
  ],
  tema: [
    { label: "Educacao", value: "Educacao" },
    { label: "Infraestrutura", value: "Infraestrutura" },
    { label: "Mobilidade", value: "Mobilidade" },
    { label: "Outros", value: "Outros" },
    { label: "Saude", value: "Saude" },
    { label: "Seguranca", value: "Seguranca" },
  ],
  genero: [
    { label: "Feminino", value: "Feminino" },
    { label: "Masculino", value: "Masculino" },
    { label: "Não-Binário", value: "Não-Binário" },
    { label: "Outros", value: "Outros" },
    { label: "Prefiro não responder", value: "Prefiro não responder" },
    { label: "Transgenero", value: "Transgenero" },
  ],
  faixaEtaria: [
    { label: "18-24", value: "18-24" },
    { label: "25-34", value: "25-34" },
    { label: "35-44", value: "35-44" },
    { label: "45-54", value: "45-54" },
    { label: "55-64", value: "55-64" },
    { label: "65+", value: "65+" },
    { label: "Ate 17", value: "Ate 17" },
  ],
};

export const getFilterInputs = (
  options: Partial<FilterSelectOptions> = {},
  config: FilterInputsConfig = {},
): InputType<FormValues>[] => {
  const hideTema = Boolean(config.hideTema);
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
      colSpan: hideTema ? 6 : 4,
      selectOptions: resolved.tipo,
    },
    ...(hideTema
      ? []
      : [
          {
            name: "tema" as const,
            title: "Tema",
            placeholder: "Selecione o tema",
            type: "Select" as const,
            colSpan: 4,
            selectOptions: resolved.tema,
          },
        ]),
    {
      name: "genero",
      title: "Genero",
      placeholder: "Selecione o genero",
      type: "Select",
      colSpan: hideTema ? 6 : 4,
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
      title: "Faixa etaria",
      placeholder: "Selecione a faixa",
      type: "Select",
      colSpan: 6,
      selectOptions: resolved.faixaEtaria,
    },
  ];
};

export default getFilterInputs;

