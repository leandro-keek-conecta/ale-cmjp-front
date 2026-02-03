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
import {
  getAllOpinions
} from "../../services/opiniao/opiniaoService";
import SlideComponent from "../../components/slide";
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

export default function Panorama() {
  const PRESENTATION_SEEN_KEY = "home:presentationSeen";
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [topDistricts, setTopDistricts] = useState<any[]>([]);
  const [topTemas, setTopTemas] = useState<any[]>([]);
  const [filterSelectOptions, setFilterSelectOptions] = useState<
    Partial<FilterSelectOptions>
  >({});
  const [filters, setFilters] = useState<FiltersState>(() =>
    mapFilterFormToState(buildFilternDefaultValues()),
  );
  const [todayOpinions, setTodayOpinions] = useState<Opinion[]>([]);
  const [error, setError] = useState("");
  const [filterType] = useState<string>("all");
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [searchTerm] = useState("");
  const [itensPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
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
      ? items.map((item) => ({ label: item.label, value: item.value }))
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

  async function fetchOpinions() {
    try {
      const response = await getAllOpinions(5);
      setOpinions(response.data.items);
    } catch (err) {
      setError("Erro ao carregar opiniões.");
    }
  }

  async function fetchFilterOptions() {
    try {
      const response = await getFiltros(5);
      const payload = response?.data?.data ?? response?.data ?? {};
      setFilterSelectOptions({
        tipo: mapSelectOptions(payload?.tipoOpiniao),
        tema: mapSelectOptions(payload?.temas),
        genero: mapSelectOptions(payload?.genero),
        faixaEtaria: mapSelectOptions(payload?.faixaEtaria),
      });
    } catch (err) {
      console.error("Erro ao carregar filtros.", err);
    }
  }

  async function handleGetMetricas() {
    const response: any = await getMetricas(5);
    setGroupOpinions(response.data.data.topTemas || []);
    console.log("Filtros recebidos:", response.data.data.topTemas);
    setTodayOpinions(response.data.data.totalOpinionsToday || []);
    setTopDistricts(response.data.data.topBairros || []);
    setTopTemas(response.data.data.topTemas || []);
  }

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    handleGetMetricas();
    fetchFilterOptions();
    fetchOpinions();
  }, []);

  useEffect(() => {
    if (opinions.length) {
    }
  }, [opinions]);

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

  const sourceOpinions = opinions.length ? opinions : [];

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
    if (key === "sugestao") return <LightbulbOutlined fontSize="small" />;
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
        <Box className={styles.container}>
          <Box component="header" className={styles.hero}>
            <div
              className={styles.reveal}
              data-reveal
              style={{ ["--reveal-delay" as any]: "0s" }}
            >
              <SlideComponent />
            </div>
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
                    Monitorando a voz da cidade
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
                  Opinião em{" "}
                  <span className={styles.gradientText}>tempo real</span>
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
                Veja o que as pessoas estão falando, explore temas e acompanhe
                como as opiniões evoluem.
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
                    <div className={styles.statLabel}>Opiniões de hoje</div>
                    <div className={styles.statHint}>Total registradas</div>
                  </div>
                </div>
                {/* _________________________________________ */}
                <div className={styles.statValue}>{todayOpinions.length}</div>
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
                    <div className={styles.statLabel}>Temas mais falados</div>
                    <div className={styles.statHint}>
                      Participação distribuída
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
                    <div className={styles.statLabel}>Bairros mais ativos</div>
                    <div className={styles.statHint}>
                      Participação distribuída
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
                      <div className={styles.statLabel}>Clima geral</div>
                      <div className={styles.statHint}>
                        Distribuição das opiniões
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
