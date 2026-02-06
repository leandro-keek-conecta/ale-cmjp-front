import { Box } from "@mui/material";
import { Layout } from "../../components/layout/Layout";
import styles from "./RelatorioPage.module.css";
import CardGridReflect from "../../components/card-grid-reflect";
import { BarChart } from "../../components/charts/bar/BarChart";
import { ClimaIcon } from "../../icons/Filter";
import { LineChart } from "../../components/charts/line/LineChart";
import { PieChart } from "../../components/charts/pie/PieChart";
import { BarRaceChart } from "../../components/charts/barRace/BarRaceChart";
import AnimatedNumber from "../../components/animated-number";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getMetrics,
  type MetricsParams,
} from "../../services/relatorioPage/relatorioService";
import { ArrowDown } from "../../icons/arrowDonw";
import {
  groupOpinionsByMonthOnly,
  normalizeOpinionsByDay,
} from "../../utils/retornMonthInDate";
import CardGrid from "@/components/card-grid";
import Forms from "@/components/Forms";
import { useForm } from "react-hook-form";
import {
  mapFilterFormToState,
} from "../../utils/createDynamicFilter";
import type { FilterFormValues, FiltersState } from "../../types/filter";
import Button from "@/components/Button";
import {
  getFilterInputs,
  type FilterSelectOptions,
} from "./inputs/inputListFilter";
type ReportCards = {
  totalOpinions?: number | string;
  totalComplaints?: number | string;
  totalPraise?: number | string;
  totalKudos?: number | string;
  totalSuggestions?: number | string;
};

type ReportCard = {
  id: number;
  title: string;
  subtitle: number;
};

type ChartDatum = {
  label: string;
  value: number;
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

const toUtcStartOfDayISOString = (date: Date) =>
  new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
  ).toISOString();

const toUtcEndOfDayISOString = (date: Date) =>
  new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    ),
  ).toISOString();

const parseDateInput = (value: unknown) => {
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      if (
        Number.isFinite(year) &&
        Number.isFinite(month) &&
        Number.isFinite(day)
      ) {
        return new Date(year, month - 1, day);
      }
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const normalizeParam = (value: string) => value.trim();

const buildMetricsParamsFromForm = (
  data: FilterFormValues,
): MetricsParams => {
  const params: MetricsParams = {};

  const startDate = parseDateInput(data.dataInicio);
  const endDate = parseDateInput(data.dataFim);
  if (startDate && endDate) {
    params.start = toUtcStartOfDayISOString(startDate);
    params.end = toUtcEndOfDayISOString(endDate);
  }

  if (data.tema) {
    const tema = normalizeParam(data.tema);
    if (tema) params.temas = tema;
  }

  if (data.tipo) {
    const tipo = normalizeParam(data.tipo);
    if (tipo) params.tipoOpiniao = tipo;
  }

  if (data.genero) {
    const genero = normalizeParam(data.genero);
    if (genero) params.genero = genero;
  }

  if (data.bairro) {
    const bairro = normalizeParam(data.bairro);
    if (bairro) params.bairros = bairro;
  }

  if (data.faixaEtaria) {
    const faixaEtaria = normalizeParam(data.faixaEtaria);
    if (faixaEtaria) params.faixaEtaria = faixaEtaria;
  }


  return params;
};

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const buildCards = (cards?: ReportCards) => [
  {
    id: 1,
    title: "Quantidade Total de Opiniões",
    subtitle: toNumber(cards?.totalOpinions),
  },
  {
    id: 2,
    title: "Quantidade Total de Reclamações",
    subtitle: toNumber(cards?.totalComplaints),
  },
  {
    id: 3,
    title: "Quantidade Total de Elogios",
    subtitle: toNumber(cards?.totalPraise ?? cards?.totalKudos),
  },
  {
    id: 4,
    title: "Quantidade Total de Sugestões",
    subtitle: toNumber(cards?.totalSuggestions),
  },
];

export default function RelatorioPage() {
  const [cardsData, setCardsData] = useState<ReportCard[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [opinionsByDay, setOpinionsByDay] = useState<ChartDatum[]>([]);
  const [opinionsByMonth, setOpinionsByMonth] = useState<ChartDatum[]>([]);
  const [opinionsByGender, setOpinionsByGender] = useState<ChartDatum[]>([]);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [campaignAcceptance, setCampaignAcceptance] = useState<ChartDatum[]>(
    [],
  );
  const [, setFilters] = useState<FiltersState>(() =>
    mapFilterFormToState(buildFilternDefaultValues()),
  );

  const {
    control: filterControl,
    formState: { errors: filterErrors },
    handleSubmit: handleFilterSubmit,
    reset: resetFilterForm,
  } = useForm<FilterFormValues>({
    defaultValues: buildFilternDefaultValues(),
  });
  const [opinionsByAge, setOpinionsByAge] = useState<ChartDatum[]>([]);
  const [topTemas, setTopTemas] = useState<any[]>([]);
  const [topBairros, setTopBairros] = useState<any[]>([]);
  const [filterSelectOptions] = useState<
    Partial<FilterSelectOptions>
  >({});

  const activeRef = useRef(true);

  const fetchMetrics = useCallback(async (params?: MetricsParams) => {
    try {
      setMetricsLoading(true);
      const response = await getMetrics(params);

      if (!activeRef.current) return;
      setCardsData(buildCards(response.cards));
      const rawOpinionsByMonth =
        response.lineByMonth ?? response.opinionsByMonth ?? [];
      setOpinionsByMonth(groupOpinionsByMonthOnly(rawOpinionsByMonth));
      const rawOpinionsByDay = response.lineByDay ?? response.opinionsByDay ?? [];
      setOpinionsByDay(normalizeOpinionsByDay(rawOpinionsByDay));

      setOpinionsByGender(response.opinionsByGender ?? []);
      setCampaignAcceptance(response.campaignAcceptance ?? []);
      const temasData = response.topTemas.map((item: any) => ({
        label: item.tema,
        value: item.total,
      }));
      setTopTemas(temasData);
      setTopBairros(response.topBairros ?? []);
      setOpinionsByAge(response.opinionsByAge ?? []);
    } catch (error) {
      if (!activeRef.current) return;
    }
    if (activeRef.current) {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    activeRef.current = true;
    void fetchMetrics();

    return () => {
      activeRef.current = false;
    };
  }, [fetchMetrics]);

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

  const handleClearFilters = () => {
    const defaults = buildFilternDefaultValues();
    resetFilterForm(defaults);
    setFilters(mapFilterFormToState(defaults));
    void fetchMetrics();
  };

  async function onSubmitUser(data: FilterFormValues) {
    setFilters(mapFilterFormToState(data));
    const params = buildMetricsParamsFromForm(data);
    
    void fetchMetrics(params);
  }

  return (
    <Layout titulo="Tela de Relatório">
      <Box className={styles.container}>
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

        <Box className={styles.gridContainer}>
          {cardsData.map((card: any, index) => (
            <CardGridReflect
              key={index}
              children={
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h5>{card.title}</h5>
                  <h4>
                    <AnimatedNumber value={card.subtitle} />
                  </h4>
                </Box>
              }
              span={3}
            />
          ))}
        </Box>
        <Box className={styles.gridContainer} sx={{ marginTop: "1rem" }}>
          <CardGridReflect span={6}>
            <h5>Quantidade de Opiniões Mês a Mês</h5>
            <LineChart
              data={opinionsByMonth}
              height={200}
              loading={metricsLoading}
            />
          </CardGridReflect>

          <CardGridReflect span={6}>
            <h5>Quantidade de Opiniões Dia a Dia (mês atual)</h5>
            <LineChart
              data={opinionsByDay}
              height={200}
              loading={metricsLoading}
            />
          </CardGridReflect>
        </Box>
        <Box className={styles.gridContainer} sx={{ marginTop: "1rem" }}>
          <CardGridReflect span={4}>
            <h5>Quantidade de Opiniões por Faixa Etária</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <BarChart
                data={opinionsByAge}
                height={220}
                loading={metricsLoading}
              />
            </Box>
          </CardGridReflect>

          <CardGridReflect span={4}>
            <h5>Quantidade de Opiniões por Gênero</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <PieChart
                data={opinionsByGender}
                height={220}
                loading={metricsLoading}
              />
            </Box>
          </CardGridReflect>

          <CardGridReflect span={4}>
            <h5>Autorização de comunicação</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <PieChart
                data={campaignAcceptance}
                height={220}
                loading={metricsLoading}
              />
            </Box>
          </CardGridReflect>
        </Box>

        <Box
          className={styles.gridContainerOndeLine}
          sx={{ marginTop: "1rem" }}
        >
          <CardGridReflect span={6} style={{ marginBottom: 0 }} disablePadding>
            <h5 style={{ margin: "1rem" }}>Top 10 bairros com mais opiniões</h5>
            <BarRaceChart
              data={topBairros}
              height={360}
              loading={metricsLoading}
            />
          </CardGridReflect>

          <CardGridReflect
            span={6}
            disablePadding
            className={styles.topTemasCard}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <h5 style={{ margin: "1rem", marginBottom: "2rem" }}>
              Top temas mais falados
            </h5>
            <BarRaceChart
              data={topTemas}
              height={360}
              loading={metricsLoading}
            />
          </CardGridReflect>
        </Box>
      </Box>
    </Layout>
  );
}
