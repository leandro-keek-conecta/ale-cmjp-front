type OpinionByDate = {
  date: string | Date;
  count: number;
};

type OpinionByMonth = {
  label: string;
  value: number;
};

type OpinionByMonthInput = OpinionByDate | OpinionByMonth;

type OpinionByDayInput =
  | {
      label: string | Date;
      value: number;
    }
  | {
      date: string | Date;
      count: number;
    };

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const MONTH_SHORTS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

type MonthKey = {
  year: number | null;
  monthIndex: number;
};

const normalizeMonthKey = (input: string | Date): MonthKey | null => {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return { year: input.getFullYear(), monthIndex: input.getMonth() };
  }

  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d{2}|\d{4})-(\d{1,2})(?:-\d{1,2})?/);
  if (match) {
    let yearNumber = Number(match[1]);
    const monthNumber = Number(match[2]);
    if (!Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return null;
    }
    if (Number.isFinite(yearNumber) && yearNumber < 100) {
      yearNumber += 2000;
    }
    return {
      year: Number.isFinite(yearNumber) ? yearNumber : null,
      monthIndex: monthNumber - 1,
    };
  }

  const normalized = trimmed
    .toLowerCase()
    .replace(".", "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const shortIndex = MONTH_SHORTS.indexOf(normalized);
  if (shortIndex >= 0) return { year: null, monthIndex: shortIndex };

  const nameIndex = MONTH_NAMES.indexOf(normalized);
  if (nameIndex >= 0) return { year: null, monthIndex: nameIndex };

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return { year: parsed.getFullYear(), monthIndex: parsed.getMonth() };
};

const extractMonthAndValue = (item: OpinionByMonthInput) => {
  if ("label" in item && "value" in item) {
    const monthKey = normalizeMonthKey(item.label);
    if (!monthKey) return null;
    return { ...monthKey, value: toNumber(item.value) };
  }

  if ("date" in item && "count" in item) {
    const monthKey = normalizeMonthKey(item.date);
    if (!monthKey) return null;
    return { ...monthKey, value: toNumber(item.count) };
  }

  return null;
};

type DateParts = {
  year: number;
  monthIndex: number;
  day: number;
};

const parseDateParts = (input: string | Date): DateParts | null => {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return {
      year: input.getFullYear(),
      monthIndex: input.getMonth(),
      day: input.getDate(),
    };
  }

  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(
    /^(\d{2}|\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/,
  );
  if (match) {
    let yearNumber = Number(match[1]);
    const monthNumber = Number(match[2]);
    const dayNumber = Number(match[3]);

    if (!Number.isFinite(yearNumber)) return null;
    if (!Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return null;
    }
    if (!Number.isFinite(dayNumber) || dayNumber < 1 || dayNumber > 31) {
      return null;
    }
    if (yearNumber < 100) {
      yearNumber += 2000;
    }

    return {
      year: yearNumber,
      monthIndex: monthNumber - 1,
      day: dayNumber,
    };
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    year: parsed.getFullYear(),
    monthIndex: parsed.getMonth(),
    day: parsed.getDate(),
  };
};

const formatDayMonthLabel = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

const formatDateKey = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export function normalizeOpinionsByDay(
  data: OpinionByDayInput[] | null | undefined,
): OpinionByMonth[] {
  if (!Array.isArray(data)) return [];

  const parsedEntries: Array<{
    year: number | null;
    monthIndex: number | null;
    day: number;
    value: number;
  }> = [];

  data.forEach((item) => {
    if ("label" in item && "value" in item) {
      const label = item.label;
      if (typeof label === "string") {
        const trimmed = label.trim();
        const dayOnlyMatch = trimmed.match(/^(\d{1,2})$/);
        if (dayOnlyMatch) {
          const dayNumber = Number(dayOnlyMatch[1]);
          if (dayNumber >= 1 && dayNumber <= 31) {
            parsedEntries.push({
              year: null,
              monthIndex: null,
              day: dayNumber,
              value: toNumber(item.value),
            });
          }
          return;
        }
      }

      const parsed = parseDateParts(item.label);
      if (!parsed) return;
      parsedEntries.push({
        year: parsed.year,
        monthIndex: parsed.monthIndex,
        day: parsed.day,
        value: toNumber(item.value),
      });
      return;
    }

    if ("date" in item && "count" in item) {
      const parsed = parseDateParts(item.date);
      if (!parsed) return;
      parsedEntries.push({
        year: parsed.year,
        monthIndex: parsed.monthIndex,
        day: parsed.day,
        value: toNumber(item.count),
      });
    }
  });

  if (parsedEntries.length === 0) return [];

  const hasMonth = (
    entry: (typeof parsedEntries)[number],
  ): entry is { year: number; monthIndex: number; day: number; value: number } =>
    entry.year !== null && entry.monthIndex !== null;

  const entriesWithMonth = parsedEntries.filter(hasMonth);

  if (entriesWithMonth.length === 0) {
    return parsedEntries
      .sort((a, b) => a.day - b.day)
      .map((entry) => ({
        label: String(entry.day).padStart(2, "0"),
        value: entry.value,
      }));
  }

  const uniqueMonths = new Set(
    entriesWithMonth.map((entry) => `${entry.year}-${entry.monthIndex}`),
  );

  if (uniqueMonths.size > 1) {
    const dayMap = new Map<string, number>();
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    entriesWithMonth.forEach((entry) => {
      const date = new Date(entry.year, entry.monthIndex, entry.day);
      const key = formatDateKey(date);
      dayMap.set(key, (dayMap.get(key) ?? 0) + entry.value);

      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
    });

    if (!minDate || !maxDate) return [];

    const results: OpinionByMonth[] = [];
    const cursor = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      minDate.getDate(),
    );

    while (cursor <= maxDate) {
      const key = formatDateKey(cursor);
      results.push({
        label: formatDayMonthLabel(cursor),
        value: dayMap.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return results;
  }

  const latest = entriesWithMonth.reduce((current, entry) => {
    const currentKey =
      current.year * 10000 + current.monthIndex * 100 + current.day;
    const entryKey = entry.year * 10000 + entry.monthIndex * 100 + entry.day;
    return entryKey > currentKey ? entry : current;
  });

  const monthEntries = entriesWithMonth.filter(
    (entry) =>
      entry.year === latest.year && entry.monthIndex === latest.monthIndex,
  );

  const maxDay = monthEntries.reduce(
    (max, entry) => Math.max(max, entry.day),
    1,
  );

  const dayMap = new Map<number, number>();
  monthEntries.forEach((entry) => {
    dayMap.set(entry.day, (dayMap.get(entry.day) ?? 0) + entry.value);
  });

  return Array.from({ length: maxDay }, (_, index) => {
    const day = index + 1;
    return {
      label: String(day).padStart(2, "0"),
      value: dayMap.get(day) ?? 0,
    };
  });
}

export function groupOpinionsByMonthOnly(
  data: OpinionByMonthInput[] | null | undefined,
): OpinionByMonth[] {
  if (!Array.isArray(data)) return [];
  const map = new Map<
    string,
    { year: number | null; monthIndex: number; value: number }
  >();

  data.forEach((item) => {
    const normalized = extractMonthAndValue(item);
    if (!normalized) return;

    const monthNumber = normalized.monthIndex + 1;
    const key =
      normalized.year === null
        ? `m-${monthNumber}`
        : `${normalized.year}-${String(monthNumber).padStart(2, "0")}`;

    const previous = map.get(key);
    map.set(key, {
      year: normalized.year,
      monthIndex: normalized.monthIndex,
      value: (previous?.value ?? 0) + normalized.value,
    });
  });

  return Array.from(map.values())
    .sort((a, b) => {
      if (a.year === null && b.year === null) {
        return a.monthIndex - b.monthIndex;
      }
      if (a.year === null) return -1;
      if (b.year === null) return 1;
      return a.year * 12 + a.monthIndex - (b.year * 12 + b.monthIndex);
    })
    .map((item) => ({
      label: MONTH_SHORTS[item.monthIndex],
      value: item.value,
    }));
}
