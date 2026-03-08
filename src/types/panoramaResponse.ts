export type PanoramaResponseField = {
  fieldName?: string;
  name?: string;
  value?: unknown;
  valueNumber?: unknown;
};

export type PanoramaResponse = {
  id: number | string;
  formId?: number | null;
  formName?: string;
  usuario_id?: number | string;
  nome?: string;
  sobrenome?: string;
  telefone?: string;
  email?: string;
  genero?: string;
  ano_nascimento?: number | string | null;
  bairro?: string;
  campanha?: string;
  horario?: string | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
  acao?: string;
  opiniao?: string;
  outra_opiniao?: string;
  tipo_opiniao?: string;
  texto_opiniao?: string;
  fields?: Record<string, unknown> | PanoramaResponseField[];
  [key: string]: unknown;
};
