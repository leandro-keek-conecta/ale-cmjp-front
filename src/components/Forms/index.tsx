import styles from "./forms.module.css";
import type {
  Control,
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { Box, Typography } from "@mui/material";
import InputText from "../../components/InputText";
import SelectButton from "../../components/selectButtom";
import InputFile from "../InputFIle";
import TextArea from "../TextArea";
import SwitchComponent from "../Switch";

type PrimitiveSelectValue = string | number | boolean;
type SelectValue = PrimitiveSelectValue | PrimitiveSelectValue[] | null;

interface Option {
  label: string;
  value: PrimitiveSelectValue;
}

export interface InputType<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  title: string;
  placeholder?: string;
  type:
    | "text"
    | "number"
    | "email"
    | "password"
    | "Date"
    | "Select"
    | "inputFile"
    | "textarea"
    | "switch";
  colSpan?: number;
  rowSpan?: number;
  selectOptions?: Option[];
  selectProps?: {
    isMulti?: boolean;
  };
  rules?: object;
  value?: SelectValue;
  containerClassName?: string;
  sectionTitle?: string;
}

interface FormsProps<TFieldValues extends FieldValues = FieldValues> {
  inputsList: InputType<TFieldValues>[];
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  onInputChange?: (name: Path<TFieldValues>, value: SelectValue | null) => void;
  resetKey?: string | number;
}

export default function Forms<TFieldValues extends FieldValues = FieldValues>({
  inputsList,
  control,
  errors,
  resetKey,
  onInputChange,
}: FormsProps<TFieldValues>) {
  return (
    <Box
      className={`form-container ${styles.smallInputs}`}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 2,
        fontSize: "1.0.9rem",
        "& input, & .MuiInputBase-input": {
          fontSize: "1.0.9rem",
        },
        "& label, & .MuiInputLabel-root": {
          fontSize: "1.0.9rem",
        },
        "& .MuiFormHelperText-root": {
          fontSize: "1.0.9rem",
        },
        "& ::placeholder": {
          fontSize: "1.0.9rem",
        },
        "& .MuiSelect-select": {
          fontSize: "1.0.9rem",
        },
      }}
    >
      {inputsList.map((input, index) => {
        const baseDefaultValue =
          input.value ??
          (input.type === "Select" && input.selectProps?.isMulti
            ? []
            : input.type === "switch"
              ? false
              : undefined);

        const controllerDefaultValue =
          baseDefaultValue === undefined
            ? undefined
            : (baseDefaultValue as PathValue<TFieldValues, typeof input.name>);

        return (
          <Box
            key={`${resetKey || "form"}-${input.name}-${index}`}
            sx={{
              gridColumn: {
                xs: "span 12",
                sm: `span ${input.colSpan || 12}`,
              },
            }}
            className={input.containerClassName}
          >
            {input.sectionTitle ? (
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "var(--text)",
                  mb: 1,
                }}
              >
                {input.sectionTitle}
              </Typography>
            ) : null}
            <Controller
              name={input.name}
              control={control}
              {...(controllerDefaultValue !== undefined
                ? { defaultValue: controllerDefaultValue }
                : {})}
              rules={input.rules}
              render={({ field: { onChange, value } }) => {
                const fieldError = errors[input.name as Path<TFieldValues>] as
                  | FieldError
                  | undefined;
                const isRequired = Boolean(
                  (input.rules as { required?: unknown } | undefined)?.required,
                );

                if (input.type === "switch") {
                  const checkedValue =
                    typeof value === "boolean" ? value : Boolean(value);

                  return (
                    <SwitchComponent
                      label={input.title}
                      checked={checkedValue}
                      onChange={(checked) => {
                        onChange(checked);
                        onInputChange?.(input.name, checked);
                      }}
                      error={Boolean(fieldError)}
                      helperText={fieldError?.message as string}
                    />
                  );
                }

                if (input.type === "Select") {
                  // ðŸ”¹ Normaliza valor: converte automaticamente entre formatos [{id}] â‡„ [id]
                  const normalizedValue = (() => {
                    if (Array.isArray(value)) {
                      // Se o valor for [{id:1},{id:3}] â†’ [1,3]
                      if (
                        value.length > 0 &&
                        typeof value[0] === "object" &&
                        "id" in value[0]
                      ) {
                        return value.map((v: any) => v.id);
                      }
                      return value;
                    }
                    return value ?? (input.selectProps?.isMulti ? [] : null);
                  })();

                  return (
                    <SelectButton
                      label={input.title}
                      options={input.selectOptions || []}
                      placeholder={input.placeholder}
                      value={normalizedValue as SelectValue}
                      isMulti={input.selectProps?.isMulti}
                      required={isRequired}
                      onChange={(selectedValue) => {
                        let mappedValue: any;

                        if (input.selectProps?.isMulti) {
                          mappedValue = Array.isArray(selectedValue)
                            ? selectedValue.map((v: any) => {
                                if (
                                  typeof v === "object" &&
                                  v !== null &&
                                  "id" in v
                                ) {
                                  return (v as any).id;
                                }
                                return v;
                              })
                            : [];
                        } else {
                          mappedValue =
                            typeof selectedValue === "object" &&
                            selectedValue !== null
                              ? // garante que, se por acaso vier {id}, use apenas o id
                                ((selectedValue as any).id ?? selectedValue)
                              : (selectedValue ?? null);
                        }

                        onChange(mappedValue);
                        onInputChange?.(input.name, mappedValue);
                      }}
                      error={Boolean(fieldError)}
                      helperText={fieldError?.message as string}
                    />
                  );
                }

                if (input.type === "inputFile") {
                  return (
                    <InputFile
                      label={input.title}
                      placeholder={input.placeholder}
                      onChange={(event) => {
                        const files = event.target.files;
                        if (files) {
                          onChange(files);
                          onInputChange?.(
                            input.name,
                            Array.from(files)
                              .map((f) => f.name)
                              .join(", "),
                          );
                        }
                      }}
                      error={Boolean(fieldError)}
                      helperText={fieldError?.message as string}
                    />
                  );
                }

                if (input.type === "textarea") {
                  return (
                    <TextArea
                      label={input.title}
                      placeholder={input.placeholder || ""}
                      value={value ?? ""}
                      required={isRequired}
                      onChange={(e) => {
                        onChange(e.target.value);
                        onInputChange?.(input.name, e.target.value);
                      }}
                      error={Boolean(fieldError)}
                      helperText={fieldError?.message as string}
                    />
                  );
                }

                return (
                  <InputText
                    label={input.title}
                    placeholder={input.placeholder || ""}
                    type={input.type}
                    value={value ?? ""}
                    required={isRequired}
                    onChange={(e) => {
                      onChange(e.target.value);
                      onInputChange?.(input.name, e.target.value);
                    }}
                    error={Boolean(fieldError)}
                    helperText={fieldError?.message as string}
                  />
                );
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
