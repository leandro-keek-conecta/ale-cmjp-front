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
  type PanoramaMetricKey,
} from "./inputs/inputs";
import ExpandableCard from "@/components/expandable-card";
import {
  getProjectById,
  updateProject,
} from "@/services/projeto/ProjetoService";
import { getStoredProjectId } from "@/utils/project";
import type Projeto from "@/types/IProjetoType";

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
    handleSubmit,
    reset,
  } = useForm<ThemeFormValues>({
    defaultValues,
    mode: "onChange",
  });

  const formValues = useWatch({ control }) || defaultValues;
  const showHero = formValues.showHero !== false;
  const cardsCount = Math.min(
    6,
    Math.max(1, toNumber(formValues.cardsCount, 3)),
  );

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
  const climaMetric = formValues.clima_metric;

  const slideInputsList = useMemo(
    () => getSlideInputs({ showHero, includeHero: heroInputsMounted }),
    [showHero, heroInputsMounted],
  );

  const themeInputsList = useMemo(
    () =>
      getThemeInputs({
        selectedMetrics,
        climaMetric,
        cardsCount,
      }),
    [selectedMetrics, climaMetric, cardsCount],
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
      slideBadge: formValues.slideBadge,
      slideMapTitle: formValues.slideMapTitle,
      slideMapSubtitle: formValues.slideMapSubtitle,
      slide1_title: formValues.slide1_title,
      slide1_description: formValues.slide1_description,
      slide1_image: formValues.slide1_image,
      slide2_title: formValues.slide2_title,
      slide2_description: formValues.slide2_description,
      slide2_image: formValues.slide2_image,
      slide3_title: formValues.slide3_title,
      slide3_description: formValues.slide3_description,
      slide3_image: formValues.slide3_image,
    }),
    [
      formValues.background,
      formValues.kicker,
      formValues.title,
      formValues.highlight,
      formValues.highlightTone,
      formValues.subtitle,
      formValues.fontFamily,
      formValues.slideBadge,
      formValues.slideMapTitle,
      formValues.slideMapSubtitle,
      formValues.slide1_title,
      formValues.slide1_description,
      formValues.slide1_image,
      formValues.slide2_title,
      formValues.slide2_description,
      formValues.slide2_image,
      formValues.slide3_title,
      formValues.slide3_description,
      formValues.slide3_image,
    ],
  );

  const metricCards = cardValues.slice(0, cardsCount).map((card, index) => {
    const fallbackLabel =
      panoramaOptions.find((option) => option.value === card.metric)?.label ??
      "";
    return {
      id: `card-${index + 1}`,
      metric: card.metric,
      title: card.title || fallbackLabel,
      subtitle: card.subtitle,
    };
  });

  const climaFallbackLabel =
    panoramaOptions.find((option) => option.value === formValues.clima_metric)
      ?.label ?? "";
  const climaCard = {
    id: "clima-card",
    metric: formValues.clima_metric,
    title: formValues.clima_title || climaFallbackLabel || "Clima geral",
    subtitle: formValues.clima_subtitle,
  };

  const buildPayload = (data: ThemeFormValues) => {
    const toText = (value: unknown): string =>
      typeof value === "string" ? value : "";
    const cardsCount = Math.min(6, Math.max(1, toNumber(data.cardsCount, 3)));
    const cardFields = [
      {
        metric: data.card1_metric,
        title: data.card1_title,
        subtitle: data.card1_subtitle,
      },
      {
        metric: data.card2_metric,
        title: data.card2_title,
        subtitle: data.card2_subtitle,
      },
      {
        metric: data.card3_metric,
        title: data.card3_title,
        subtitle: data.card3_subtitle,
      },
      {
        metric: data.card4_metric,
        title: data.card4_title,
        subtitle: data.card4_subtitle,
      },
      {
        metric: data.card5_metric,
        title: data.card5_title,
        subtitle: data.card5_subtitle,
      },
      {
        metric: data.card6_metric,
        title: data.card6_title,
        subtitle: data.card6_subtitle,
      },
    ];
    const cards = cardFields.slice(0, cardsCount).map((card) => ({
      metric: toText(card.metric),
      title: toText(card.title),
      subtitle: toText(card.subtitle),
    }));

    const slides = data.showHero
      ? [
          {
            title: data.slide1_title,
            description: data.slide1_description,
            image: data.slide1_image,
          },
          {
            title: data.slide2_title,
            description: data.slide2_description,
            image: data.slide2_image,
          },
          {
            title: data.slide3_title,
            description: data.slide3_description,
            image: data.slide3_image,
          },
        ].map((slide) => {
          const image = toText(slide.image);
          return {
            title: toText(slide.title),
            description: toText(slide.description),
            ...(image ? { image } : {}),
          };
        })
      : [];

    return {
      themeConfig: {
        background: data.background,
        fontFamily: data.fontFamily,
        highlightTone: data.highlightTone,
      },
      heroConfig: {
        showHero: data.showHero,
        copy: {
          kicker: data.kicker,
          title: data.title,
          highlight: data.highlight,
          subtitle: data.subtitle,
        },
        slide: {
          badge: data.slideBadge,
          mapTitle: data.slideMapTitle,
          mapSubtitle: data.slideMapSubtitle,
          slides,
        },
        cards: {
          count: cardsCount,
          items: cards,
        },
        clima: {
          metric: toText(data.clima_metric),
          title: toText(data.clima_title),
          subtitle: toText(data.clima_subtitle),
        },
      },
    };
  };

  useEffect(() => {
    let isMounted = true;
    const metricSet = new Set(panoramaOptions.map((option) => option.value));
    const isMetric = (value: unknown): value is PanoramaMetricKey =>
      typeof value === "string" && metricSet.has(value as PanoramaMetricKey);

    const getText = (value: unknown, fallback: string) =>
      typeof value === "string" && value.trim() ? value : fallback;

    const loadProject = async () => {
      const projectId = getStoredProjectId();
      if (!projectId) {
        return;
      }
      try {
        setLoading(true);
        const project = (await getProjectById(projectId)) as Projeto | null;
        if (!isMounted || !project) {
          return;
        }

        const themeConfig = project.themeConfig ?? {};
        const heroConfig = project.heroConfig ?? {};
        const copy = heroConfig.copy ?? {};
        const slide = heroConfig.slide ?? {};
        const slides = Array.isArray(slide.slides) ? slide.slides : [];
        const cards = heroConfig.cards?.items ?? [];
        const rawCardsCount = heroConfig.cards?.count ?? cards.length;
        const cardsCount = Math.min(
          6,
          Math.max(1, toNumber(rawCardsCount, defaultValues.cardsCount)),
        );

        const nextValues: ThemeFormValues = {
          ...defaultValues,
          showHero:
            typeof heroConfig.showHero === "boolean"
              ? heroConfig.showHero
              : defaultValues.showHero,
          background: getText(themeConfig.background, defaultValues.background),
          fontFamily: getText(themeConfig.fontFamily, defaultValues.fontFamily),
          highlightTone: (themeConfig.highlightTone ??
            defaultValues.highlightTone) as ThemeFormValues["highlightTone"],
          kicker: getText(copy.kicker, defaultValues.kicker),
          title: getText(copy.title, defaultValues.title),
          highlight: getText(copy.highlight, defaultValues.highlight),
          subtitle: getText(copy.subtitle, defaultValues.subtitle),
          slideBadge: getText(slide.badge, defaultValues.slideBadge),
          slideMapTitle: getText(slide.mapTitle, defaultValues.slideMapTitle),
          slideMapSubtitle: getText(
            slide.mapSubtitle,
            defaultValues.slideMapSubtitle,
          ),
          slide1_title: getText(slides[0]?.title, defaultValues.slide1_title),
          slide1_description: getText(
            slides[0]?.description,
            defaultValues.slide1_description,
          ),
          slide1_image: getText(slides[0]?.image, defaultValues.slide1_image),
          slide2_title: getText(slides[1]?.title, defaultValues.slide2_title),
          slide2_description: getText(
            slides[1]?.description,
            defaultValues.slide2_description,
          ),
          slide2_image: getText(slides[1]?.image, defaultValues.slide2_image),
          slide3_title: getText(slides[2]?.title, defaultValues.slide3_title),
          slide3_description: getText(
            slides[2]?.description,
            defaultValues.slide3_description,
          ),
          slide3_image: getText(slides[2]?.image, defaultValues.slide3_image),
          cardsCount,
          card1_metric: isMetric(cards[0]?.metric)
            ? cards[0]?.metric
            : defaultValues.card1_metric,
          card1_title: getText(cards[0]?.title, defaultValues.card1_title),
          card1_subtitle: getText(
            cards[0]?.subtitle,
            defaultValues.card1_subtitle,
          ),
          card2_metric: isMetric(cards[1]?.metric)
            ? cards[1]?.metric
            : defaultValues.card2_metric,
          card2_title: getText(cards[1]?.title, defaultValues.card2_title),
          card2_subtitle: getText(
            cards[1]?.subtitle,
            defaultValues.card2_subtitle,
          ),
          card3_metric: isMetric(cards[2]?.metric)
            ? cards[2]?.metric
            : defaultValues.card3_metric,
          card3_title: getText(cards[2]?.title, defaultValues.card3_title),
          card3_subtitle: getText(
            cards[2]?.subtitle,
            defaultValues.card3_subtitle,
          ),
          card4_metric: isMetric(cards[3]?.metric)
            ? cards[3]?.metric
            : defaultValues.card4_metric,
          card4_title: getText(cards[3]?.title, defaultValues.card4_title),
          card4_subtitle: getText(
            cards[3]?.subtitle,
            defaultValues.card4_subtitle,
          ),
          card5_metric: isMetric(cards[4]?.metric)
            ? cards[4]?.metric
            : defaultValues.card5_metric,
          card5_title: getText(cards[4]?.title, defaultValues.card5_title),
          card5_subtitle: getText(
            cards[4]?.subtitle,
            defaultValues.card5_subtitle,
          ),
          card6_metric: isMetric(cards[5]?.metric)
            ? cards[5]?.metric
            : defaultValues.card6_metric,
          card6_title: getText(cards[5]?.title, defaultValues.card6_title),
          card6_subtitle: getText(
            cards[5]?.subtitle,
            defaultValues.card6_subtitle,
          ),
          clima_metric: isMetric(heroConfig.clima?.metric)
            ? heroConfig.clima?.metric
            : defaultValues.clima_metric,
          clima_title: getText(
            heroConfig.clima?.title,
            defaultValues.clima_title,
          ),
          clima_subtitle: getText(
            heroConfig.clima?.subtitle,
            defaultValues.clima_subtitle,
          ),
        };

        reset(nextValues);
      } catch (error) {
        console.error("Erro ao carregar tema do projeto:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProject();
    return () => {
      isMounted = false;
    };
  }, [defaultValues, reset]);

  const handleSave = async (data: ThemeFormValues) => {
    try {
      setLoading(true);
      const projectId = getStoredProjectId();
      if (!projectId) {
        console.error("Nenhum projeto vinculado ao usuario.");
        return;
      }
      const payload = buildPayload(data);
      console.log("Payload tema:", payload);
      await updateProject(projectId, payload);
    } catch (error) {
      console.error("Erro ao atualizar tema:", error);
    } finally {
      setLoading(false);
    }
  };

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
          </ExpandableCard>
          <Box sx={{ mt: 0 }} className={styles.bottonContainer}>
            <button
              type="button"
              disabled={loading}
              className={styles.button}
              onClick={handleSubmit(handleSave)}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Atualizar"
              )}
            </button>
          </Box>
        </Box>
        <Box className={styles.contentHeight}>
          <ThemePreview
            settings={previewSettings}
            metricCards={metricCards}
            climaCard={climaCard}
            showHeroSlide={showHero}
          />
        </Box>
      </Box>
    </Layout>
  );
}
