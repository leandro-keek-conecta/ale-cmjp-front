import {
  Box,
  Button,
  CircularProgress,
  Pagination,
  Typography,
} from "@mui/material";

import {
  ChatBubbleOutline,
  InsertChartOutlined,
  LightbulbOutlined,
  LocationOnOutlined,
  PriorityHigh,
  StarBorderRounded,
  ThermostatOutlined,
} from "@mui/icons-material";

import styles from "./PanoramaPage.module.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CardGrid from "../../components/card-grid";
import CardGridReflect from "../../components/card-grid-reflect";
import CardDetails from "../../components/cardDetails";
import {
  getOpinionsWithFilter,
} from "../../services/opiniao/opiniaoService";
import SlideComponent, { type SlideItem } from "../../components/slide";
import PresentationModal from "../../components/modal";
import { readFromStorage, saveToStorage } from "../../utils/localStorage";
import { ClimaIcon } from "../../icons/Filter";
import { ArrowDown } from "../../icons/arrowDonw";
import Forms from "../../components/Forms";
import {
  getFilterInputs,
  type FilterSelectOptions,
  type SelectOption,
} from "./inputs/inputListFilter";
import { useForm } from "react-hook-form";
import type { FilterFormValues } from "../../types/filter";
import { Layout } from "../../components/layout/Layout";
import {
  getFiltros,
  getMetricas,
} from "../../services/metricas/metricasService";
import { getProjectById } from "../../services/projeto/ProjetoService";
import { useProjectContext } from "@/context/ProjectContext";
import { useProjectRealtime } from "@/hooks/useRealtimeSubscription";
import type { Opinion } from "@/types/opinion";
import {
  panoramaOptions,
  type PanoramaMetricKey,
} from "@/pages/ProjetoThemeTab/inputs/inputs";
import {
  filterOptionsByAllowedThemes,
  getStoredAllowedThemes,
  hasThemeAccess,
  normalizeAccessKey,
} from "@/utils/userProjectAccess";
type FilterApiItem = { label: string; value: string; count?: number };

const DEFAULT_VALUE_KEYS = ["value", "total", "count"] as const;
const MIN_FILTER_LOADING_MS = 1000;
const metricSet = new Set<PanoramaMetricKey>(
  panoramaOptions.map((option) => option.value),
);

const buildFilternDefaultValues = (
  forcedTema?: string | null,
): FilterFormValues => ({
  dataInicio: null,
  dataFim: null,
  tipo: "",
  tema: forcedTema ?? "",
  bairro: "",
  genero: "",
  faixaEtaria: "",
  texto_opiniao: "",
});

const toApiDateValue = (value: Date | string | null | undefined) => {
  if (!value) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return undefined;
};

const toArrayParam = (value: string | null | undefined) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed ? [trimmed] : undefined;
};

type HeroCardConfig = {
  metric: PanoramaMetricKey;
  title: string;
  subtitle: string;
};

type PanoramaThemeConfig = {
  background: string;
  fontFamily: string;
  showHero: boolean;
  kicker: string;
  title: string;
  highlight: string;
  subtitle: string;
  slideBadge: string;
  slideMapTitle: string;
  slideMapSubtitle: string;
  slides: SlideItem[];
  cards: HeroCardConfig[];
  clima: HeroCardConfig;
};

const DEFAULT_PANORAMA_THEME: PanoramaThemeConfig = {
  background: "linear-gradient(180deg, #f4f4f4 0%, #f4f4f4 50%, #f4f4f4 100%)",
  fontFamily: "Poppins",
  showHero: false,
  kicker: "Monitorando a voz da cidade",
  title: "Opinião em",
  highlight: "tempo real",
  subtitle:
    "Veja o que as pessoas estão falando, explore temas e acompanhe como as opiniões evoluem.",
  slideBadge: "Assistente virtual",
  slideMapTitle: "Presença ativa nos bairros",
  slideMapSubtitle: "Participação cidadã descomplicada e eficiente",
  slides: [],
  cards: [
    {
      metric: "opinions_today",
      title: "Opiniões de hoje",
      subtitle: "Total registradas",
    },
    {
      metric: "top_themes",
      title: "Temas mais falados",
      subtitle: "Participação distribuída",
    },
    {
      metric: "top_neighborhoods",
      title: "Bairros mais ativos",
      subtitle: "Participação distribuída",
    },
  ],
  clima: {
    metric: "by_type",
    title: "Clima geral",
    subtitle: "Distribuição das opiniões",
  },
};

const toText = (value: unknown, fallback = "") =>
  typeof value === "string" && value.trim() ? value : fallback;

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toSlideItems = (value: unknown): SlideItem[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const data = asRecord(item);
      const title = toText(data.title);
      const description = toText(data.description);
      const image = toText(data.image);
      if (!title && !description && !image) return null;
      if (!image) return null;
      return {
        title: title || "Slide",
        description,
        image,
      };
    })
    .filter(Boolean) as SlideItem[];
};

const normalizeOptionKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_\s]+/g, " ")
    .trim();

const toOptionalNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const isMetricKey = (value: unknown): value is PanoramaMetricKey =>
  typeof value === "string" && metricSet.has(value as PanoramaMetricKey);

const toChartLabel = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return null;
};

const readNestedValue = (source: unknown, path: string) =>
  path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, source);

const resolveMetricSource = (
  payload: Record<string, unknown>,
  source: string,
) => {
  const nestedValue = readNestedValue(payload, source);
  if (nestedValue !== undefined) {
    return nestedValue;
  }

  if (source.startsWith("summary.")) {
    return readNestedValue(payload, source.slice("summary.".length));
  }

  if (source.startsWith("report.")) {
    return readNestedValue(payload, source.slice("report.".length));
  }

  return undefined;
};

const normalizeMetricList = (data: unknown, labelKeys: string[]) => {
  if (!Array.isArray(data)) return [];

  return data
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;

      const item = entry as Record<string, unknown>;
      const label = labelKeys
        .map((key) => toChartLabel(item[key]))
        .find((value): value is string => Boolean(value));

      if (!label) return null;

      const firstValue =
        DEFAULT_VALUE_KEYS.map((key) => item[key]).find(
          (value) => value !== undefined,
        ) ?? 0;

      return {
        key: normalizeAccessKey(`${label}-${index}`),
        label,
        value: toOptionalNumber(firstValue) ?? 0,
      };
    })
    .filter(
      (item): item is { key: string; label: string; value: number } =>
        item !== null,
    );
};

const getMetricListLabelKeys = (metric: PanoramaMetricKey) => {
  switch (metric) {
    case "top_themes":
      return ["tema", "label", "name", "title"];
    case "top_neighborhoods":
      return ["label", "bairro", "name", "title"];
    case "by_gender":
      return ["label", "gender", "genero", "name", "title"];
    case "by_age":
      return ["label", "ageRange", "faixaEtaria", "name", "title"];
    case "by_type":
      return ["label", "tipo", "tipoOpiniao", "tema", "name", "title"];
    case "by_campaign":
      return ["label", "campaign", "campanha", "name", "title"];
    case "status_funnel":
      return ["label", "status", "name", "title"];
    case "trend_day":
      return ["label", "day", "date", "name", "title"];
    case "trend_month":
      return ["label", "month", "date", "name", "title"];
    default:
      return ["label", "name", "title"];
  }
};

const getMetricFallbackSubtitle = (metric: PanoramaMetricKey) => {
  switch (metric) {
    case "opinions_today":
      return "Total registradas";
    case "top_themes":
    case "top_neighborhoods":
      return "Participação distribuída";
    case "total_opinions":
    case "total_complaints":
    case "total_praise":
    case "total_suggestions":
      return "Acumulado geral";
    case "by_gender":
    case "by_age":
    case "by_type":
      return "Distribuição";
    case "by_campaign":
      return "Aceite";
    case "status_funnel":
      return "Etapas";
    case "trend_day":
      return "Últimos dias";
    case "trend_month":
      return "Últimos meses";
    default:
      return "";
  }
};

const getMetricIcon = (metric?: PanoramaMetricKey | "") => {
  switch (metric) {
    case "top_themes":
    case "top_neighborhoods":
      return <LocationOnOutlined className={styles.statIcon} />;
    case "status_funnel":
      return <ThermostatOutlined className={styles.statIcon} />;
    case "by_gender":
    case "by_age":
    case "by_type":
    case "by_campaign":
      return <ChatBubbleOutline className={styles.statIcon} />;
    default:
      return <InsertChartOutlined className={styles.statIcon} />;
  }
};

const getMetricCardSpan = (count: number) => {
  if (count <= 1) return 12;
  if (count === 2) return 6;
  if (count === 3) return 4;
  if (count === 4) return 3;
  return 2;
};

const formatMetricChip = (label: string, value: number) =>
  value > 0 ? `${label} (${value})` : label;

const normalizeOpinionsFromForms = (value: unknown): Opinion[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((entry) => {
      if (!entry || typeof entry !== "object") {
        return [];
      }

      const data = entry as Record<string, unknown>;
      return Array.isArray(data.responses) ? (data.responses as Opinion[]) : [];
    })
    .filter(Boolean);
};

const scopeOpinionsByThemes = (
  opinions: Opinion[],
  allowedThemes: string[],
) => {
  if (!allowedThemes.length) {
    return opinions;
  }

  return opinions.filter((response) =>
    hasThemeAccess(response.opiniao ?? "", allowedThemes),
  );
};

export default function Panorama() {
  const PRESENTATION_SEEN_KEY = "home:presentationSeen";
  const { projectId: selectedProjectId } = useProjectContext();
  const allowedThemes = useMemo(
    () => getStoredAllowedThemes(selectedProjectId),
    [selectedProjectId],
  );
  const autoSelectedTheme = allowedThemes.length === 1 ? allowedThemes[0] : "";
  const hideTemaFilter = autoSelectedTheme.length > 0;
  const [panoramaTheme, setPanoramaTheme] = useState<PanoramaThemeConfig>(
    DEFAULT_PANORAMA_THEME,
  );
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [metricsPayload, setMetricsPayload] = useState<Record<string, unknown>>(
    {},
  );
  const [filterSelectOptions, setFilterSelectOptions] = useState<
    Partial<FilterSelectOptions>
  >({});
  const [activeFilterValues, setActiveFilterValues] = useState<FilterFormValues>(
    () => buildFilternDefaultValues(autoSelectedTheme || null),
  );
  const [error, setError] = useState("");
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [itensPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(5);
  const [showPresentationModal, setShowPresentationModal] = useState<boolean>(
    () => !readFromStorage<boolean>(PRESENTATION_SEEN_KEY, false),
  );
  const heroTitleRef = useRef<HTMLSpanElement | null>(null);
  const [heroCopyWidth, setHeroCopyWidth] = useState<number | null>(null);
  const filterLoadingTimeoutRef = useRef<number | null>(null);
  /*   const navigate = useNavigate(); */
  const mapSelectOptions = (
    items: FilterApiItem[] | undefined,
  ): SelectOption<string>[] =>
    Array.isArray(items)
      ? items.reduce<SelectOption<string>[]>((accumulator, item) => {
          const label =
            typeof item?.label === "string" ? item.label.trim() : "";
          const value =
            typeof item?.value === "string" ? item.value.trim() : "";
          if (!label || !value) return accumulator;

          const key = normalizeOptionKey(value) || normalizeOptionKey(label);
          const alreadyExists = accumulator.some(
            (option) =>
              normalizeOptionKey(option.value) === key ||
              normalizeOptionKey(option.label) === key,
          );
          if (alreadyExists) return accumulator;

          accumulator.push({ label, value });
          return accumulator;
        }, [])
      : [];

  function IInicial(currentPage: number, itensPerPage: number) {
    return (currentPage - 1) * itensPerPage;
  }

  function IFinal(currentPage: number, itensPerPage: number) {
    // Removendo o -1 e usando a variável
    return currentPage * itensPerPage;
  }

  const {
    control: filterControl,
    formState: { errors: filterErrors },
    handleSubmit: handleFilterSubmit,
    reset: resetFilterForm,
  } = useForm<FilterFormValues>({
    defaultValues: buildFilternDefaultValues(autoSelectedTheme || null),
  });

  useEffect(() => {
    const defaults = buildFilternDefaultValues(autoSelectedTheme || null);
    setActiveFilterValues(defaults);
    resetFilterForm(defaults);
    setCurrentPage(1);
  }, [autoSelectedTheme, resetFilterForm, selectedProjectId]);

  useEffect(() => {
    return () => {
      if (filterLoadingTimeoutRef.current !== null) {
        window.clearTimeout(filterLoadingTimeoutRef.current);
      }
    };
  }, []);

  const triggerFilterLoading = useCallback(() => {
    if (filterLoadingTimeoutRef.current !== null) {
      window.clearTimeout(filterLoadingTimeoutRef.current);
    }

    setIsApplyingFilters(true);
    filterLoadingTimeoutRef.current = window.setTimeout(() => {
      setIsApplyingFilters(false);
      filterLoadingTimeoutRef.current = null;
    }, MIN_FILTER_LOADING_MS);
  }, []);

  const fetchProjectTheme = useCallback(async () => {
    try {
      const projectId = selectedProjectId;
      if (!projectId) {
        setError("Nenhum projeto vinculado ao usuário.");
        return;
      }

      const project = (await getProjectById(projectId)) as Record<
        string,
        unknown
      > | null;
      if (!project) return;

      const themeConfig = asRecord(project.themeConfig);
      const heroConfig = asRecord(project.heroConfig);
      const copy = asRecord(heroConfig.copy);
      const slide = asRecord(heroConfig.slide);
      const cards = asRecord(heroConfig.cards);
      const clima = asRecord(heroConfig.clima);
      const rawCount = toOptionalNumber(cards.count);
      const configuredItems = Array.isArray(cards.items) ? cards.items : [];
      const cardItems = configuredItems
        .slice(0, rawCount ?? configuredItems.length)
        .map((item) => asRecord(item));
      const nextCards = (
        cardItems.length ? cardItems : DEFAULT_PANORAMA_THEME.cards
      )
        .map((item, index) => {
          const defaultCard =
            DEFAULT_PANORAMA_THEME.cards[index] ??
            DEFAULT_PANORAMA_THEME.cards[
              DEFAULT_PANORAMA_THEME.cards.length - 1
            ];
          const currentCard = asRecord(item);
          const metric = isMetricKey(currentCard.metric)
            ? currentCard.metric
            : (defaultCard?.metric ?? "");

          if (!metric) return null;

          return {
            metric,
            title: toText(currentCard.title, defaultCard?.title ?? ""),
            subtitle: toText(currentCard.subtitle, defaultCard?.subtitle ?? ""),
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      setPanoramaTheme({
        background: toText(
          themeConfig.background,
          DEFAULT_PANORAMA_THEME.background,
        ),
        fontFamily: toText(
          themeConfig.fontFamily,
          DEFAULT_PANORAMA_THEME.fontFamily,
        ),
        showHero:
          typeof heroConfig.showHero === "boolean"
            ? heroConfig.showHero
            : DEFAULT_PANORAMA_THEME.showHero,
        kicker: toText(copy.kicker, DEFAULT_PANORAMA_THEME.kicker),
        title: toText(copy.title, DEFAULT_PANORAMA_THEME.title),
        highlight: toText(copy.highlight, DEFAULT_PANORAMA_THEME.highlight),
        subtitle: toText(copy.subtitle, DEFAULT_PANORAMA_THEME.subtitle),
        slideBadge: toText(slide.badge, DEFAULT_PANORAMA_THEME.slideBadge),
        slideMapTitle: toText(
          slide.mapTitle,
          DEFAULT_PANORAMA_THEME.slideMapTitle,
        ),
        slideMapSubtitle: toText(
          slide.mapSubtitle,
          DEFAULT_PANORAMA_THEME.slideMapSubtitle,
        ),
        slides: toSlideItems(slide.slides),
        cards: nextCards.length ? nextCards : DEFAULT_PANORAMA_THEME.cards,
        clima: {
          metric: isMetricKey(clima.metric)
            ? clima.metric
            : DEFAULT_PANORAMA_THEME.clima.metric,
          title: toText(clima.title, DEFAULT_PANORAMA_THEME.clima.title),
          subtitle: toText(
            clima.subtitle,
            DEFAULT_PANORAMA_THEME.clima.subtitle,
          ),
        },
      });
    } catch (err) {
      console.error("Erro ao carregar configuracao da pagina panorama.", err);
    }
  }, [selectedProjectId]);

  const fetchOpinions = useCallback(async (filterValues?: FilterFormValues) => {
    try {
      const projectId = selectedProjectId;
      if (!projectId) {
        setError("Nenhum projeto vinculado ao usuário.");
        return;
      }

      const resolvedFilters = filterValues ?? activeFilterValues;

      const response = await getOpinionsWithFilter({
        projetoId: projectId,
        start: toApiDateValue(resolvedFilters.dataInicio),
        end: toApiDateValue(resolvedFilters.dataFim),
        tema: toArrayParam(resolvedFilters.tema),
        tipo: toArrayParam(resolvedFilters.tipo),
        genero: toArrayParam(resolvedFilters.genero),
        bairro: toArrayParam(resolvedFilters.bairro),
        faixaEtaria: toArrayParam(resolvedFilters.faixaEtaria),
        busca: toArrayParam(resolvedFilters.texto_opiniao),
        limit: 150,
        offset: 0,
      });

      const normalizedOpinions = normalizeOpinionsFromForms(response);
      setOpinions(scopeOpinionsByThemes(normalizedOpinions, allowedThemes));
    } catch {
      setError("Erro ao carregar opiniões.");
    }
  }, [activeFilterValues, allowedThemes, selectedProjectId]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const projectId = selectedProjectId;
      if (!projectId) {
        setError("Nenhum projeto vinculado ao usuário.");
        return;
      }
      const response = await getFiltros(projectId);
      const payload = response?.data?.data ?? response?.data ?? {};
      setFilterSelectOptions({
        tipo: mapSelectOptions(payload?.tipoOpiniao),
        tema: filterOptionsByAllowedThemes(
          mapSelectOptions(payload?.temas),
          allowedThemes,
        ),
        genero: mapSelectOptions(payload?.genero),
        faixaEtaria: mapSelectOptions(payload?.faixaEtaria),
      });
    } catch (err) {
      console.error("Erro ao carregar filtros.", err);
    }
  }, [allowedThemes, selectedProjectId]);

  const handleGetMetricas = useCallback(async () => {
    const projectId = selectedProjectId;
    if (!projectId) {
      setError("Nenhum projeto vinculado ao usuário.");
      return;
    }
    try {
      const response = await getMetricas(projectId);
      const payload = response?.data?.data ?? response?.data ?? {};
      setMetricsPayload(asRecord(payload));
    } catch (err) {
      console.error("Erro ao carregar metricas do panorama.", err);
      setError("Erro ao carregar metricas.");
    }
  }, [selectedProjectId]);

  /* function getMetricsWithFilters(data: FilterFormValues){
     try {
      const projectId = selectedProjectId;
      if (!projectId) {
        setError("Nenhum projeto vinculado ao usuário.");
        return;
      }

      const response = await getOpinionsWithFilter({
        projetoId: projectId,
        tema: tema,
        tipo: tipo,
        genero: genero,
        bairro: bairro,
        faixaEtaria: faixaEtaria,
        busca: palavraChave,
        limit: 150,
        offset: 0,
      });
  }

  } */

  useProjectRealtime({
    projetoId: selectedProjectId,
    entities: ["form", "formVersion", "formField", "formResponse"],
    debounceMs: 500,
    onChange: (event) => {
      void fetchFilterOptions();
      void fetchOpinions();

      if (event.entity === "formResponse") {
        void handleGetMetricas();
      }
    },
  });

  useEffect(() => {
    void fetchProjectTheme();
    void fetchOpinions(activeFilterValues);
    void handleGetMetricas();
  }, [
    activeFilterValues,
    allowedThemes,
    fetchOpinions,
    fetchProjectTheme,
    handleGetMetricas,
    selectedProjectId,
  ]);

  useEffect(() => {
    void fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    elements.forEach((element) => {
      if (element.classList.contains(styles.revealed)) {
        return;
      }

      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [panoramaTheme.showHero]);

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

  const normalizeText = (value?: string | null) =>
    (value || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

  const totalPages = Math.max(1, Math.ceil(opinions.length / itensPerPage));

  const paginatedOpinions = useMemo(
    () =>
      opinions.slice(
        IInicial(currentPage, itensPerPage),
        IFinal(currentPage, itensPerPage),
      ),
    [opinions, currentPage, itensPerPage],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const renderTypeIcon = (type: string) => {
    const key = normalizeText(type);
    if (key === "reclamacao") return <PriorityHigh fontSize="small" />;
    if (key === "sugestao") return <LightbulbOutlined fontSize="small" />;
    if (key === "elogio") return <StarBorderRounded fontSize="small" />;
    return <ChatBubbleOutline fontSize="small" />;
  };
  const onSubmitUser = useCallback(
    async (data: FilterFormValues) => {
      setActiveFilterValues(data);
      setCurrentPage(1);
      triggerFilterLoading();
    },
    [triggerFilterLoading],
  );

  const handleClearFilters = async () => {
    const defaults = buildFilternDefaultValues(autoSelectedTheme || null);
    setActiveFilterValues(defaults);
    resetFilterForm(defaults);
    setCurrentPage(1);
    triggerFilterLoading();
  };

  const handleApplyFilters = useCallback(() => {
    void handleFilterSubmit(onSubmitUser)();
  }, [handleFilterSubmit, onSubmitUser]);

  const configuredMetricCards = useMemo(
    () => panoramaTheme.cards.filter((card) => Boolean(card.metric)),
    [panoramaTheme.cards],
  );

  const metricCardSpan = getMetricCardSpan(configuredMetricCards.length);

  const resolveMetricDisplay = useCallback(
    (metric?: PanoramaMetricKey | "") => {
      if (!metric) return null;

      const option = panoramaOptions.find((entry) => entry.value === metric);
      if (!option) return null;

      const rawValue = resolveMetricSource(metricsPayload, option.source);
      const numericMetrics = new Set<PanoramaMetricKey>([
        "opinions_today",
        "total_opinions",
        "total_complaints",
        "total_praise",
        "total_suggestions",
      ]);

      if (numericMetrics.has(metric)) {
        return {
          type: "number" as const,
          value: toOptionalNumber(rawValue) ?? 0,
        };
      }

      return {
        type: "list" as const,
        items: normalizeMetricList(rawValue, getMetricListLabelKeys(metric)),
      };
    },
    [metricsPayload],
  );

  const renderMetricCard = (
    card: HeroCardConfig,
    span: number,
    className?: string,
  ) => {
    const option = panoramaOptions.find((entry) => entry.value === card.metric);
    const metricDisplay = resolveMetricDisplay(card.metric);
    const title = (card.title || "").trim() || option?.label || "Métrica";
    const subtitle =
      (card.subtitle || "").trim() ||
      (card.metric ? getMetricFallbackSubtitle(card.metric) : "");
    const isOpinionTypeMetric = card.metric === "by_type";

    return (
      <CardGridReflect
        key={`${card.metric}-${title}`}
        span={span}
        className={`${styles.statCard} ${className ?? ""} ${styles.reveal}`.trim()}
        data-reveal
        style={{ ["--reveal-delay" as any]: "0.12s" }}
      >
        <div className={styles.statHeader}>
          {getMetricIcon(card.metric)}
          <div>
            <div className={styles.statLabel}>{title}</div>
            {subtitle ? (
              <div className={styles.statHint}>{subtitle}</div>
            ) : null}
          </div>
        </div>
        {metricDisplay ? (
          metricDisplay.type === "number" ? (
            <div className={styles.statValue}>{metricDisplay.value}</div>
          ) : metricDisplay.items.length ? (
            isOpinionTypeMetric ? (
              <div className={styles.typeChips}>
                {metricDisplay.items.map((item) => {
                  const typeKey = normalizeText(item.label) || "outro";
                  return (
                    <span
                      key={item.key}
                      className={styles.typeChip}
                      data-type={typeKey}
                      aria-label={`${item.label} (${item.value})`}
                    >
                      <span className={styles.typeIcon}>
                        {renderTypeIcon(item.label)}
                      </span>
                      <span>{item.label}</span>
                      <span className={styles.typeCount}>{item.value}</span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className={styles.districtChips}>
                {metricDisplay.items.map((item) => (
                  <span key={item.key} className={styles.districtChip}>
                    {formatMetricChip(item.label, item.value)}
                  </span>
                ))}
              </div>
            )
          ) : (
            <div className={styles.statEmpty}>Sem dados para esta métrica.</div>
          )
        ) : (
          <div className={styles.statEmpty}>Selecione uma métrica.</div>
        )}
        {error && className?.includes(styles.wideCard) ? (
          <div className={styles.statHint}>{error}</div>
        ) : null}
      </CardGridReflect>
    );
  };

  const handleClosePresentation = () => {
    setShowPresentationModal(false);
    saveToStorage(PRESENTATION_SEEN_KEY, true);
  };

  return (
    <>
      <Layout titulo="Visão Geral">
        <PresentationModal
          open={showPresentationModal}
          onClose={handleClosePresentation}
        />
        <Box
          className={styles.container}
          style={{
            ["--bg" as any]: panoramaTheme.background,
            fontFamily: panoramaTheme.fontFamily,
          }}
        >
          <Box component="header" className={styles.hero}>
            {panoramaTheme.showHero ? (
              <div
                className={styles.reveal}
                data-reveal
                style={{ ["--reveal-delay" as any]: "0s" }}
              >
                <SlideComponent
                  slides={panoramaTheme.slides}
                  badge={panoramaTheme.slideBadge}
                  mapTitle={panoramaTheme.slideMapTitle}
                  mapSubtitle={panoramaTheme.slideMapSubtitle}
                />
              </div>
            ) : null}

            <div
              className={styles.reveal}
              data-reveal
              style={{ ["--reveal-delay" as any]: "0.08s" }}
            >
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
                    {panoramaTheme.kicker}
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
                  {panoramaTheme.title}{" "}
                  <span className={styles.gradientText}>
                    {panoramaTheme.highlight}
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
                {panoramaTheme.subtitle}
              </Typography>
            </div>
            <Box className={styles.statsRow}>
              {configuredMetricCards.map((card) =>
                renderMetricCard(card, metricCardSpan),
              )}
              {renderMetricCard(panoramaTheme.clima, 12, styles.wideCard)}
            </Box>
            {/* Componente de Filtro */}
            <CardGrid
              className={`${styles.searchCard} ${styles.reveal}`}
              span={12}
              data-reveal
              style={{ ["--reveal-delay" as any]: "0.28s" }}
            >
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
                {" "}
                <Forms<FilterFormValues>
                  errors={filterErrors}
                  inputsList={getFilterInputs(filterSelectOptions, {
                    hideTema: hideTemaFilter,
                  })}
                  control={filterControl}
                />{" "}
                <Box className={styles.filterActions}>
                  <Button
                    className={styles.filterButton}
                    type="button"
                    onClick={handleClearFilters}
                    disabled={isApplyingFilters}
                  >
                    Limpar
                  </Button>
                  <Button
                    className={`${styles.filterButton} ${styles.filterButtonPrimary}`}
                    type="button"
                    onClick={handleApplyFilters}
                    disabled={isApplyingFilters}
                    startIcon={
                      isApplyingFilters ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : undefined
                    }
                  >
                    {isApplyingFilters ? "Aplicando..." : "Aplicar Filtros"}
                  </Button>
                </Box>
              </Box>
            </CardGrid>

            <Box
              className={`${styles.opinionsContainer} ${styles.reveal}`}
              data-reveal
              style={{ ["--reveal-delay" as any]: "0.32s" }}
              aria-busy={isApplyingFilters || undefined}
            >
              {isApplyingFilters ? (
                <Box className={styles.opinionsLoadingOverlay}>
                  <CircularProgress size={28} />
                  <Typography component="span" className={styles.loadingLabel}>
                    Aplicando filtros...
                  </Typography>
                </Box>
              ) : null}
              <CardDetails opinions={paginatedOpinions} />
            </Box>
            <Box sx={{ width: "100%" }}>
              <Pagination
                page={currentPage}
                count={totalPages}
                onChange={(_, page) => setCurrentPage(page)}
                disabled={isApplyingFilters}
                size="small"
                siblingCount={0}
                boundaryCount={1}
              />
            </Box>
          </Box>
        </Box>
      </Layout>
    </>
  );
}
