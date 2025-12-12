import * as React from "react";
import { styled } from "@mui/material/styles";
import { Box, TextField } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const VisuallyHiddenInput = styled("input")({
  position: "absolute",
  opacity: 0,
  width: 0,
  height: 0,
});

interface InputFileProps {
  label?: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
}

export default function InputFile({
  label = "Arquivo",
  placeholder = "Selecione um arquivo",
  onChange,
  error = false,
  helperText = "",
}: InputFileProps) {
  const [fileName, setFileName] = React.useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      setFileName(file.name); // Atualiza o nome do arquivo selecionado
    }
    onChange?.(event); // Dispara o evento onChange
  };

  return (
    <Box>
      <TextField
        label={label}
        placeholder={placeholder}
        variant="outlined"
        value={fileName} // Exibe o nome do arquivo selecionado
        onClick={() => document.getElementById("file-input")?.click()} // Abre o seletor de arquivos ao clicar
        InputProps={{
          endAdornment: (
            <CloudUploadIcon
              sx={{
                cursor: "pointer",
                marginLeft: 1,
              }}
              onClick={() => document.getElementById("file-input")?.click()} // Abre o seletor de arquivos
            />
          ),
        }}
        error={error}
        helperText={helperText}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: "45px", // Altura do input
          },
          "& .MuiInputBase-input": {
            padding: "12px 14px",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          },
        }}
      />
      <VisuallyHiddenInput
        id="file-input"
        type="file"
        onChange={handleFileChange}
      />
    </Box>
  );
}
