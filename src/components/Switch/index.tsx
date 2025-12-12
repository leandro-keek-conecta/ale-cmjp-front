import Autocomplete from "@mui/material/Autocomplete";
import type { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";

type PrimitiveSelectValue = string | number | boolean;
type SelectValue = PrimitiveSelectValue | PrimitiveSelectValue[] | null;

interface Option {
  label: string;
  value: PrimitiveSelectValue;
  active: boolean; // <-- ADICIONADO
}

interface SelectTexProps {
  label: string;
  placeholder?: string;
  options: Option[];
  value?: SelectValue;
  onChange: (value: SelectValue | null) => void;
  error?: boolean;
  helperText?: string;
}

export default function selectWithSwitch({
  label,
  placeholder = "",
  options,
  value,
  onChange,
  error = false,
  helperText = "",
}: SelectTexProps) {
  const isMobile = useMediaQuery("(max-width:768px)");
  const size = isMobile ? "2.8rem" : "2.8rem";

  // Estado local para switches individuais
  const [items, setItems] = useState<Option[]>(options);

  const toggleActive = (optionValue: PrimitiveSelectValue) => {
    setItems((prev) =>
      prev.map((item) =>
        item.value === optionValue ? { ...item, active: !item.active } : item
      )
    );
  };

  const multiSelected = Array.isArray(value)
    ? items.filter((option) => value.includes(option.value))
    : [];

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      label={label}
      placeholder={placeholder}
      variant="outlined"
      error={error}
      helperText={helperText}
      fullWidth
      InputLabelProps={{ shrink: true }}
      sx={{
        "& .MuiOutlinedInput-root": { height: size },
        "& .MuiInputBase-input": {
          padding: "12px 14px",
          borderRadius: "8px",
          fontSize: "16px",
        },
      }}
    />
  );

  return (
    <Autocomplete<Option, true, false, false>
      multiple
      disableCloseOnSelect
      options={items}
      getOptionLabel={(option) => option.label}
      value={multiSelected}
      onChange={(_, newValue) => {
        const values = newValue.map((option) => option.value);
        onChange(values);
      }}
      renderOption={(props:any, option:any, { selected }) => (
        <li {...props} key={option.value} style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <span>{option.label}</span>

          {/* Switch ao lado da opção */}
          <Switch
            checked={option.active}
            onClick={(e) => {
              e.stopPropagation(); // Não dispara seleção ao clicar no switch
              toggleActive(option.value);
            }}
          />
        </li>
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option:any, index:any) => (
          <Chip
            {...getTagProps({ index })}
            key={option.value}
            label={option.label}
            size="small"
            sx={{ height: 24 }}
          />
        ))
      }
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      renderInput={renderInput}
      sx={{
        "& .MuiOutlinedInput-root": {
          minHeight: size,
        },
      }}
    />
  );
}
