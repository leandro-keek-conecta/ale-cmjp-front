import { Box } from "@mui/material";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import styles from "./chips.module.css";

export type ThemeChipDatum = {
  label: string;
  value: number;
};

type ChipsCardProps = {
  data: ThemeChipDatum[];
  maxItems?: number;
};

const formatNumber = (value: number) => value.toLocaleString("pt-BR");

export default function ChipsCard({ data, maxItems = 5 }: ChipsCardProps) {
  const items = Array.isArray(data) ? data.slice(0, maxItems) : [];

  if (!items.length) {
    return <Box className={styles.emptyState}>Sem temas com dados no momento.</Box>;
  }

  return (
    <Box className={styles.container}>
      {items.map((item, index) => (
        <Box className={styles.chip} key={`${item.label}-${index}`}>
          <Box className={styles.iconWrap}>
            <EmojiObjectsOutlinedIcon className={styles.icon} />
          </Box>
          <Box className={styles.label}>{item.label}:</Box>
          <Box className={styles.value}>{formatNumber(item.value)}</Box>
        </Box>
      ))}
    </Box>
  );
}
