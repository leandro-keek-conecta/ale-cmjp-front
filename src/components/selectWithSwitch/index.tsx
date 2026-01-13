import Autocomplete from "@mui/material/Autocomplete";
import type { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import useMediaQuery from "@mui/material/useMediaQuery";
import CircularProgress from "@mui/material/CircularProgress";

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
  loading?: boolean;
  loadingText?: string;
  noOptionsText?: string;
}

export default function SelectWithSwitch({
  label,
  placeholder = "",
  options,
  value,
  onChange,
  error = false,
  helperText = "",
  loading = false,
  loadingText = "Carregando...",
  noOptionsText = "Nenhuma opcao disponivel",
}: SelectTexProps) {
  const isMobile = useMediaQuery("(max-width:768px)");
  const size = isMobile ? "2.4rem" : "2.4rem";

  const selectedValues = Array.isArray(value) ? value : [];

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
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {loading ? (
              <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
            ) : null}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
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
      options={options}
      value={options.filter((opt) => selectedValues.includes(opt.value))}
      getOptionLabel={(option) => option.label}
      onChange={(_, newValue) => {
        const selected = newValue.map((option) => option.value);
        onChange(selected);
      }}
      loading={loading}
      loadingText={loadingText}
      noOptionsText={loading ? loadingText : noOptionsText}
      renderTags={() => null}
      renderOption={(props, option: Option) => {
        const isActive = selectedValues.includes(option.value);

        return (
          <li
            {...props}
            key={String(option.value)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <span>{option.label}</span>

            <Switch
              checked={!isActive}
              onClick={(e) => {
                e.stopPropagation();
                let updated;

                if (isActive) {
                  updated = selectedValues.filter((v) => v !== option.value);
                } else {
                  updated = [...selectedValues, option.value];
                }

                onChange(updated);
              }}
            />
          </li>
        );
      }}
      isOptionEqualToValue={(opt, val) => opt.value === val.value}
      renderInput={renderInput}
      sx={{
        "& .MuiOutlinedInput-root": {
          minHeight: size,
        },
      }}
    />
  );
}
