import type { InputType } from "@/components/Forms";
import type { ProjetoBasicFormValues } from "@/types/IProjetoType";

type SelectOption = {
  label: string;
  value: string | number | boolean;
};


export const getProjetoBasicInputs = (
  userOptions: SelectOption[] = [],
): InputType<ProjetoBasicFormValues>[] => {
  return [
    {
      name: "name",
      title: "Nome do Projeto",
      placeholder: "Digite o nome do projeto",
      type: "text",
      colSpan: 4,
      rules: {
        required: "Nome é obrigatório",
      },
    },
    {
      name: "slug",
      title: "Slug do Projeto",
      placeholder: "ex: escuta-cidada-2026",
      type: "text",
      colSpan: 4,
      rules: {
        required: "Slug é obrigatório",
        pattern: {
          value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          message:
            "Use apenas letras minúsculas, números e hífens (sem espaços)",
        },
      },
    },
    {
      name: "cliente",
      title: "Cliente",
      placeholder: "Nome do cliente",
      type: "Select",
      selectOptions: userOptions,
      colSpan: 4,
    },
    {
      name: "reportId",
      title: "Report ID (Dashboard)",
      placeholder: "ID do relatório vinculado",
      type: "text",
      colSpan: 4,
    },
    {
      name: "groupId",
      title: "Group ID (Power BI)",
      placeholder: "ID do workspace",
      type: "text",
      colSpan: 4,
    },
    {
      name: "corHex",
      title: "Cor Principal (Hex)",
      placeholder: "#0b5cff",
      type: "text",
      colSpan: 4,
      rules: {
        pattern: {
          value: /^#([0-9A-Fa-f]{6})$/,
          message: "Informe um HEX válido (ex: #0b5cff)",
        },
      },
    },
    {
      name: "logoUrl",
      title: "URL da Logo",
      placeholder: "https://...",
      type: "text",
      colSpan: 10,
    },
    {
      name: "ativo",
      title: "Projeto Ativo",
      type: "switch",
      colSpan: 2,
    },
    {
      name: "descricaoCurta",
      title: "Descrição Curta",
      placeholder: "Breve descrição do projeto",
      type: "textarea",
      colSpan: 12,
    },
  ];
};
