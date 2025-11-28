import { Chip as MuiChip, type ChipProps } from "@mui/material";

type AppChipProps = ChipProps & {
  label?: React.ReactNode;
};

export default function AppChip({ label = "Example Chip", ...rest }: AppChipProps) {
  return <MuiChip label={label} {...rest} />;
}
