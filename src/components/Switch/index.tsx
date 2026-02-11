import { FormControlLabel, FormHelperText, Switch, Box } from "@mui/material";

type SwitchFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: boolean;
  helperText?: string;
};

export default function SwitchField({
  label,
  checked,
  onChange,
  error = false,
  helperText,
}: SwitchFieldProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          minHeight: "32px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <FormControlLabel
          sx={{
            width: "100%",
            margin: 0,
            display: "flex",
            justifyContent: "space-between",
          }}
          labelPlacement="start"
          control={
            <Switch
              checked={checked}
              onChange={(_, value) => onChange(value)}
              color="primary"
            />
          }
          label={label}
        />
      </Box>
      {helperText ? (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      ) : null}
    </Box>
  );
}
