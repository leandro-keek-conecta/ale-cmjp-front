import type { FilterFormValues, FiltersState } from "../@types/filter";

type FilterFn<T> = (items: T[], value: any) => T[];

const faixaEtariaMap: Record<string, { min: number; max: number }> = {
  "At\u00e9 17": { min: 0, max: 17 },
  "18-24": { min: 18, max: 24 },
  "25-34": { min: 25, max: 34 },
  "35-44": { min: 35, max: 44 },
  "45-54": { min: 45, max: 54 },
  "55-64": { min: 55, max: 64 },
  "65+": { min: 65, max: 200 },
};

const getFaixaEtariaRange = (value?: string | null) =>
  value ? faixaEtariaMap[value] ?? null : null;

const getBirthYear = (item: any) => {
  const raw =
    item?.ano_nascimento ??
    item?.usuario?.ano_nascimento ??
    item?.user?.ano_nascimento ??
    "";
  const year = Number(String(raw).slice(0, 4));
  return Number.isFinite(year) ? year : null;
};

const toDate = (value: unknown) => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

const getDistrict = (item: any) => {
  const raw =
    item?.bairro ??
    item?.usuario?.bairro ??
    item?.user?.bairro ??
    item?.usuario?.endereco?.bairro ??
    item?.user?.endereco?.bairro ??
    item?.endereco?.bairro ??
    "";
  return String(raw ?? "");
};

export const mapFilterFormToState = (
  form: FilterFormValues,
): FiltersState => ({
  data: (() => {
    const inicio = toDate(form.dataInicio);
    const fim = toDate(form.dataFim);
    return inicio && fim ? { inicio, fim } : undefined;
  })(),
  tipo: form.tipo || undefined,
  tema: form.tema || undefined,
  genero: form.genero || undefined,
  bairro: form.bairro || undefined,
  faixaEtaria: getFaixaEtariaRange(form.faixaEtaria),
  texto: form.texto_opiniao || undefined,
});

export const filterMappers: Record<string, FilterFn<any>> = {
  data: (items, value) => {
    if (!value?.inicio || !value?.fim) return items;

    const inicio = toDate(value.inicio);
    const fim = toDate(value.fim);
    if (!inicio || !fim) return items;
    const start = inicio.getTime();
    const end = fim.getTime();

    return items.filter((i) => {
      const rawDate =
        i?.criadoEm ??
        i?.horario ??
        i?.horario_opiniao ??
        i?.createdAt ??
        i?.data;
      const parsed = rawDate ? new Date(rawDate) : null;
      if (!parsed || Number.isNaN(parsed.getTime())) return false;
      const time = parsed.getTime();
      return time >= start && time <= end;
    });
  },

  genero: (items, genero) =>
    genero
      ? items.filter(
          (i) => normalizeText(i.genero) === normalizeText(genero),
        )
      : items,

  bairro: (items, bairro) => {
    const query = normalizeText(bairro);
    if (!query) return items;
    return items.filter((i) =>
      normalizeText(getDistrict(i)).includes(query),
    );
  },

  tipo: (items, tipo) =>
    tipo
      ? items.filter(
          (i) => normalizeText(i.tipo_opiniao) === normalizeText(tipo),
        )
      : items,

  tema: (items, tema) =>
    tema
      ? items.filter(
          (i) => normalizeText(i.opiniao) === normalizeText(tema),
        )
      : items,

  faixaEtaria: (items, faixaEtaria) => {
    if (!faixaEtaria) return items;
    const now = new Date();
    return items.filter((item) => {
      const year = getBirthYear(item);
      if (!year) return false;
      const age = now.getFullYear() - year;
      return age >= faixaEtaria.min && age <= faixaEtaria.max;
    });
  },

  texto: (items, texto) =>
    texto
      ? items.filter((i) =>
          normalizeText(i.texto_opiniao).includes(normalizeText(texto)),
        )
      : items,
};

export function applyFilters<T>(items: T[], filters: FiltersState): T[] {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    const fn = filterMappers[key];
    return fn ? fn(acc, value) : acc;
  }, items);
}
