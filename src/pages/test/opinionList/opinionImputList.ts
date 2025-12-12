import type { InputType } from "../../../components/Forms";
import type { FormValues, OpiniaoCategoria, TipoOpiniao } from "../../../@types/opiniao";

type SelectOption<T = string | number> = { label: string; value: T };

const opiniaoOptions: SelectOption<OpiniaoCategoria>[] = [
  { label: "Educação", value: "Educação" },
  { label: "Saúde", value: "Saúde" },
  { label: "Infraestrutura", value: "Infraestrutura" },
  { label: "Segurança", value: "Segurança" },
  { label: "Mobilidade", value: "Mobilidade" },
  { label: "Outros", value: "Outros" },
];

const tipoOpiniaoOptions: SelectOption<TipoOpiniao>[] = [
  { label: "Sugestão", value: "Sugestão" },
  { label: "Reclamação", value: "Reclamação" },
  { label: "Apoio", value: "Apoio" },
  { label: "Elogio", value: "Elogio" },
];

export const getOpinionInputs = (): InputType<FormValues>[] => [
  {
    name: "usuario_id",
    title: "ID do usuário",
    placeholder: "Informe o ID do usuário",
    type: "text",
    colSpan: 12,
    rules: { required: "ID do usuário é obrigatório" },
  },
  {
    name: "acao",
    title: "Ação",
    placeholder: "Registrar opinião",
    type: "text",
    colSpan: 12,
    rules: { required: "Ação é obrigatória" },
  },
  {
    name: "opiniao",
    title: "Opinião",
    placeholder: "Selecione o tema da opinião",
    type: "Select",
    colSpan: 12,
    selectOptions: opiniaoOptions,
    rules: { required: "Opinião é obrigatória" },
  },
  {
    name: "outra_opiniao",
    title: "Outra opinião",
    placeholder: "Descreva outra opinião (opcional)",
    type: "text",
    colSpan: 12,
  },
  {
    name: "tipo_opiniao",
    title: "Tipo de opinião",
    placeholder: "Selecione o tipo",
    type: "Select",
    colSpan: 12,
    selectOptions: tipoOpiniaoOptions,
    rules: { required: "Tipo de opinião é obrigatório" },
  },
  {
    name: "texto_opiniao",
    title: "Descrição",
    placeholder: "Digite a opinião",
    type: "textarea",
    colSpan: 12,
  },
];
