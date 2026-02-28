type GenericRecord = Record<string, unknown>;

type ThemeProjectSource = {
  id?: unknown;
  projetoId?: unknown;
  projeto?: unknown;
  temasDoProjeto?: unknown;
  metrics?: unknown;
  responsesByTheme?: unknown;
  allowedThemes?: unknown;
  temasPermitidos?: unknown;
  hiddenTabs?: unknown;
};

export const NO_THEME_ACCESS_VALUE = "__codex_no_theme_access__";

export const normalizeAccessKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export const normalizeStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = new Set<string>();
  const items: string[] = [];

  value.forEach((item) => {
    if (typeof item !== "string") {
      return;
    }

    const label = item.trim();
    if (!label) {
      return;
    }

    const key = normalizeAccessKey(label);
    if (!key || normalized.has(key)) {
      return;
    }

    normalized.add(key);
    items.push(label);
  });

  return items;
};

export const toScreenToken = (value: string) =>
  value.trim().replace(/^\/+/, "").replace(/\/+$/, "");

export const isScreenHidden = (hiddenTabs: unknown, screen: string) => {
  const target = toScreenToken(screen);
  return normalizeStringList(hiddenTabs).some(
    (hiddenScreen) => toScreenToken(hiddenScreen) === target,
  );
};

export const buildThemeRoutePath = (theme: string) =>
  `/relatorio-opiniao/tema/${encodeURIComponent(theme)}`;

const asRecord = (value: unknown): GenericRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as GenericRecord)
    : {};

export const getProjectIdFromSource = (source: unknown): number | null => {
  if (!source || typeof source !== "object") {
    return null;
  }

  const entry = source as ThemeProjectSource;
  if (typeof entry.id === "number") return entry.id;
  if (typeof entry.projetoId === "number") return entry.projetoId;

  if (entry.projeto && typeof entry.projeto === "object") {
    return getProjectIdFromSource(entry.projeto);
  }

  return null;
};

const pushTheme = (collection: string[], theme: unknown) => {
  if (typeof theme !== "string") {
    return;
  }

  const label = theme.trim();
  if (!label) {
    return;
  }

  const key = normalizeAccessKey(label);
  const alreadyIncluded = collection.some(
    (entry) => normalizeAccessKey(entry) === key,
  );
  if (!alreadyIncluded) {
    collection.push(label);
  }
};

export const extractThemesFromProject = (source: unknown): string[] => {
  if (!source || typeof source !== "object") {
    return [];
  }

  const entry = source as ThemeProjectSource;
  const themes: string[] = [];

  normalizeStringList(entry.temasDoProjeto).forEach((theme) =>
    pushTheme(themes, theme),
  );

  normalizeStringList((entry as GenericRecord).temas).forEach((theme) =>
    pushTheme(themes, theme),
  );

  normalizeStringList((entry as GenericRecord).themes).forEach((theme) =>
    pushTheme(themes, theme),
  );

  const responsesByTheme =
    Array.isArray(entry.responsesByTheme)
      ? entry.responsesByTheme
      : Array.isArray(asRecord(entry.metrics).responsesByTheme)
        ? (asRecord(entry.metrics).responsesByTheme as unknown[])
        : [];

  responsesByTheme.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const row = item as GenericRecord;
    pushTheme(themes, row.tema ?? row.label ?? row.theme ?? row.name);
  });

  if (entry.projeto && typeof entry.projeto === "object") {
    extractThemesFromProject(entry.projeto).forEach((theme) =>
      pushTheme(themes, theme),
    );
  }

  return themes;
};

const getUserProjectEntries = (user: unknown): unknown[] => {
  if (!user || typeof user !== "object") {
    return [];
  }

  const source = user as GenericRecord;
  const entries: unknown[] = [];

  if (source.projeto && typeof source.projeto === "object") {
    entries.push(source.projeto);
  }

  if (Array.isArray(source.projetos)) {
    source.projetos.forEach((projectEntry) => {
      if (projectEntry && typeof projectEntry === "object") {
        entries.push(projectEntry);
      }
    });
  }

  return entries;
};

export const getAccessibleProjectIds = (user: unknown): number[] => {
  const ids = new Set<number>();

  getUserProjectEntries(user).forEach((entry) => {
    const id = getProjectIdFromSource(entry);
    if (typeof id === "number") {
      ids.add(id);
    }
  });

  return Array.from(ids);
};

const findProjectEntry = (user: unknown, projectId: number | null) => {
  if (typeof projectId !== "number") {
    return null;
  }

  return (
    getUserProjectEntries(user).find(
      (entry) => getProjectIdFromSource(entry) === projectId,
    ) ?? null
  );
};

const getThemesFromEntryField = (entry: unknown) => {
  if (!entry || typeof entry !== "object") {
    return [];
  }

  const record = entry as GenericRecord;
  return normalizeStringList(
    record.allowedThemes ??
      record.temasPermitidos ??
      record.permittedThemes ??
      record.themeScopes,
  );
};

export const getProjectAllowedThemes = (
  user: unknown,
  projectId: number | null,
) => {
  const entry = findProjectEntry(user, projectId);
  if (!entry) {
    return [];
  }

  const directThemes = getThemesFromEntryField(entry);
  if (directThemes.length) {
    return directThemes;
  }

  const nestedThemes = getThemesFromEntryField(asRecord(entry).projeto);
  if (nestedThemes.length) {
    return nestedThemes;
  }

  return [];
};

export const getProjectHiddenTabs = (user: unknown, projectId: number | null) => {
  const entry = findProjectEntry(user, projectId);
  if (!entry || typeof entry !== "object") {
    return [];
  }

  const record = entry as GenericRecord;
  const directTabs = normalizeStringList(record.hiddenTabs);
  if (directTabs.length) {
    return directTabs;
  }

  return normalizeStringList(asRecord(record.projeto).hiddenTabs);
};

export const filterThemesByScope = (
  themes: string[],
  allowedThemes: string[],
) => {
  if (!allowedThemes.length) {
    return themes;
  }

  const allowedKeys = new Set(allowedThemes.map((theme) => normalizeAccessKey(theme)));
  return themes.filter((theme) => allowedKeys.has(normalizeAccessKey(theme)));
};

export const hasThemeAccess = (theme: string, allowedThemes: string[]) => {
  if (!allowedThemes.length) {
    return true;
  }

  const themeKey = normalizeAccessKey(theme);
  return allowedThemes.some(
    (allowedTheme) => normalizeAccessKey(allowedTheme) === themeKey,
  );
};

export const filterOptionsByAllowedThemes = <
  T extends { label?: string; value?: string },
>(
  options: T[],
  allowedThemes: string[],
) => {
  if (!allowedThemes.length) {
    return options;
  }

  return options.filter((option) => {
    const candidate = option.value ?? option.label ?? "";
    return hasThemeAccess(candidate, allowedThemes);
  });
};

export const mergeRequestedThemesWithScope = (
  requestedThemes: string | string[] | undefined,
  allowedThemes: string[],
) => {
  if (!allowedThemes.length) {
    return requestedThemes;
  }

  if (requestedThemes === undefined) {
    return allowedThemes;
  }

  if (typeof requestedThemes === "string") {
    return hasThemeAccess(requestedThemes, allowedThemes)
      ? requestedThemes
      : NO_THEME_ACCESS_VALUE;
  }

  const scopedThemes = filterThemesByScope(requestedThemes, allowedThemes);
  return scopedThemes.length ? scopedThemes : [NO_THEME_ACCESS_VALUE];
};

const getStoredProjectContext = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawContext = localStorage.getItem("projectContext");
  if (!rawContext) {
    return null;
  }

  try {
    return JSON.parse(rawContext) as GenericRecord;
  } catch {
    return null;
  }
};

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as GenericRecord;
  } catch {
    return null;
  }
};

export const getStoredAllowedThemes = (projectId?: number | null) => {
  const storedProject = getStoredProjectContext();
  const requestedProjectId =
    typeof projectId === "number"
      ? projectId
      : getProjectIdFromSource(storedProject ?? undefined);

  const contextProjectId = getProjectIdFromSource(storedProject ?? undefined);
  if (
    storedProject &&
    typeof requestedProjectId === "number" &&
    contextProjectId === requestedProjectId
  ) {
    const contextThemes = getThemesFromEntryField(storedProject);
    if (contextThemes.length) {
      return contextThemes;
    }
  }

  const user = getStoredUser();
  return getProjectAllowedThemes(user, requestedProjectId ?? null);
};

export const getStoredHiddenTabs = (projectId?: number | null) => {
  const storedProject = getStoredProjectContext();
  const requestedProjectId =
    typeof projectId === "number"
      ? projectId
      : getProjectIdFromSource(storedProject ?? undefined);

  const contextProjectId = getProjectIdFromSource(storedProject ?? undefined);
  if (
    storedProject &&
    typeof requestedProjectId === "number" &&
    contextProjectId === requestedProjectId
  ) {
    const contextTabs = normalizeStringList(storedProject.hiddenTabs);
    if (contextTabs.length) {
      return contextTabs;
    }
  }

  const user = getStoredUser();
  return getProjectHiddenTabs(user, requestedProjectId ?? null);
};
