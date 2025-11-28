import { Autocomplete, TextField } from "@mui/material";

interface SearchProps {
  opiniao: string[];
}

export default function Search({opiniao}: SearchProps) {
  return (
    <Autocomplete
      disablePortal
      options={opiniao}
      fullWidth
      renderInput={(params) => <TextField {...params} label="Movie" />}
    />
  );
}
