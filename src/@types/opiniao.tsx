export type OpiniaoCategoria =
  | "Educação"
  | "Saúde"
  | "Infraestrutura"
  | "Segurança"
  | "Mobilidade"
  | "Outros"
  | "";

export type TipoOpiniao = "Sugestão" | "Reclamação" | "Apoio" | "Elogio" | "";

export type OpinionFormValues = {
  opiniao_id: string;
  usuario_id: string;
  horario_opiniao: string;
  acao: string;
  opiniao: OpiniaoCategoria;
  outra_opiniao: string;
  tipo_opiniao: TipoOpiniao;
  texto_opiniao: string;
};

export type FormValues = OpinionFormValues;
