import { Layout } from "@/components/layout/Layout";
import { Box, CircularProgress } from "@mui/material";
import styles from "./ProjetoTheme.module.css";
import ThemePreview from "./ThemePreview/ThemePreview";
import Forms from "@/components/Forms";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  buildThemeDefaultValues,
  getSlideInputs,
  getThemeInputs,
  panoramaOptions,
  type ThemeFormValues,
} from "./inputs/inputs";
import ExpandableCard from "@/components/expandable-card";

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function ProjetoThemeTab() {
  const defaultValues = useMemo(() => buildThemeDefaultValues(), []);
  const [loading, setLoading] = useState(false);
  const {
    control,
    formState: { errors },
  } = useForm<ThemeFormValues>({
    defaultValues,
    mode: "onChange",
  });

  const formValues = useWatch({ control }) || defaultValues;
  const showHero = formValues.showHero !== false;
  const cardsCount = Math.min(6, Math.max(1, toNumber(formValues.cardsCount, 3)));

  const [heroInputsMounted, setHeroInputsMounted] = useState(showHero);

  useEffect(() => {
    if (showHero) {
      setHeroInputsMounted(true);
      return;
    }

    const timeout = setTimeout(() => setHeroInputsMounted(false), 280);
    return () => clearTimeout(timeout);
  }, [showHero]);

  const cardValues = [
    {
      metric: formValues.card1_metric,
      title: formValues.card1_title,
      subtitle: formValues.card1_subtitle,
    },
    {
      metric: formValues.card2_metric,
      title: formValues.card2_title,
      subtitle: formValues.card2_subtitle,
    },
    {
      metric: formValues.card3_metric,
      title: formValues.card3_title,
      subtitle: formValues.card3_subtitle,
    },
    {
      metric: formValues.card4_metric,
      title: formValues.card4_title,
      subtitle: formValues.card4_subtitle,
    },
    {
      metric: formValues.card5_metric,
      title: formValues.card5_title,
      subtitle: formValues.card5_subtitle,
    },
    {
      metric: formValues.card6_metric,
      title: formValues.card6_title,
      subtitle: formValues.card6_subtitle,
    },
  ];

  const selectedMetrics = cardValues
    .slice(0, cardsCount)
    .map((card) => card.metric);

  const slideInputsList = useMemo(
    () => getSlideInputs({ showHero, includeHero: heroInputsMounted }),
    [showHero, heroInputsMounted],
  );

  const themeInputsList = useMemo(
    () =>
      getThemeInputs({
        selectedMetrics,
        cardsCount,
      }),
    [selectedMetrics, cardsCount],
  );

  const previewSettings = useMemo(
    () => ({
      background: formValues.background,
      kicker: formValues.kicker,
      title: formValues.title,
      highlight: formValues.highlight,
      highlightTone: formValues.highlightTone,
      subtitle: formValues.subtitle,
      fontFamily: formValues.fontFamily,
    }),
    [
      formValues.background,
      formValues.kicker,
      formValues.title,
      formValues.highlight,
      formValues.highlightTone,
      formValues.subtitle,
      formValues.fontFamily,
    ],
  );

  const metricCards = cardValues.slice(0, cardsCount).map((card, index) => {
    const fallbackLabel =
      panoramaOptions.find((option) => option.value === card.metric)?.label ?? "";
    return {
      id: `card-${index + 1}`,
      metric: card.metric,
      title: card.title || fallbackLabel,
      subtitle: card.subtitle,
    };
  });

  const mockMetrics = useMemo(
    () => ({
      groupOpinions: [
        {
          id: 1,
          tema: "Reclamacao",
          total: toNumber(formValues.climaReclamacao),
        },
        { id: 2, tema: "Sugestao", total: toNumber(formValues.climaSugestao) },
        { id: 3, tema: "Elogio", total: toNumber(formValues.climaElogio) },
        { id: 4, tema: "Outro", total: toNumber(formValues.climaOutro) },
      ],
    }),
    [
      formValues.climaReclamacao,
      formValues.climaSugestao,
      formValues.climaElogio,
      formValues.climaOutro,
    ],
  );

  return (
    <Layout titulo="Tela de Estilização">
      <Box className={styles.container}>
        <Box className={styles.contentLeft}>
          <ExpandableCard
            title="Informações do Slide"
            defaultExpanded
            className={styles.formCard}
          >
            <Forms<ThemeFormValues>
              errors={errors}
              inputsList={slideInputsList}
              control={control}
            />
          </ExpandableCard>

          <ExpandableCard
            title="Informações do Tema"
            defaultExpanded
            className={styles.formCard}
          >
            <Forms<ThemeFormValues>
              errors={errors}
              inputsList={themeInputsList}
              control={control}
            />
            <Box sx={{ mt: 2 }} className={styles.bottonContainer}>
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Atualizar"
                )}
              </button>
            </Box>
          </ExpandableCard>
        </Box>
        <Box className={styles.contentHeight}>
          <ThemePreview
            settings={previewSettings}
            metricCards={metricCards}
            mockMetrics={mockMetrics}
            showHeroSlide={showHero}
          />
        </Box>
      </Box>
    </Layout>
  );
}
