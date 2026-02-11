import { TextField } from "@mui/material";
import { useMediaQuery } from "@mui/material"; // Importa o hook

interface InputTexProps {
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "email" | "password" | "Date" | "inputFile"; // Tipos de input
  value?: string | number; // Valor do input
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Manipulador de evento
  error?: boolean; // Indica se há erro
  helperText?: string; // Mensagem de erro ou ajuda
  className?: string;
  required?: boolean;
}

export default function InputTex({
  label,
  placeholder = "",
  type = "text",
  value,
  onChange,
  error = false,
  helperText = "",
  className,
  required = false,
}: InputTexProps) {
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
      InputLabelProps={{
        shrink: true,
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: size, // Altura do input
        },
        "& .MuiInputBase-input": {
          padding: "12px 14px",
          borderRadius: "8px",
          fontSize: "0.9rem",
        },
      }}
    />
  );
}
