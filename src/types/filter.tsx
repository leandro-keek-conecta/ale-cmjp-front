
export type FilterFormValues = {
  dataInicio: Date | null;
  dataFim: Date | null;
  tipo: string;
  tema: string;
  bairro: string;
  genero: string;
  faixaEtaria: string;
  texto_opiniao: string;
};

export type FiltersState = {
  data?: {
    inicio?: Date;
    fim?: Date;
  };
  tipo?: string;
  tema?: string;
  genero?: string;
  bairro?: string;
  faixaEtaria?: {
    min: number;
    max: number;
  } | null;
  texto?: string;
};

export type FormValues = FilterFormValues;
