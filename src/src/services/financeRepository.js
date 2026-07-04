import { LS_PREFIX } from "../constants/storageKeys.js";

function storageKey(key) {
  if (!key) throw new Error("Chave de armazenamento não informada.");
  return String(key).startsWith(LS_PREFIX) ? String(key) : `${LS_PREFIX}${key}`;
}

function cloneFallback(fallback) {
  if (Array.isArray(fallback)) return [...fallback];
  if (fallback && typeof fallback === "object") return { ...fallback };
  return fallback;
}

function safeParse(raw, fallback) {
  if (raw === null || raw === undefined) return cloneFallback(fallback);
  try {
    return JSON.parse(raw);
  } catch {
    return cloneFallback(fallback);
  }
}

export const localFinanceRepository = {
  key: storageKey,

  get(key, fallback = null) {
    try {
      return safeParse(localStorage.getItem(storageKey(key)), fallback);
    } catch {
      return cloneFallback(fallback);
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(storageKey(key), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(storageKey(key));
      return true;
    } catch {
      return false;
    }
  },

  exists(key) {
    try {
      return localStorage.getItem(storageKey(key)) !== null;
    } catch {
      return false;
    }
  },

  snapshot(keys = []) {
    const result = {};
    try {
      keys.forEach(key => {
        const fullKey = storageKey(key);
        const value = localStorage.getItem(fullKey);
        if (value !== null) result[fullKey] = value;
      });
    } catch {}
    return result;
  },

  clearByPrefix(prefix = LS_PREFIX) {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .forEach(key => localStorage.removeItem(key));
      return true;
    } catch {
      return false;
    }
  },
};

export function repositoryGet(key, fallback = null) {
  return localFinanceRepository.get(key, fallback);
}

export function repositorySet(key, value) {
  return localFinanceRepository.set(key, value);
}

export function repositoryRemove(key) {
  return localFinanceRepository.remove(key);
}
