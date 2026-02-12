import Button from "@/components/Button";
import CardGrid from "@/components/card-grid";
import CardGridReflect from "@/components/card-grid-reflect";
import SlideComponent from "@/components/slide";
import {
  ChatBubbleOutline,
  InsertChartOutlined,
  LightbulbOutlined,
  LocationOnOutlined,
  PriorityHigh,
  StarBorderRounded,
  ThermostatOutlined,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import styles from "./ThemePreview.module.css";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArrowDown } from "@/icons/arrowDonw";
import { ClimaIcon } from "@/icons/Filter";
import Forms from "@/components/Forms";
import { mapFilterFormToState } from "@/utils/createDynamicFilter";
import type { FilterFormValues, FiltersState } from "@/types/filter";
import { useForm } from "react-hook-form";
import {
  getFilterInputs,
  type FilterSelectOptions,
} from "@/pages/Panorama/inputs/inputListFilter";
import { panoramaOptions, type PanoramaMetricKey } from "../inputs/inputs";

export type ThemePreviewSettings = {
  background?: string;
  kicker?: string;
  title?: string;
  highlight?: string;
  highlightTone?: "primary" | "accent" | "gradient";
  subtitle?: string;
  fontFamily?: string;
};

export type ThemeMetricMocks = {
  groupOpinions?: { id: number | string; tema: string; total: number }[];
};

export type ThemeMetricCard = {
  id: string | number;
  metric?: PanoramaMetricKey | "";
  title?: string;
  subtitle?: string;
};

type ThemePreviewProps = {
  settings?: ThemePreviewSettings;
  metricCards?: ThemeMetricCard[];
  mockMetrics?: ThemeMetricMocks;
  showHeroSlide?: boolean;
};

const buildFilternDefaultValues = (): FilterFormValues => ({
  dataInicio: null,
  dataFim: null,
  tipo: "",
  tema: "",
  bairro: "",
  genero: "",
  faixaEtaria: "",
  texto_opiniao: "",
});

export default function ThemePreview({
  settings,
  metricCards,
  mockMetrics,
  showHeroSlide = true,
}: ThemePreviewProps) {
  const heroTitleRef = useRef<HTMLSpanElement | null>(null);
  const [heroCopyWidth, setHeroCopyWidth] = useState<number | null>(null);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [error, setError] = useState("");
  const [groupOpinions, setGroupOpinions] = useState<
    { id: number; tema: string; total: number }[]
  >([]);
  const [, setFilters] = useState<FiltersState>(() =>
    mapFilterFormToState(buildFilternDefaultValues()),
  );
  const [filterSelectOptions, setFilterSelectOptions] = useState<
    Partial<FilterSelectOptions>
  >({});
  const {
    control: filterControl,
    formState: { errors: filterErrors },
    handleSubmit: handleFilterSubmit,
    reset: resetFilterForm,
  } = useForm<FilterFormValues>({
    defaultValues: buildFilternDefaultValues(),
  });

  const handleClearFilters = () => {
    const defaults = buildFilternDefaultValues();
    resetFilterForm(defaults);
    setFilters(mapFilterFormToState(defaults));
  };

  const resolvedSettings = settings ?? {};
  const heroKicker = resolvedSettings.kicker || "Monitorando a voz da cidade";
  const heroTitle = resolvedSettings.title || "Opiniao em";
  const heroHighlight = resolvedSettings.highlight || "tempo real";
  const heroSubtitle =
    resolvedSettings.subtitle ||
    "Veja o que as pessoas estao falando, explore temas e acompanhe como as opinioes evoluem.";
  const highlightTone = resolvedSettings.highlightTone || "gradient";
  const highlightColor =
    highlightTone === "accent" ? "var(--accent)" : "var(--accent-2)";
  const useGradient = highlightTone === "gradient";
  const showHero = showHeroSlide !== false;

  const appliedGroupOpinions = mockMetrics?.groupOpinions ?? groupOpinions;
  const defaultMetricCards: ThemeMetricCard[] = [
    {
      id: "card-1",
      metric: "opinions_today",
      title: "Opiniões de hoje",
      subtitle: "Total registradas",
    },
    {
      id: "card-2",
      metric: "top_themes",
      title: "Temas mais falados",
      subtitle: "Participação distribuída",
    },
    {
      id: "card-3",
      metric: "top_neighborhoods",
      title: "Bairros mais ativos",
      subtitle: "Participação distribuída",
    },
  ];

  const resolvedMetricCards =
    metricCards && metricCards.length ? metricCards : defaultMetricCards;

  const metricMocks: Record<
    PanoramaMetricKey,
    {
      type: "number" | "list";
      value: number | string[];
      subtitle: string;
      icon: ReactNode;
    }
  > = {
    opinions_today: {
      type: "number",
      value: 128,
      subtitle: "Total registradas",
      icon: <InsertChartOutlined className={styles.statIcon} />,
    },
    top_themes: {
      type: "list",
      value: ["Educação", "Saúde", "Mobilidade", "Segurança", "Infraestrutura"],
      subtitle: "Participação distribuída",
      icon: <LocationOnOutlined className={styles.statIcon} />,
    },
    top_neighborhoods: {
      type: "list",
      value: ["Centro", "Norte", "Sul", "Leste", "Oeste"],
      subtitle: "Participação distribuída",
      icon: <LocationOnOutlined className={styles.statIcon} />,
    },
    total_opinions: {
      type: "number",
      value: 4520,
      subtitle: "Acumulado geral",
      icon: <InsertChartOutlined className={styles.statIcon} />,
    },
    total_complaints: {
      type: "number",
      value: 920,
      subtitle: "Acumulado geral",
      icon: <InsertChartOutlined className={styles.statIcon} />,
    },
    total_praise: {
      type: "number",
      value: 640,
      subtitle: "Acumulado geral",
      icon: <InsertChartOutlined className={styles.statIcon} />,
    },
    total_suggestions: {
      type: "number",
      value: 310,
      subtitle: "Acumulado geral",
      icon: <InsertChartOutlined className={styles.statIcon} />,
    },
    by_gender: {
      type: "list",
      value: ["Feminino 52%", "Masculino 45%", "Outros 3%"],
      subtitle: "Distribuição",
      icon: <ChatBubbleOutline className={styles.statIcon} />,
    },
    by_age: {
      type: "list",
      value: ["18-24 22%", "25-34 31%", "35-44 20%", "45+ 27%"],
      subtitle: "Distribuição",
      icon: <ChatBubbleOutline className={styles.statIcon} />,
    },
    by_type: {
      type: "list",
      value: ["Reclamação 38%", "Sugestão 27%", "Elogio 21%", "Outros 14%"],
      subtitle: "Distribuição",
      icon: <ChatBubbleOutline className={styles.statIcon} />,
    },
    by_campaign: {
      type: "list",
      value: ["Campanha A 58%", "Campanha B 32%", "Outras 10%"],
      subtitle: "Aceite",
      icon: <ChatBubbleOutline className={styles.statIcon} />,
    },
    status_funnel: {
      type: "list",
      value: ["Recebidas 1200", "Em análise 640", "Concluídas 360"],
      subtitle: "Etapas",
      icon: <ThermostatOutlined className={styles.statIcon} />,
    },
    trend_day: {
      type: "list",
      value: ["Hoje 128", "Ontem 96", "Anteontem 84"],
      subtitle: "Últimos dias",
      icon: <InsertChartOutlined className={styles.statIcon} />,
    },
    trend_month: {
      type: "list",
      value: ["Jan 920", "Fev 860", "Mar 980"],
      subtitle: "Últimos meses",
      icon: <InsertChartOutlined className={styles.statIcon} />,
    },
  };

  const getMetricMeta = (metric?: PanoramaMetricKey | "") => {
    if (!metric) return null;
    const meta = metricMocks[metric];
    if (!meta) return null;
    const label =
      panoramaOptions.find((option) => option.value === metric)?.label ?? metric;
    return { ...meta, label };
  };

  const getCardSpan = (count: number) => {
    if (count <= 1) return 12;
    if (count === 2) return 6;
    if (count === 3) return 4;
    if (count === 4) return 3;
    return 2;
  };
  const metricCardSpan = getCardSpan(resolvedMetricCards.length);

  const containerStyle: CSSProperties = {
    ...(resolvedSettings.background?.trim()
      ? { background: resolvedSettings.background }
      : {}),
    ...(resolvedSettings.fontFamily?.trim()
      ? { fontFamily: resolvedSettings.fontFamily }
      : {}),
  };

  const normalizeText = (value?: string | null) =>
    (value || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
  const renderTypeIcon = (type: string) => {
    const key = normalizeText(type);
    if (key === "reclamacao") return <PriorityHigh fontSize="small" />;
    if (key === "sugestao") return <LightbulbOutlined fontSize="small" />;
    if (key === "elogio") return <StarBorderRounded fontSize="small" />;
    return <ChatBubbleOutline fontSize="small" />;
  };
  async function onSubmitUser(data: FilterFormValues) {
    setFilters(mapFilterFormToState(data));
  }

  useEffect(() => {
    const element = heroTitleRef.current;
    if (!element) return;

    const updateWidth = () => {
      const width = element.getBoundingClientRect().width;
      setHeroCopyWidth(width ? Math.ceil(width) : null);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <Box className={styles.container} style={containerStyle}>
      <Box component="header" className={styles.hero}>
        {showHero ? (
          <>
            <div>
              <SlideComponent />
            </div>
          </>
        ) : null}
        <div>
          <Box className={styles.heroTop}>
            <CardGrid span={12} className={styles.heroPill}>
              <Typography
                sx={{
                  fontSize: "13px",
                  letterSpacing: "0.04em",
                  textAlign: "center",
                  color: "var(--accent-2)",
                  width: "100%",
                  fontWeight: 600,
                }}
              >
                {heroKicker}
              </Typography>
            </CardGrid>
          </Box>

          <Typography
            variant="h3"
            sx={{ fontWeight: "bold", mt: 2, mb: 1, color: "var(--text)" }}
          >
            <span
              ref={heroTitleRef}
              style={{ display: "inline-block", maxWidth: "100%" }}
            >
              {heroTitle}{" "}
                  <span
                    className={useGradient ? styles.gradientText : undefined}
                    style={
                      useGradient
                        ? undefined
                        : {
                            background: "none",
                            WebkitTextFillColor: highlightColor,
                            color: highlightColor,
                          }
                    }
                  >
                    {heroHighlight}
                  </span>
            </span>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 1,
              color: "var(--muted)",
              maxWidth: heroCopyWidth ? `${heroCopyWidth}px` : "100%",
            }}
          >
            {heroSubtitle}
          </Typography>
        </div>
        <Box className={styles.statsRow}>
          {resolvedMetricCards.map((card) => {
            const meta = getMetricMeta(card.metric);
            const title = (card.title || "").trim() || meta?.label || "Metrica";
            const subtitle = (card.subtitle || "").trim() || meta?.subtitle || "";
            const listItems =
              meta?.type === "list" && Array.isArray(meta.value) ? meta.value : [];

            return (
              <CardGridReflect
                key={card.id}
                span={metricCardSpan}
                className={styles.statCard}
              >
                <div className={styles.statHeader}>
                  {meta?.icon ?? (
                    <InsertChartOutlined className={styles.statIcon} />
                  )}
                  <div>
                    <div className={styles.statLabel}>{title}</div>
                    {subtitle ? (
                      <div className={styles.statHint}>{subtitle}</div>
                    ) : null}
                  </div>
                </div>
                {meta ? (
                  meta.type === "list" ? (
                    listItems.length ? (
                      <div className={styles.districtChips}>
                        {listItems.map((item, index) => (
                          <span
                            key={`${card.id}-item-${index}`}
                            className={styles.districtChip}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.statEmpty}>Sem dados de hoje.</div>
                    )
                  ) : (
                    <div className={styles.statValue}>{meta.value}</div>
                  )
                ) : (
                  <div className={styles.statEmpty}>Selecione uma metrica.</div>
                )}
              </CardGridReflect>
            );
          })}

          {/* Clima Geral */}
          <CardGridReflect
            span={12}
            className={`${styles.statCard} ${styles.wideCard}`}
          >
            <Box className={styles.climaCard}>
              <div className={styles.statHeader}>
                <ThermostatOutlined className={styles.statIcon} />
                <Box>
                  <div className={styles.statLabel}>Clima geral</div>
                  <div className={styles.statHint}>
                    Distribuição das opiniões
                  </div>
                </Box>
              </div>
              <div className={styles.typeChips}>
                {appliedGroupOpinions.map(({ id, tema, total }) => {
                  const typeKey = normalizeText(tema) || "outro";
                  return (
                    <span
                      key={typeKey || id}
                      className={styles.typeChip}
                      data-type={typeKey}
                      aria-label={`${tema} (${total})`}
                    >
                      <span className={styles.typeIcon}>
                        {renderTypeIcon(tema)}
                      </span>
                      <span>{tema}</span>
                      <span className={styles.typeCount}>{total}</span>
                    </span>
                  );
                })}
              </div>
              {error ? <div className={styles.statHint}>{error}</div> : null}
            </Box>
          </CardGridReflect>
        </Box>
        {/* Componente de Filtro */}
        <CardGrid className={styles.searchCard} span={12}>
          <Box className={styles.searchContainer}>
            <Box className={styles.headerSearch}>
              <Box className={styles.statHeader}>
                <ClimaIcon />
                <Box>
                  <Box className={styles.statLabel}>Filtros</Box>
                </Box>
              </Box>
            </Box>
            <Box onClick={() => setFilterExpanded(!filterExpanded)}>
              <ArrowDown />
            </Box>
          </Box>
          <Box
            className={`${styles.filterContainerBody} ${
              filterExpanded ? styles.expanded : ""
            }`}
          >
            <Forms<FilterFormValues>
              errors={filterErrors}
              inputsList={getFilterInputs(filterSelectOptions)}
              control={filterControl}
            />{" "}
            <Box className={styles.filterActions}>
              <Button
                className={styles.filterButton}
                type="button"
                onClick={handleClearFilters}
              >
                Limpar
              </Button>
              <Button
                className={`${styles.filterButton} ${styles.filterButtonPrimary}`}
                type="button"
                onClick={handleFilterSubmit(onSubmitUser)}
              >
                Aplicar Filtros
              </Button>
            </Box>
          </Box>
        </CardGrid>
      </Box>
    </Box>
  );
}

