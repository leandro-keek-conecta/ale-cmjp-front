import { TextField } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

interface TextAreaProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  helperText?: string;
  error?: boolean;
  minRows?: number;
  maxRows?: number;
}

export default function TextArea({
  label,
  placeholder = "",
  value,
  onChange,
  helperText = "",
  error = false,
  minRows = 2 ,
  maxRows = 6,
}: TextAreaProps) {
  const isMobile = useMediaQuery("(max-width:768px)");
  const fontSize = isMobile ? "1rem" : "1rem";

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      helperText={helperText}
      error={error}
      fullWidth
      multiline
      minRows={minRows}
      maxRows={maxRows}
      InputLabelProps={{ shrink: true }}
      sx={{
        "& .MuiInputBase-root": {
          fontSize,
        },
        "& .MuiInputBase-input": {
          padding: "2px 0px",
        },
      }}
    />
  );
}
