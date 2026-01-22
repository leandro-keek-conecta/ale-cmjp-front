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

import styles from "./HomePage.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import CardGrid from "../../components/card-grid";
import CardGridReflect from "../../components/card-grid-reflect";
import CardDetails from "../../components/cardDetails";
import {
  getAllOpinions,
  getTodayOpinions,
} from "../../services/opiniao/opiniaoService";
import SlideComponent from "../../components/slide";
import PresentationModal from "../../components/modal";
import Header from "../../components/header";
import { readFromStorage, saveToStorage } from "../../utils/localStorage";
import { ClimaIcon } from "../../icons/Filter";
import { ArrowDown } from "../../icons/arrowDonw";
import Forms from "../../components/Forms";
import { getFilterInputs } from "./inputs/inputListFilter";
import {
  applyFilters,
  mapFilterFormToState,
} from "../../utils/createDynamicFilter";
import { useForm } from "react-hook-form";
import type { FilterFormValues, FiltersState } from "../../types/filter";
import { Layout } from "../../components/layout/Layout";

export type Opinion = {
  id: number | string;
  usuario_id?: number | string;
  nome?: string;
  telefone?: string;
  bairro?: string;
  campanha?: string;
  horario?: string | null;
  acao?: string;
  opiniao: string;
  outra_opiniao?: string;
  tipo_opiniao?: string;
  texto_opiniao?: string;
};
const fallbackOpinions: Opinion[] = [
  { id: 1, telefone: "99999-9999", opiniao: "Reclamação" },
  { id: 2, telefone: "88888-8888", opiniao: "Sugestão" },
  { id: 4, telefone: "66666-6666", opiniao: "Elogio" },
  { id: 5, telefone: "55555-5555", opiniao: "Reclamação" },
  { id: 6, telefone: "44444-4444", opiniao: "Sugestão" },
  { id: 8, telefone: "22222-2222", opiniao: "Elogio" },
];

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

export default function HomePage() {
  const PRESENTATION_SEEN_KEY = "home:presentationSeen";
  const [opinions, setOpinions] = useState<Opinion[]>([]);
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
    { type: string; count: number }[]
  >([]);
  const hasFetched = useRef(false);
  const heroTitleRef = useRef<HTMLSpanElement | null>(null);
  const [heroCopyWidth, setHeroCopyWidth] = useState<number | null>(null);
  /*   const navigate = useNavigate(); */

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

  async function fetchTodayOpinions() {
    try {
      const response = await getTodayOpinions();
      setTodayOpinions(response);
    } catch (err) {
      setError("Erro ao carregar opiniões de hoje.");
    }
  }

  async function fetchOpinions() {
    try {
      const response = await getAllOpinions();
      const opinionsList = Array.isArray(response) ? response : [];
      quantityPorCategory(opinionsList);
      setOpinions(opinionsList);
    } catch (err) {
      setError("Erro ao carregar opiniões.");
    }
  }

  function quantityPorCategory(opinions: Opinion[]) {
    const countsMap = opinions.reduce((acc, opinion) => {
      const label = (opinion.tipo_opiniao || opinion.opiniao || "").trim();
      const key = normalizeText(label);

      if (!key) return acc; // ignora itens sem categoria

      const current = acc.get(key);
      acc.set(key, {
        type: label || "Sem categoria",
        count: (current?.count ?? 0) + 1,
      });

      return acc;
    }, new Map<string, { type: string; count: number }>());

    const grouped = Array.from(countsMap.values());
    setGroupOpinions(grouped);
  }

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    console.log(filteredOpinions); //
    fetchOpinions();
    fetchTodayOpinions();
  }, []);

  useEffect(() => {
    if (opinions.length) {
      console.log("Opinions carregadas:", opinions);
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

  const getOpinionDistrict = (opinion: Opinion) => {
    const raw =
      opinion.bairro ??
      (opinion as any)?.usuario?.bairro ??
      (opinion as any)?.user?.bairro ??
      "";
    return String(raw || "").trim();
  };

  const isSameDay = (value?: string | null) => {
    if (!value) return false;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return false;
    const now = new Date();
    return (
      parsed.getFullYear() === now.getFullYear() &&
      parsed.getMonth() === now.getMonth() &&
      parsed.getDate() === now.getDate()
    );
  };

  const getTopDistricts = (items: Opinion[]) => {
    const countsMap = items.reduce((acc, opinion) => {
      const label = getOpinionDistrict(opinion);
      const key = normalizeText(label);

      if (!key) return acc;

      const current = acc.get(key);
      acc.set(key, {
        key,
        label,
        count: (current?.count ?? 0) + 1,
      });
      return acc;
    }, new Map<string, { key: string; label: string; count: number }>());

    return Array.from(countsMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const normalizeType = (item: Opinion) =>
    normalizeText(item.tipo_opiniao || item.opiniao);

  const sourceOpinions = opinions.length ? opinions : fallbackOpinions;
  const topDistricts = useMemo(() => {
    const fromToday = getTopDistricts(todayOpinions);
    if (fromToday.length) return fromToday;

    const todayFromAll = opinions.filter((op) => isSameDay(op.horario));
    return getTopDistricts(todayFromAll);
  }, [todayOpinions, opinions]);

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
      <Layout>
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
                span={4}
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
                span={4}
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
                <div className={styles.statHint}>Top 5 temas do dia</div>
              </CardGridReflect>
              {/* Card 3 */}
              <CardGridReflect
                span={4}
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
                    {groupOpinions.map(({ type, count }) => {
                      const typeKey = normalizeText(type) || "outro";
                      return (
                        <span
                          key={typeKey || type}
                          className={styles.typeChip}
                          data-type={typeKey}
                          aria-label={`${type} (${count})`}
                        >
                          <span className={styles.typeIcon}>
                            {renderTypeIcon(type)}
                          </span>
                          <span>{type}</span>
                          <span className={styles.typeCount}>{count}</span>
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
                  inputsList={getFilterInputs()}
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
