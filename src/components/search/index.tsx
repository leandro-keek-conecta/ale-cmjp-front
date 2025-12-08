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
      disablePortal
      freeSolo
      options={opiniao}
      fullWidth
      onInputChange={(_, value) => onSearchChange?.(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Opinioes"
          placeholder={placeholder}
          aria-label="Buscar opinioes"
        />
      )}
    />
  );
}
