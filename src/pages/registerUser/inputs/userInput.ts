
import type { InputType } from "@/components/Forms";
import type { ProjetoAccessLevel } from "../../../types/IUserType";
import type { FormValues } from "../RegisterUser";

export type SelectOption<T = string | number> = { label: string; value: T };

export const levelAccessOptions: SelectOption<ProjetoAccessLevel>[] = [
  { label: "Acesso Total ao Projeto", value: "FULL_ACCESS" },
  { label: "Apenas Automações", value: "AUTOMATIONS_ONLY" },
  { label: "Apenas Dashboard", value: "DASH_ONLY" },
];

export const getUserInputs = (isEditing = false): InputType<FormValues>[] => {
  const inputs: InputType<FormValues>[] = [
    {
      name: "name",
      title: "Nome",
      placeholder: "Digite seu nome completo",
      type: "text",
      colSpan: 4,
      rules: { required: "Nome é obrigatório" },
    },
    {
      name: "email",
      title: "E-mail",
      placeholder: "Digite seu e-mail completo",
      type: "email",
      colSpan: 4,
      rules: {
        required: "E-mail é obrigatório",
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "E-mail inválido",
        },
      },
    },
    {
      name: "role",
      title: "Nível de Acesso",
      placeholder: "Selecione o papel global",
      type: "Select",
      colSpan: 4,
      selectOptions: [
        { label: "Usuário Comum", value: "USER" },
        { label: "Administrador", value: "ADMIN" },
        { label: "Administrador Geral", value: "SUPERADMIN" },
      ],
      rules: { required: "Função é obrigatória" },
    }
  ];

  if (!isEditing) {
    inputs.splice(
      4,
      0,
      {
        name: "password",
        title: "Senha",
        placeholder: "Digite sua senha",
        type: "text",
        colSpan: 6,
        rules: {
          required: "Senha é obrigatória",
          minLength: { value: 6, message: "Mínimo 6 caracteres" },
        },
      },
      {
        name: "passwordConfirm",
        title: "Confirme sua senha",
        placeholder: "Digite sua senha novamente",
        type: "text",
        colSpan: 6,
        rules: { required: "Confirmação de senha é obrigatória" },
      }
    );
  }

  return inputs;
};

