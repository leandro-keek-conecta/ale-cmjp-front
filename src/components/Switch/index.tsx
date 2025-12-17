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
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(_, value) => onChange(value)}
            color="primary"
          />
        }
        label={label}
      />
      {helperText ? (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      ) : null}
    </Box>
  );
}
