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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getOpinionFilterOptions,
  getOpinionReportMetrics,
  type MetricsParams,
  type OpinionFilterOptionsResponse,
  type OpinionReportResponse,
} from "../../services/relatorioPage/relatorioService";
import { ArrowDown } from "../../icons/arrowDonw";
import {
  groupOpinionsByMonthOnly,
  normalizeOpinionsByDay,
} from "../../utils/retornMonthInDate";
import CardGrid from "@/components/card-grid";
import Forms from "@/components/Forms";
import { useForm } from "react-hook-form";
import type { FilterFormValues } from "../../types/filter";
import Button from "@/components/Button";
import getFilterInputs, {
  type FilterSelectOptions,
  type SelectOption,
} from "./inputs/inputListFilter";
import type { ChartDatum } from "@/types/ChartDatum";
import { useParams } from "react-router-dom";

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

type FilterApiItem = {
  label?: string;
  value?: string;
  count?: number;
};

const DEFAULT_VALUE_KEYS = ["value", "total", "count"] as const;

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

const decodeRouteTheme = (rawTheme: string | undefined) => {
  if (typeof rawTheme !== "string") return "";

  try {
    const decoded = decodeURIComponent(rawTheme).trim();
    return decoded;
  } catch {
    return rawTheme.trim();
  }
};

const buildMetricsParamsFromForm = (
  data: FilterFormValues,
  forcedTema?: string,
): MetricsParams => {
  const params: MetricsParams = {};

  const startDate = parseDateInput(data.dataInicio);
  const endDate = parseDateInput(data.dataFim);
  if (startDate) {
    params.start = toUtcStartOfDayISOString(startDate);
  }
  if (endDate) {
    params.end = toUtcEndOfDayISOString(endDate);
  }

  const temaSource = forcedTema ?? data.tema;
  if (temaSource) {
    const tema = normalizeParam(temaSource);
    if (tema) {
      params.temas = tema;
    }
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
    title: "Quantidade Total de Opinioes",
    subtitle: toNumber(cards?.totalOpinions),
  },
  {
    id: 2,
    title: "Quantidade Total de Reclamacoes",
    subtitle: toNumber(cards?.totalComplaints),
  },
  {
    id: 3,
    title: "Quantidade Total de Elogios",
    subtitle: toNumber(cards?.totalPraise ?? cards?.totalKudos),
  },
  {
    id: 4,
    title: "Quantidade Total de Sugestoes",
    subtitle: toNumber(cards?.totalSuggestions),
  },
];

const toChartLabel = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return null;
};

const normalizeChartData = (data: unknown, labelKeys: string[]): ChartDatum[] => {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = labelKeys
        .map((key) => toChartLabel(row[key]))
        .find((value): value is string => Boolean(value));

      if (!label) return null;

      const firstValue =
        DEFAULT_VALUE_KEYS.map((key) => row[key]).find(
          (value) => value !== undefined,
        ) ?? 0;

      return {
        label,
        value: toNumber(firstValue),
      };
    })
    .filter((item): item is ChartDatum => item !== null);
};

const normalizeOptionKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const mapSelectOptions = (
  items: FilterApiItem[] | undefined,
): SelectOption<string>[] =>
  Array.isArray(items)
    ? items.reduce<SelectOption<string>[]>((accumulator, item) => {
        const label = typeof item.label === "string" ? item.label.trim() : "";
        const value = typeof item.value === "string" ? item.value.trim() : "";
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

export default function RelatorioOpiniao() {
  const { tema: routeTheme } = useParams<{ tema?: string }>();
  const fixedTheme = useMemo(() => decodeRouteTheme(routeTheme), [routeTheme]);
  const hasFixedTheme = fixedTheme.length > 0;

  const [cardsData, setCardsData] = useState<ReportCard[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [opinionsByDay, setOpinionsByDay] = useState<ChartDatum[]>([]);
  const [opinionsByMonth, setOpinionsByMonth] = useState<ChartDatum[]>([]);
  const [opinionsByGender, setOpinionsByGender] = useState<ChartDatum[]>([]);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [campaignAcceptance, setCampaignAcceptance] = useState<ChartDatum[]>([]);
  const [opinionsByAge, setOpinionsByAge] = useState<ChartDatum[]>([]);
  const [topTemas, setTopTemas] = useState<ChartDatum[]>([]);
  const [topBairros, setTopBairros] = useState<ChartDatum[]>([]);
  const [filterSelectOptions, setFilterSelectOptions] = useState<
    Partial<FilterSelectOptions>
  >({});

  const {
    control: filterControl,
    formState: { errors: filterErrors },
    handleSubmit: handleFilterSubmit,
    reset: resetFilterForm,
  } = useForm<FilterFormValues>({
    defaultValues: buildFilternDefaultValues(fixedTheme || null),
  });

  const activeRef = useRef(true);

  const fetchMetrics = useCallback(
    async (params?: MetricsParams) => {
      try {
        setMetricsLoading(true);

        const requestParams = params ?? {};
        const scopedParams =
          hasFixedTheme && fixedTheme
            ? {
                ...requestParams,
                temas: fixedTheme,
              }
            : requestParams;

        const [report, filters] = await Promise.all([
          getOpinionReportMetrics(scopedParams),
          getOpinionFilterOptions(scopedParams).catch(() => null),
        ]);

        if (!activeRef.current) return;

        const typedReport = report as OpinionReportResponse;
        const typedFilters = filters as OpinionFilterOptionsResponse | null;

        setCardsData(buildCards(typedReport.cards));

        const rawOpinionsByMonth =
          typedReport.lineByMonth ?? typedReport.opinionsByMonth ?? [];
        setOpinionsByMonth(
          groupOpinionsByMonthOnly(
            rawOpinionsByMonth as Parameters<
              typeof groupOpinionsByMonthOnly
            >[0],
          ),
        );

        const rawOpinionsByDay =
          typedReport.lineByDay ?? typedReport.opinionsByDay ?? [];
        setOpinionsByDay(
          normalizeOpinionsByDay(
            rawOpinionsByDay as Parameters<typeof normalizeOpinionsByDay>[0],
          ),
        );

        setOpinionsByGender(
          normalizeChartData(typedReport.opinionsByGender, [
            "label",
            "genero",
            "gender",
            "name",
          ]),
        );

        setCampaignAcceptance(
          normalizeChartData(typedReport.campaignAcceptance, [
            "label",
            "aceite",
            "status",
            "name",
          ]),
        );

        setTopTemas(
          normalizeChartData(typedReport.topTemas, ["label", "tema", "name"]),
        );

        setTopBairros(
          normalizeChartData(typedReport.topBairros, ["label", "bairro", "name"]),
        );

        setOpinionsByAge(
          normalizeChartData(typedReport.opinionsByAge, [
            "label",
            "faixaEtaria",
            "ageRange",
            "name",
          ]),
        );

        if (typedFilters) {
          setFilterSelectOptions({
            tipo: mapSelectOptions(typedFilters.tipoOpiniao),
            tema: mapSelectOptions(typedFilters.temas),
            genero: mapSelectOptions(typedFilters.genero),
            faixaEtaria: mapSelectOptions(typedFilters.faixaEtaria),
          });
        }
      } catch {
        if (!activeRef.current) return;
        setCardsData(buildCards());
        setOpinionsByMonth([]);
        setOpinionsByDay([]);
        setOpinionsByGender([]);
        setCampaignAcceptance([]);
        setTopTemas([]);
        setTopBairros([]);
        setOpinionsByAge([]);
      } finally {
        if (activeRef.current) {
          setMetricsLoading(false);
        }
      }
    },
    [fixedTheme, hasFixedTheme],
  );

  useEffect(() => {
    activeRef.current = true;
    void fetchMetrics();

    return () => {
      activeRef.current = false;
    };
  }, [fetchMetrics]);

  useEffect(() => {
    const defaults = buildFilternDefaultValues(fixedTheme || null);
    resetFilterForm(defaults);
  }, [fixedTheme, resetFilterForm]);

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
    const defaults = buildFilternDefaultValues(fixedTheme || null);
    resetFilterForm(defaults);
    void fetchMetrics();
  };

  async function onSubmitUser(data: FilterFormValues) {
    const params = buildMetricsParamsFromForm(data, fixedTheme || undefined);
    void fetchMetrics(params);
  }

  return (
    <Layout
      titulo={
        hasFixedTheme
          ? `Tela de Relatório de Opiniões - ${fixedTheme}`
          : "Tela de Relatório de Opiniões"
      }
    >
      <Box className={styles.container}>
        <CardGrid
          className={`${styles.searchCard} ${styles.reveal}`}
          span={12}
          data-reveal
          style={{ ["--reveal-delay" as never]: "0.28s" }}
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
              inputsList={getFilterInputs(filterSelectOptions, {
                hideTema: hasFixedTheme,
              })}
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
          {cardsData.map((card) => (
            <CardGridReflect
              key={card.id}
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
            <h5>Quantidade de Opinioes Mes a Mes</h5>
            <LineChart
              data={opinionsByMonth}
              height={200}
              loading={metricsLoading}
            />
          </CardGridReflect>

          <CardGridReflect span={6}>
            <h5>Quantidade de Opinioes Dia a Dia (mes atual)</h5>
            <LineChart
              data={opinionsByDay}
              height={200}
              loading={metricsLoading}
            />
          </CardGridReflect>
        </Box>
        <Box className={styles.gridContainer} sx={{ marginTop: "1rem" }}>
          <CardGridReflect span={4}>
            <h5>Quantidade de Opinioes por Faixa Etaria</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <BarChart
                data={opinionsByAge}
                height={220}
                loading={metricsLoading}
              />
            </Box>
          </CardGridReflect>

          <CardGridReflect span={4}>
            <h5>Quantidade de Opinioes por Genero</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <PieChart
                data={opinionsByGender}
                height={220}
                loading={metricsLoading}
              />
            </Box>
          </CardGridReflect>

          <CardGridReflect span={4}>
            <h5>Autorizacao de comunicacao</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <PieChart
                data={campaignAcceptance}
                height={220}
                loading={metricsLoading}
              />
            </Box>
          </CardGridReflect>
        </Box>

        <Box className={styles.gridContainerOndeLine} sx={{ marginTop: "1rem" }}>
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

