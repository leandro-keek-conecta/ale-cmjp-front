import * as React from "react";
import { styled } from "@mui/material/styles";
import { Box, TextField } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { buildThemedInputSx } from "@/utils/formTheme";

const VisuallyHiddenInput = styled("input")({
  position: "absolute",
  opacity: 0,
  width: 0,
  height: 0,
});

interface InputFileProps {
  label?: string;
  placeholder?: string;
  value?: string | FileList | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
}

const getDisplayFileName = (value?: string | FileList | null) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }

    try {
      const url = new URL(trimmed);
      const pathSegments = url.pathname.split("/").filter(Boolean);
      return decodeURIComponent(pathSegments[pathSegments.length - 1] ?? trimmed);
    } catch {
      return trimmed;
    }
  }

  if (value?.length) {
    return value[0]?.name ?? "";
  }

  return "";
};

export default function InputFile({
  label = "Arquivo",
  placeholder = "Selecione um arquivo",
  value,
  onChange,
  error = false,
  helperText = "",
}: InputFileProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const fileName = React.useMemo(() => getDisplayFileName(value), [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
  };

  return (
    <Box>
      <TextField
        label={label}
        placeholder={placeholder}
        variant="outlined"
        value={fileName}
        onClick={() => inputRef.current?.click()}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <CloudUploadIcon
              sx={{
                cursor: "pointer",
                marginLeft: 1,
              }}
              onClick={() => inputRef.current?.click()}
            />
          ),
        }}
        error={error}
        helperText={helperText}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        sx={buildThemedInputSx({
          height: "45px",
          fontWeight: 500,
          cursor: "pointer",
        })}
      />
      <VisuallyHiddenInput
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={inputRef}
      />
    </Box>
  );
}
