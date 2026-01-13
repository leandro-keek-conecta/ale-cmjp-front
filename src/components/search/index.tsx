import { Autocomplete, TextField } from "@mui/material";

interface SearchProps {
  opiniao: string[];
  onSearchChange?: (value: string) => void;
  placeholder?: string;
}

export default function Search({
  opiniao,
  onSearchChange,
  placeholder,
}: SearchProps) {
  return (
    <Autocomplete
      freeSolo
      options={opiniao}
      fullWidth
      disablePortal={false}
      slotProps={{
        popper: { sx: { zIndex: 2000 } },
      }}
      onInputChange={(_, value) => onSearchChange?.(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Opinioes"
          placeholder={placeholder}
          InputLabelProps={{ shrink: true }}
          aria-label="Buscar opinioes"
        />
      )}
    />
  );
}
