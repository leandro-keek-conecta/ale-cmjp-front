import { Avatar, Box, Button, Card } from "@mui/material";
import styles from "./card.module.css";
import { BarChart } from "@/components/charts/bar/BarChart";
import type { ChartDatum } from "@/types/ChartDatum";
import ChipsCard, { type ThemeChipDatum } from "./chips";

interface CardProjectProps {
  title: string;
  actived?: boolean;
  responsesByMonthLast12Months: ChartDatum[];
  responsesByTheme: ThemeChipDatum[];
  responsesLast7Days?: number;
  onSelect?: () => void;
}

const formatNumber = (value: number) => value.toLocaleString("pt-BR");

export default function CardProject({
  title,
  actived = false,
  responsesByMonthLast12Months,
  responsesByTheme,
  responsesLast7Days = 0,
  onSelect,
}: CardProjectProps) {
  const statusText = actived ? "Ativo" : "Inativo";
  const avatarLetter = title?.trim()?.charAt(0)?.toUpperCase() || "P";

  return (
    <Card className={styles.cardContainer}>
      <Box className={styles.headerCard}>
        <Box className={styles.headerLeft}>
          <Avatar alt="Inicial do Nome do Projeto" className={styles.avatar}>
            {avatarLetter}
          </Avatar>
          <Box className={styles.projectName}>
            <Box className={styles.headerTitle}>{title}</Box>
            <Box className={styles.headerSubtitle}>
              {formatNumber(responsesLast7Days)} mencoes nos ultimos 7 dias
            </Box>
          </Box>
        </Box>

        <Box
          className={`${styles.statusContainer} ${
            actived ? styles.statusActive : styles.statusInactive
          }`}
        >
          <Box className={styles.statusText}>{statusText}</Box>
          <Box className={styles.statusDot} />
        </Box>
      </Box>

      <Box className={styles.bodyCard}>
        <BarChart
          data={responsesByMonthLast12Months}
          height={200}
          loading={false}
        />
      </Box>

      <Box className={styles.footerCard}>
        <Box className={styles.leftFooter}>
          <Box className={styles.footerTitle}>Temas mais falados:</Box>
          <ChipsCard data={responsesByTheme} />
        </Box>
        <Box className={styles.rightFooter}>
          <Button
            variant="contained"
            className={styles.enterButton}
            onClick={onSelect}
            disabled={!onSelect}
          >
            Acessar
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
