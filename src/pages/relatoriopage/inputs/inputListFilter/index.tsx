import type { FormValues } from "../../../../types/filter";
import type { InputType } from "../../../../components/Forms";

export type SelectOption<T = string | number> = { label: string; value: T };

export type FilterSelectOptions = {
  formIds: SelectOption<number>[];
  status: SelectOption<string>[];
};

const defaultSelectOptions: FilterSelectOptions = {
  formIds: [],
  status: [
    { label: "Iniciadas", value: "STARTED" },
    { label: "Concluídas", value: "COMPLETED" },
    { label: "Abandonadas", value: "ABANDONED" },
  ],
};

export const getFilterInputs = (
  options: Partial<FilterSelectOptions> = {},
): InputType<FormValues>[] => {
  const resolved = {
    formIds: options.formIds ?? defaultSelectOptions.formIds,
    status: options.status ?? defaultSelectOptions.status,
  };

  return [
    {
      name: "dataInicio",
      title: "Data inicial",
      placeholder: "Selecione a data inicial",
      type: "Date",
      colSpan: 4,
    },
    {
      name: "dataFim",
      title: "Data final",
      placeholder: "Selecione a data final",
      type: "Date",
      colSpan: 4,
    },
    {
      name: "status",
      title: "Status",
      placeholder: "Selecione o status",
      type: "Select",
      colSpan: 4,
      selectOptions: resolved.status,
    },
    {
      name: "formIds",
      title: "Formulários",
      placeholder: "Selecione um ou mais formulários",
      type: "Select",
      colSpan: 12,
      selectOptions: resolved.formIds,
      selectProps: { isMulti: true },
    },
  ];
};

export default getFilterInputs;

