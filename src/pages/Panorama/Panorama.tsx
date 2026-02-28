import { Box, Button, Pagination, Typography } from "@mui/material";

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
import { useEffect, useMemo, useRef, useState } from "react";
import CardGrid from "../../components/card-grid";
import CardGridReflect from "../../components/card-grid-reflect";
import CardDetails from "../../components/cardDetails";
import { getAllOpinions } from "../../services/opiniao/opiniaoService";
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
import {
  applyFilters,
  mapFilterFormToState,
} from "../../utils/createDynamicFilter";
import { useForm } from "react-hook-form";
import type { FilterFormValues, FiltersState } from "../../types/filter";
import { Layout } from "../../components/layout/Layout";
import {
  getFiltros,
  getMetricas,
} from "../../services/metricas/metricasService";
import { getStoredProjectId } from "../../utils/project";
import { getProjectById } from "../../services/projeto/ProjetoService";
import {
  filterOptionsByAllowedThemes,
  getStoredAllowedThemes,
  hasThemeAccess,
  normalizeAccessKey,
} from "@/utils/userProjectAccess";

export type Opinion = {
  id: number | string;
  usuario_id?: number | string;
  nome?: string;
  telefone?: string;
  bairro?: string;
  campanha?: string;
  horario?: string | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  createdAt?: string | null;
  acao?: string;
  opiniao: string;
  outra_opiniao?: string;
  tipo_opiniao?: string;
  texto_opiniao?: string;
};
type FilterApiItem = { label: string; value: string; count?: number };

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

type HeroCardConfig = {
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
  fontFamily: "Inter",
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
    { title: "Opiniões de hoje", subtitle: "Total registradas" },
    { title: "Temas mais falados", subtitle: "Participação distribuída" },
    { title: "Bairros mais ativos", subtitle: "Participação distribuída" },
  ],
  clima: {
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
    .replace(/\s+/g, " ")
    .trim();

const getOpinionDate = (opinion: Opinion) => {
  const rawDate =
    opinion.submittedAt ??
    opinion.startedAt ??
    opinion.createdAt ??
    opinion.horario ??
    null;

  if (!rawDate) {
    return null;
  }

  const parsedDate = new Date(rawDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const isTodayOpinion = (opinion: Opinion) => {
  const date = getOpinionDate(opinion);
  if (!date) {
    return false;
  }

  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const buildTopThemes = (items: Opinion[]) => {
  const grouped = new Map<string, { id: number; tema: string; total: number }>();

  items.forEach((item, index) => {
    const theme = typeof item.opiniao === "string" ? item.opiniao.trim() : "";
    if (!theme) {
      return;
    }

    const key = normalizeAccessKey(theme);
    const current = grouped.get(key);
    if (current) {
      current.total += 1;
      return;
    }

    grouped.set(key, {
      id: index + 1,
      tema: theme,
      total: 1,
    });
  });

  return Array.from(grouped.values())
    .sort((left, right) => right.total - left.total)
    .slice(0, 5);
};

const buildTopDistricts = (items: Opinion[]) => {
  const grouped = new Map<string, { key: string; label: string; value: number }>();

  items.forEach((item) => {
    const district = typeof item.bairro === "string" ? item.bairro.trim() : "";
    if (!district) {
      return;
    }

    const key = normalizeAccessKey(district);
    const current = grouped.get(key);
    if (current) {
      current.value += 1;
      return;
    }

    grouped.set(key, {
      key,
      label: district,
      value: 1,
    });
  });

  return Array.from(grouped.values())
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
};

export default function Panorama() {
  const PRESENTATION_SEEN_KEY = "home:presentationSeen";
  const selectedProjectId = getStoredProjectId();
  const allowedThemes = useMemo(
    () => getStoredAllowedThemes(selectedProjectId),
    [selectedProjectId],
  );
  const [panoramaTheme, setPanoramaTheme] = useState<PanoramaThemeConfig>(
    DEFAULT_PANORAMA_THEME,
  );
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [topDistricts, setTopDistricts] = useState<any[]>([]);
  const [topTemas, setTopTemas] = useState<any[]>([]);
  const [filterSelectOptions, setFilterSelectOptions] = useState<
    Partial<FilterSelectOptions>
  >({});
  const [filters, setFilters] = useState<FiltersState>(() =>
    mapFilterFormToState(buildFilternDefaultValues()),
  );
  const [todayOpinions, setTodayOpinions] = useState<number>(0);
  const [error, setError] = useState("");
  const [filterType] = useState<string>("all");
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [searchTerm] = useState("");
  const [itensPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(5);
  const [showPresentationModal, setShowPresentationModal] = useState<boolean>(
    () => !readFromStorage<boolean>(PRESENTATION_SEEN_KEY, false),
  );
  const [groupOpinions, setGroupOpinions] = useState<
    { id: number; tema: string; total: number }[]
  >([]);
  const hasFetched = useRef(false);
  const heroTitleRef = useRef<HTMLSpanElement | null>(null);
  const [heroCopyWidth, setHeroCopyWidth] = useState<number | null>(null);
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
    defaultValues: buildFilternDefaultValues(),
  });

  async function fetchProjectTheme() {
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
      const cardItems = Array.isArray(cards.items) ? cards.items : [];
      const nextCards = DEFAULT_PANORAMA_THEME.cards.map((defaultCard, index) => {
        const currentCard = asRecord(cardItems[index]);
        return {
          title: toText(currentCard.title, defaultCard.title),
          subtitle: toText(currentCard.subtitle, defaultCard.subtitle),
        };
      });

      setPanoramaTheme({
        background: toText(
          themeConfig.background,
          DEFAULT_PANORAMA_THEME.background,
        ),
        fontFamily: toText(themeConfig.fontFamily, DEFAULT_PANORAMA_THEME.fontFamily),
        showHero:
          typeof heroConfig.showHero === "boolean"
            ? heroConfig.showHero
            : DEFAULT_PANORAMA_THEME.showHero,
        kicker: toText(copy.kicker, DEFAULT_PANORAMA_THEME.kicker),
        title: toText(copy.title, DEFAULT_PANORAMA_THEME.title),
        highlight: toText(copy.highlight, DEFAULT_PANORAMA_THEME.highlight),
        subtitle: toText(copy.subtitle, DEFAULT_PANORAMA_THEME.subtitle),
        slideBadge: toText(slide.badge, DEFAULT_PANORAMA_THEME.slideBadge),
        slideMapTitle: toText(slide.mapTitle, DEFAULT_PANORAMA_THEME.slideMapTitle),
        slideMapSubtitle: toText(
          slide.mapSubtitle,
          DEFAULT_PANORAMA_THEME.slideMapSubtitle,
        ),
        slides: toSlideItems(slide.slides),
        cards: nextCards,
        clima: {
          title: toText(clima.title, DEFAULT_PANORAMA_THEME.clima.title),
          subtitle: toText(clima.subtitle, DEFAULT_PANORAMA_THEME.clima.subtitle),
        },
      });
    } catch (err) {
      console.error("Erro ao carregar configuracao da pagina panorama.", err);
    }
  }

  async function fetchOpinions() {
    try {
      const projectId = selectedProjectId;
      if (!projectId) {
        setError("Nenhum projeto vinculado ao usuário.");
        return;
      }
      const response = await getAllOpinions(projectId);
      setOpinions(response.data.items);
    } catch (err) {
      setError("Erro ao carregar opiniões.");
    }
  }

  async function fetchFilterOptions() {
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
  }

  async function handleGetMetricas() {
    const projectId = selectedProjectId;
    if (!projectId) {
      setError("Nenhum projeto vinculado ao usuário.");
      return;
    }
    const response: any = await getMetricas(projectId);
    setGroupOpinions(response.data.data.topTemas || []);
    console.log("Filtros recebidos:", response.data.data.topTemas);
    setTodayOpinions(response.data.data.totalOpinionsToday || 0);
    setTopDistricts(response.data.data.topBairros || []);
    setTopTemas(response.data.data.topTemas || []);
  }

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProjectTheme();
    fetchFilterOptions();
    fetchOpinions();
  }, [allowedThemes, selectedProjectId]);

  void handleGetMetricas;

  useEffect(() => {
    const scopedOpinions = allowedThemes.length
      ? opinions.filter((opinion) => hasThemeAccess(opinion.opiniao, allowedThemes))
      : opinions;
    const todayScopedOpinions = scopedOpinions.filter(isTodayOpinion);

    setTodayOpinions(todayScopedOpinions.length);
    setTopTemas(buildTopThemes(todayScopedOpinions));
    setGroupOpinions(buildTopThemes(todayScopedOpinions));
    setTopDistricts(buildTopDistricts(todayScopedOpinions));
  }, [allowedThemes, opinions]);

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

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

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

  const normalizeType = (item: Opinion) =>
    normalizeText(item.tipo_opiniao || item.opiniao);

  const sourceOpinions = useMemo(
    () =>
      allowedThemes.length
        ? opinions.filter((opinion) => hasThemeAccess(opinion.opiniao, allowedThemes))
        : opinions,
    [allowedThemes, opinions],
  );

  const filteredByForm = useMemo(
    () => applyFilters<Opinion>(sourceOpinions, filters),
    [sourceOpinions, filters],
  );

  const filteredOpinions = useMemo(() => {
    const term = normalizeText(searchTerm);
    const selectedType = normalizeText(filterType);
    return filteredByForm.filter((item) => {
      const matchesType =
        filterType === "all" || normalizeType(item) === selectedType;
      const matchesSearch =
        !term ||
        [item.nome, item.bairro, item.texto_opiniao, item.opiniao]
          .map(normalizeText)
          .some((value) => value.includes(term));

      return matchesType && matchesSearch;
    });
  }, [filterType, searchTerm, filteredByForm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOpinions.length / itensPerPage),
  );

  const paginatedOpinions = useMemo(
    () =>
      filteredOpinions.slice(
        IInicial(currentPage, itensPerPage),
        IFinal(currentPage, itensPerPage),
      ),
    [filteredOpinions, currentPage, itensPerPage],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const renderTypeIcon = (type: string) => {
    const key = normalizeText(type);
    if (key === "reclamacao") return <PriorityHigh fontSize="small" />;
    if (key === "sugestão") return <LightbulbOutlined fontSize="small" />;
    if (key === "elogio") return <StarBorderRounded fontSize="small" />;
    return <ChatBubbleOutline fontSize="small" />;
  };
  async function onSubmitUser(data: FilterFormValues) {
    setFilters(mapFilterFormToState(data));
  }

  const handleClearFilters = () => {
    const defaults = buildFilternDefaultValues();
    resetFilterForm(defaults);
    setFilters(mapFilterFormToState(defaults));
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
              <CardGridReflect
                span={2}
                className={`${styles.statCard} ${styles.reveal}`}
                data-reveal
                style={{ ["--reveal-delay" as any]: "0.12s" }}
              >
                <div className={styles.statHeader}>
                  <InsertChartOutlined className={styles.statIcon} />
                  <div>
                    <div className={styles.statLabel}>
                      {panoramaTheme.cards[0]?.title}
                    </div>
                    <div className={styles.statHint}>
                      {panoramaTheme.cards[0]?.subtitle}
                    </div>
                  </div>
                </div>
                {/* _________________________________________ */}
                <div className={styles.statValue}>{todayOpinions}</div>
              </CardGridReflect>
              {/* Card 2 */}
              <CardGridReflect
                span={5}
                className={`${styles.statCard} ${styles.reveal}`}
                data-reveal
                style={{ ["--reveal-delay" as any]: "0.12s" }}
              >
                <div className={styles.statHeader}>
                  <LocationOnOutlined className={styles.statIcon} />
                  <div>
                    <div className={styles.statLabel}>
                      {panoramaTheme.cards[1]?.title}
                    </div>
                    <div className={styles.statHint}>
                      {panoramaTheme.cards[1]?.subtitle}
                    </div>
                  </div>
                </div>
                {topTemas.length ? (
                  <div className={styles.districtChips}>
                    {topTemas.map((district: any) => (
                      <span key={district.id} className={styles.districtChip}>
                        {district.tema}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={styles.statEmpty}>Sem dados de hoje.</div>
                )}
                <div className={styles.statHint}>Top 5 temas do dia</div>
              </CardGridReflect>
              {/* Card 3 */}
              <CardGridReflect
                span={5}
                className={`${styles.statCard} ${styles.reveal}`}
                data-reveal
                style={{ ["--reveal-delay" as any]: "0.18s" }}
              >
                <div className={styles.statHeader}>
                  <LocationOnOutlined className={styles.statIcon} />
                  <div>
                    <div className={styles.statLabel}>
                      {panoramaTheme.cards[2]?.title}
                    </div>
                    <div className={styles.statHint}>
                      {panoramaTheme.cards[2]?.subtitle}
                    </div>
                  </div>
                </div>
                {topDistricts.length ? (
                  <div className={styles.districtChips}>
                    {topDistricts.map((district) => (
                      <span key={district.key} className={styles.districtChip}>
                        {district.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={styles.statEmpty}>Sem dados de hoje.</div>
                )}
                <div className={styles.statHint}>Top 5 bairros do dia</div>
              </CardGridReflect>

              {/* Clima Geral */}
              <CardGridReflect
                span={12}
                className={`${styles.statCard} ${styles.wideCard} ${styles.reveal}`}
                data-reveal
                style={{ ["--reveal-delay" as any]: "0.24s" }}
              >
                <Box className={styles.climaCard}>
                  <div className={styles.statHeader}>
                    <ThermostatOutlined className={styles.statIcon} />
                    <Box>
                      <div className={styles.statLabel}>
                        {panoramaTheme.clima.title}
                      </div>
                      <div className={styles.statHint}>
                        {panoramaTheme.clima.subtitle}
                      </div>
                    </Box>
                  </div>
                  <div className={styles.typeChips}>
                    {groupOpinions.map(({ id, tema, total }) => {
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
                  {error ? (
                    <div className={styles.statHint}>{error}</div>
                  ) : null}
                </Box>
              </CardGridReflect>
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

            <Box
              className={`${styles.opinionsContainer} ${styles.reveal}`}
              data-reveal
              style={{ ["--reveal-delay" as any]: "0.32s" }}
            >
              <CardDetails opinions={paginatedOpinions} />
            </Box>
            <Box sx={{ width: "100%" }}>
              <Pagination
                page={currentPage}
                count={totalPages}
                onChange={(_, page) => setCurrentPage(page)}
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

