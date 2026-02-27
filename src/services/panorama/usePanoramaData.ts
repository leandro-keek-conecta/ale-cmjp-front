import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildRawSelect,
  getFormsByProjeto,
  getMetricFilters,
  getMetricSummary,
  getProjetoById,
  getRawFormResponses,
  resolveFormVersion,
  type FormEntity,
  type FormVersion,
  type MetricFiltersData,
  type MetricSummaryData,
  type ProjetoEntity,
} from "../../services/panorama/panoramaService";

type RowMapper<T> = (row: Record<string, unknown>, absoluteIndex: number) => T;

type UsePanoramaDataArgs<T> = {
  projetoId: number | null;
  formId?: number;
  page: number;
  pageSize: number;
  rangeStart?: Date | string | null;
  rangeEnd?: Date | string | null;
  enabled?: boolean;
  rowMapper?: RowMapper<T>;
};

type PanoramaState<T> = {
  loading: boolean;
  error: string | null;
  projeto: ProjetoEntity | null;
  forms: FormEntity[];
  selectedFormVersion: FormVersion | null;
  summary: MetricSummaryData | null;
  filterOptions: MetricFiltersData | null;
  rows: T[];
  total: number;
};

const defaultRowMapper = <T,>(row: Record<string, unknown>) => row as T;

const getErrorMessage = (error: unknown) => {
  const err = error as any;
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Erro ao carregar panorama do projeto."
  );
};

export function usePanoramaData<T = Record<string, unknown>>({
  projetoId,
  formId,
  page,
  pageSize,
  rangeStart,
  rangeEnd,
  enabled = true,
  rowMapper,
}: UsePanoramaDataArgs<T>) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<PanoramaState<T>>({
    loading: false,
    error: null,
    projeto: null,
    forms: [],
    selectedFormVersion: null,
    summary: null,
    filterOptions: null,
    rows: [],
    total: 0,
  });

  const offset = useMemo(
    () => Math.max(0, (Math.max(1, page) - 1) * pageSize),
    [page, pageSize],
  );

  const refresh = useCallback(() => setReloadKey((v) => v + 1), []);

  useEffect(() => {
    if (!enabled || !projetoId) return;

    const controller = new AbortController();
    const mapper = rowMapper ?? defaultRowMapper<T>;

    (async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const [projeto, forms] = await Promise.all([
          getProjetoById(projetoId, controller.signal),
          getFormsByProjeto(projetoId, controller.signal),
        ]);

        const selectedFormVersion = resolveFormVersion(forms, formId);
        const select = buildRawSelect(selectedFormVersion);

        const [summary, filterOptions, raw] = await Promise.all([
          getMetricSummary(
            {
              projetoId,
              formVersionId: selectedFormVersion?.id,
              rangeStart,
              rangeEnd,
              limitTopThemes: 5,
              limitTopNeighborhoods: 5,
            },
            controller.signal,
          ),
          getMetricFilters(
            {
              projetoId,
              formVersionId: selectedFormVersion?.id,
              start: rangeStart,
              end: rangeEnd,
              limit: 200,
            },
            controller.signal,
          ),
          getRawFormResponses<Record<string, unknown>>(
            {
              projetoId,
              formVersionId: selectedFormVersion?.id,
              start: rangeStart,
              end: rangeEnd,
              limit: pageSize,
              offset,
              includeDates: true,
              select,
            },
            controller.signal,
          ),
        ]);

        const rows = raw.items.map((row, idx) => mapper(row, raw.offset + idx));

        setState({
          loading: false,
          error: null,
          projeto,
          forms,
          selectedFormVersion,
          summary,
          filterOptions,
          rows,
          total: raw.total,
        });
      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
          return;
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getErrorMessage(error),
        }));
      }
    })();

    return () => controller.abort();
  }, [
    enabled,
    projetoId,
    formId,
    pageSize,
    offset,
    rangeStart,
    rangeEnd,
    rowMapper,
    reloadKey,
  ]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.total / pageSize)),
    [state.total, pageSize],
  );

  return {
    ...state,
    totalPages,
    refresh,
  };
}
