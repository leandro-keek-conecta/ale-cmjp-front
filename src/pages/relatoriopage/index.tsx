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
  getFormFilters,
  getGeneralMetrics,
  type FormFiltersResponse,
  type MetricsParams,
  type ProjectReportResponse,
  type ResponseStatus,
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
import { getFormsById } from "@/services/forms/formsService";
import { getStoredProjectId } from "@/utils/project";

type ReportCards = {
  totalResponses?: number | string;
  totalOpinionFormResponses?: number | string;
  totalPraise?: number | string;
  totalSuggestions?: number | string;
  completionRate?: number | string;
};

type ReportCard = {
  id: number;
  title: string;
  subtitle: number;
};

const DEFAULT_VALUE_KEYS = ["value", "total", "count"] as const;

const STATUS_LABELS: Record<ResponseStatus, string> = {
  STARTED: "Iniciadas",
  COMPLETED: "Concluidas",
  ABANDONED: "Abandonadas",
};

const DEFAULT_STATUS_OPTIONS: SelectOption<ResponseStatus>[] = [
  { label: STATUS_LABELS.STARTED, value: "STARTED" },
  { label: STATUS_LABELS.COMPLETED, value: "COMPLETED" },
  { label: STATUS_LABELS.ABANDONED, value: "ABANDONED" },
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
  status: "",
  formIds: [],
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

const isResponseStatus = (value: string): value is ResponseStatus =>
  value === "STARTED" || value === "COMPLETED" || value === "ABANDONED";

const normalizeFormIds = (values: FilterFormValues["formIds"]): string[] => {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => (typeof value === "number" ? String(value) : value.trim()))
    .filter((value) => value.length > 0);
};

const buildMetricsParamsFromForm = (data: FilterFormValues): MetricsParams => {
  const params: MetricsParams = {};

  const startDate = parseDateInput(data.dataInicio);
  const endDate = parseDateInput(data.dataFim);
  if (startDate) {
    params.start = toUtcStartOfDayISOString(startDate);
  }
  if (endDate) {
    params.end = toUtcEndOfDayISOString(endDate);
  }

  if (data.status) {
    const normalizedStatus = normalizeParam(data.status).toUpperCase();
    if (isResponseStatus(normalizedStatus)) {
      params.status = normalizedStatus;
    }
  }

  const formIds = normalizeFormIds(data.formIds);
  if (formIds.length) {
    params.formIds = formIds.join(",");
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

const toOptionalNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const toOptionalString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
};

const buildCards = (cards?: ReportCards) => [
  {
    id: 1,
    title: "Total de Respostas",
    subtitle: toNumber(cards?.totalResponses),
  },
  {
    id: 2,
    title: "Total de Opiniao",
    subtitle: toNumber(cards?.totalOpinionFormResponses),
  },
  {
    id: 3,
    title: "Total de Elogios",
    subtitle: toNumber(cards?.totalPraise),
  },
  {
    id: 4,
    title: "Total de Sugestoes",
    subtitle: toNumber(cards?.totalSuggestions),
  },
];

const toChartLabel = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "Sim" : "Nao";
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

const formatLabelWithCount = (label: string, count?: number) => {
  if (typeof count !== "number" || !Number.isFinite(count)) {
    return label;
  }
  return `${label} (${Math.max(0, Math.round(count))})`;
};

const stripCountSuffix = (label: string) => label.replace(/\s\(\d+\)$/, "");

const normalizeFormOptionLabel = (entry: Record<string, unknown>, id: number) =>
  toOptionalString(entry.formName) ??
  toOptionalString(entry.name) ??
  toOptionalString(entry.title) ??
  toOptionalString((entry.form as Record<string, unknown> | undefined)?.name) ??
  `Formulario ${id}`;

const normalizeFormOptionId = (entry: Record<string, unknown>) =>
  toOptionalNumber(entry.formId) ??
  toOptionalNumber(entry.id) ??
  toOptionalNumber((entry.form as Record<string, unknown> | undefined)?.id) ??
  toOptionalNumber(
    (entry.form as Record<string, unknown> | undefined)?.formId,
  );

const normalizeFormSelectOptions = (source: unknown): SelectOption<number>[] => {
  if (!Array.isArray(source)) return [];

  const dedupe = new Set<number>();

  return source
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const id = normalizeFormOptionId(row);
      if (id === undefined || dedupe.has(id)) return null;
      dedupe.add(id);

      return {
        value: id,
        label: normalizeFormOptionLabel(row, id),
      };
    })
    .filter((item): item is SelectOption<number> => item !== null)
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
};

const mergeFormOptionsWithCounts = (
  baseOptions: SelectOption<number>[],
  countByFormId: Map<number, number>,
): SelectOption<number>[] => {
  if (!baseOptions.length) return [];

  return baseOptions.map((option) => {
    const baseLabel = stripCountSuffix(option.label);
    const count = countByFormId.get(option.value);
    return {
      ...option,
      label: formatLabelWithCount(baseLabel, count),
    };
  });
};

const extractFormCounts = (filters: FormFiltersResponse | null): Map<number, number> => {
  const countByFormId = new Map<number, number>();
  if (!filters || !Array.isArray(filters.forms)) return countByFormId;

  filters.forms.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;

    const id =
      toOptionalNumber(entry.formId) ??
      toOptionalNumber(entry.id) ??
      toOptionalNumber((entry as Record<string, unknown>).formVersionId);

    if (id === undefined) return;

    const count =
      toOptionalNumber(entry.count) ??
      toOptionalNumber(entry.totalResponses) ??
      toOptionalNumber(entry.total) ??
      0;

    countByFormId.set(id, count);
  });

  return countByFormId;
};

const normalizeStatusKey = (value: unknown): ResponseStatus | null => {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase();
  if (normalized === "STARTED" || normalized === "INICIADAS") return "STARTED";
  if (
    normalized === "COMPLETED" ||
    normalized === "CONCLUIDAS" ||
    normalized === "CONCLUIDOS"
  ) {
    return "COMPLETED";
  }
  if (normalized === "ABANDONED" || normalized === "ABANDONADAS") {
    return "ABANDONED";
  }

  return null;
};

const extractStatusCounts = (statusFunnel: unknown): Map<ResponseStatus, number> => {
  const countByStatus = new Map<ResponseStatus, number>();
  if (!Array.isArray(statusFunnel)) return countByStatus;

  statusFunnel.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const row = entry as Record<string, unknown>;

    const status =
      normalizeStatusKey(row.status) ??
      normalizeStatusKey(row.label) ??
      normalizeStatusKey(row.name);

    if (!status) return;

    const value =
      toOptionalNumber(row.total) ??
      toOptionalNumber(row.count) ??
      toOptionalNumber(row.value) ??
      0;

    countByStatus.set(status, value);
  });

  return countByStatus;
};

const buildStatusOptions = (counts: Map<ResponseStatus, number>) =>
  DEFAULT_STATUS_OPTIONS.map((option) => ({
    ...option,
    label: formatLabelWithCount(STATUS_LABELS[option.value], counts.get(option.value)),
  }));

const deriveCompletionRate = (
  statusCounts: Map<ResponseStatus, number>,
  cards?: ReportCards,
) => {
  const cardsCompletionRate = toNumber(cards?.completionRate);
  if (cardsCompletionRate > 0) {
    return cardsCompletionRate;
  }

  const started = statusCounts.get("STARTED") ?? 0;
  const completed = statusCounts.get("COMPLETED") ?? 0;
  const abandoned = statusCounts.get("ABANDONED") ?? 0;

  const total = started + completed + abandoned;
  if (total <= 0) return 0;

  return Math.round((completed / total) * 100);
};

export default function RelatorioPage() {
  const [cardsData, setCardsData] = useState<ReportCard[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [lineByDayData, setLineByDayData] = useState<ChartDatum[]>([]);
  const [lineByMonthData, setLineByMonthData] = useState<ChartDatum[]>([]);
  const [responsesByFormData, setResponsesByFormData] = useState<ChartDatum[]>([]);
  const [statusFunnelData, setStatusFunnelData] = useState<ChartDatum[]>([]);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [completionData, setCompletionData] = useState<ChartDatum[]>([]);
  const [filterSelectOptions, setFilterSelectOptions] = useState<
    Partial<FilterSelectOptions>
  >({
    formIds: [],
    status: DEFAULT_STATUS_OPTIONS,
  });

  const {
    control: filterControl,
    formState: { errors: filterErrors },
    handleSubmit: handleFilterSubmit,
    reset: resetFilterForm,
  } = useForm<FilterFormValues>({
    defaultValues: buildFilternDefaultValues(),
  });

  const activeRef = useRef(true);
  const formOptionsRef = useRef<SelectOption<number>[]>([]);

  const fetchFormOptions = useCallback(async () => {
    const projectId = getStoredProjectId();
    if (!projectId) {
      formOptionsRef.current = [];
      return;
    }

    try {
      const forms = await getFormsById(projectId);
      if (!activeRef.current) return;

      const options = normalizeFormSelectOptions(forms);
      formOptionsRef.current = options;

      setFilterSelectOptions((prev) => ({
        ...prev,
        formIds: options,
      }));
    } catch {
      if (!activeRef.current) return;
      formOptionsRef.current = [];
      setFilterSelectOptions((prev) => ({
        ...prev,
        formIds: [],
      }));
    }
  }, []);

  const fetchMetrics = useCallback(async (params?: MetricsParams) => {
    try {
      setMetricsLoading(true);

      const requestParams = params ?? {};
      const [report, filters] = await Promise.all([
        getGeneralMetrics(requestParams),
        getFormFilters({ ...requestParams }).catch(
          () => null,
        ),
      ]);

      if (!activeRef.current) return;

      const typedReport = report as ProjectReportResponse;
      const cards = (typedReport.cards ?? {}) as ReportCards;

      setCardsData(buildCards(cards));

      const monthData = typedReport.lineByMonth ?? [];
      setLineByMonthData(
        groupOpinionsByMonthOnly(
          monthData as Parameters<typeof groupOpinionsByMonthOnly>[0],
        ),
      );

      const dayData = typedReport.lineByDay ?? [];
      setLineByDayData(
        normalizeOpinionsByDay(dayData as Parameters<typeof normalizeOpinionsByDay>[0]),
      );

      const normalizedResponsesByForm = normalizeChartData(
        typedReport.responsesByForm,
        ["label", "formName", "name", "title"],
      );
      setResponsesByFormData(normalizedResponsesByForm);

      const normalizedStatusFunnel = normalizeChartData(typedReport.statusFunnel, [
        "label",
        "status",
        "name",
      ]);
      setStatusFunnelData(normalizedStatusFunnel);

      const statusCounts = extractStatusCounts(typedReport.statusFunnel);
      const completionRate = deriveCompletionRate(statusCounts, cards);
      setCompletionData([
        { label: "Concluidas", value: completionRate },
        { label: "Nao concluidas", value: Math.max(0, 100 - completionRate) },
      ]);

      const formCounts = extractFormCounts(filters as FormFiltersResponse | null);
      const formOptionsWithCounts = mergeFormOptionsWithCounts(
        formOptionsRef.current,
        formCounts,
      );

      setFilterSelectOptions((prev) => ({
        ...prev,
        formIds: formOptionsWithCounts.length
          ? formOptionsWithCounts
          : formOptionsRef.current,
        status: buildStatusOptions(statusCounts),
      }));
    } catch {
      if (!activeRef.current) return;
      setCardsData(buildCards());
      setLineByMonthData([]);
      setLineByDayData([]);
      setResponsesByFormData([]);
      setStatusFunnelData([]);
      setCompletionData([]);
    } finally {
      if (activeRef.current) {
        setMetricsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    activeRef.current = true;
    void fetchFormOptions();
    void fetchMetrics();

    return () => {
      activeRef.current = false;
    };
  }, [fetchFormOptions, fetchMetrics]);

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
    void fetchMetrics();
  };

  async function onSubmitUser(data: FilterFormValues) {
    const params = buildMetricsParamsFromForm(data);
    void fetchMetrics(params);
  }

  return (
    <Layout titulo="Tela de Relatorio">
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
            <h5>Quantidade de Respostas Mes a Mes (ultimos 6 meses)</h5>
            <LineChart
              data={lineByMonthData}
              height={200}
              loading={metricsLoading}
            />
          </CardGridReflect>

          <CardGridReflect span={6}>
            <h5>Quantidade de Respostas Dia a Dia (mes atual)</h5>
            <LineChart data={lineByDayData} height={200} loading={metricsLoading} />
          </CardGridReflect>
        </Box>
        <Box className={styles.gridContainer} sx={{ marginTop: "1rem" }}>
          <CardGridReflect span={4}>
            <h5>Quantidade de Respostas por Formulario</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <BarChart
                data={responsesByFormData}
                height={220}
                loading={metricsLoading}
              />
            </Box>
          </CardGridReflect>

          <CardGridReflect span={4}>
            <h5>Status das Respostas</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <PieChart data={statusFunnelData} height={220} loading={metricsLoading} />
            </Box>
          </CardGridReflect>

          <CardGridReflect span={4}>
            <h5>Taxa de Conclusao</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <PieChart data={completionData} height={220} loading={metricsLoading} />
            </Box>
          </CardGridReflect>
        </Box>

        <Box className={styles.gridContainerOndeLine} sx={{ marginTop: "1rem" }}>
          <CardGridReflect span={6} style={{ marginBottom: 0 }} disablePadding>
            <h5 style={{ margin: "1rem" }}>Formularios com mais respostas</h5>
            <BarRaceChart
              data={responsesByFormData}
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
              Funil de status
            </h5>
            <BarRaceChart data={statusFunnelData} height={360} loading={metricsLoading} />
          </CardGridReflect>
        </Box>
      </Box>
    </Layout>
  );
}
