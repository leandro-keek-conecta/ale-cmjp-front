import { TextField } from "@mui/material";
import { useMediaQuery } from "@mui/material"; // Importa o hook
import { buildThemedInputSx } from "@/utils/formTheme";

interface InputTextProps {
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "email" | "password" | "Date" | "inputFile"; // Tipos de input
  value?: string | number; // Valor do input
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Manipulador de evento
  error?: boolean; // Indica se há erro
  helperText?: string; // Mensagem de erro ou ajuda
  className?: string;
  required?: boolean;
  inputProps?: Record<string, unknown>;
}

export default function InputText({
  label,
  placeholder = "",
  type = "text",
  value,
  onChange,
  error = false,
  helperText = "",
  className,
  required = false,
  inputProps,
}: InputTextProps) {
  const isMobile = useMediaQuery("(max-width:768px)");
  const size = isMobile ? "2.6rem" : "2.6rem";
  return (
    <TextField
      label={label}
      variant="outlined"
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      required={required}
      className={className}
      fullWidth
      inputProps={inputProps}
      InputLabelProps={{
        shrink: true,
      }}
      sx={buildThemedInputSx({ height: size })}
    />
  );
}
