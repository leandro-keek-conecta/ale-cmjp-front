import Autocomplete from "@mui/material/Autocomplete";
import type { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import { buildThemedInputSx } from "@/utils/formTheme";

type PrimitiveSelectValue = string | number | boolean;
type SelectValue = PrimitiveSelectValue | PrimitiveSelectValue[] | null;

interface Option {
  label: string;
  value: PrimitiveSelectValue;
}
interface SelectTexProps {
  label: string;
  placeholder?: string;
  options: Option[];
  value?: SelectValue;
  onChange: (value: SelectValue | null) => void;
  error?: boolean;
  helperText?: string;
  isMulti?: boolean;
  required?: boolean;
}

export default function SelectButton({
  label,
  placeholder = "",
  options,
  value,
  onChange,
  error = false,
  helperText = "",
  isMulti = false,
  required = false,
}: SelectTexProps) {
  const isMobile = useMediaQuery("(max-width:768px)");
  const size = isMobile ? "2.6rem" : "2.6rem";

  const multiSelected = Array.isArray(value)
    ? options.filter((option) => value.includes(option.value))
    : [];
  const singleSelected =
    options.find((option) => option.value === value) ?? null;

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      label={label}
      placeholder={placeholder}
      variant="outlined"
      error={error}
      helperText={helperText}
      required={required}
      fullWidth
      InputLabelProps={{
        shrink: true,
      }}
      sx={buildThemedInputSx({ height: size, fontWeight: 500 })}
    />
  );

  if (isMulti) {
    return (
      <Autocomplete<Option, true, false, false>
        multiple
        disableCloseOnSelect
        options={options}
        getOptionLabel={(option) => option.label}
        value={multiSelected}
        onChange={(_, newValue) => {
          const values = newValue.map((option) => option.value);
          onChange(values);
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={String(option.value)}
              label={option.label}
              size="small"
              sx={{ height: 24 }}
            />
          ))
        }
        isOptionEqualToValue={(option, selected) =>
          option.value === selected.value
        }
        renderInput={renderInput}
        sx={buildThemedInputSx({ minHeight: size })}
      />
    );
  }

  return (
    <Autocomplete<Option, false, false, false>
      options={options}
      getOptionLabel={(option) => option.label}
      value={singleSelected}
      onChange={(_, newValue) => {
        onChange(newValue?.value ?? null);
      }}
      isOptionEqualToValue={(option, selected) =>
        option.value === selected.value
      }
      renderInput={renderInput}
      sx={buildThemedInputSx({ minHeight: size })}
    />
  );
}
