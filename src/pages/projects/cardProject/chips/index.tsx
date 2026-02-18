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
const cleanLabel = (label: string) => label.trim().replace(/\s+/g, " ");

const abbreviateWord = (word: string, maxLetters: number) => {
  if (word.length <= maxLetters) return word;
  return `${word.slice(0, maxLetters)}.`;
};

const abbreviateThemeLabel = (label: string) => {
  const normalized = cleanLabel(label);
  if (!normalized) return "";

  const words = normalized.split(" ");

  if (words.length >= 2) {
    return `${abbreviateWord(words[0], 4)} ${abbreviateWord(words[1], 4)}`;
  }

  return abbreviateWord(words[0], 9);
};

export default function ChipsCard({ data, maxItems = 5 }: ChipsCardProps) {
  const items = Array.isArray(data) ? data.slice(0, maxItems) : [];

  if (!items.length) {
    return <Box className={styles.emptyState}>Sem temas com dados no momento.</Box>;
  }

  return (
    <Box className={styles.container}>
      {items.map((item, index) => {
        const originalLabel = cleanLabel(item.label);
        const shortLabel = abbreviateThemeLabel(item.label);

        return (
          <Box
            className={styles.chip}
            key={`${item.label}-${index}`}
            title={originalLabel}
            aria-label={`${originalLabel}: ${formatNumber(item.value)}`}
          >
            <Box className={styles.iconWrap}>
              <EmojiObjectsOutlinedIcon className={styles.icon} />
            </Box>
            <Box className={styles.label}>{shortLabel}:</Box>
            <Box className={styles.value}>{formatNumber(item.value)}</Box>
          </Box>
        );
      })}
    </Box>
  );
}
