import { Avatar, Box, Button, Card } from "@mui/material";
import styles from "./card.module.css";
import { BarChart } from "@/components/charts/bar/BarChart";
import type { ChartDatum } from "@/types/ChartDatum";
import { type ThemeChipDatum } from "./chips";
import { useEffect, useRef, useState } from "react";

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
  responsesLast7Days = 0,
  onSelect,
}: CardProjectProps) {
  const statusText = actived ? "Ativo" : "Inativo";
  const avatarLetter = title?.trim()?.charAt(0)?.toUpperCase() || "P";
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [chartHeight, setChartHeight] = useState(180);

  useEffect(() => {
    const node = bodyRef.current;
    if (!node) {
      return;
    }

    const updateHeight = (height: number) => {
      const next = Math.max(120, Math.floor(height - 8));
      setChartHeight((prev) => (prev === next ? prev : next));
    };

    updateHeight(node.getBoundingClientRect().height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateHeight(entry.contentRect.height);
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

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
              {formatNumber(responsesLast7Days)} menções nos últimos 7 dias
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

      <Box className={styles.bodyCard} ref={bodyRef}>
        <BarChart
          data={responsesByMonthLast12Months}
          height={chartHeight}
          loading={false}
        />
      </Box>

      <Box className={styles.footerCard}>
        <Box className={styles.leftFooter}>
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
