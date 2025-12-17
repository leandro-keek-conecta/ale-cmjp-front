// Pequenos helpers para usar localStorage sem quebrar em SSR ou erros de parse.
const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;

export function saveToStorage<T>(key: string, value: T): boolean {
  if (!hasStorage()) return false;

  try {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export function readFromStorage<T = string>(
  key: string,
  fallback?: T
): T | undefined {
  if (!hasStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch {
    return fallback;
  }
}

export function removeFromStorage(key: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // silencioso por ser helper basico
  }
}

export function clearStorage(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.clear();
  } catch {
    // silencioso por ser helper basico
  }
}