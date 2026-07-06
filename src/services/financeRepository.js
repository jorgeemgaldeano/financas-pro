import { LS_PREFIX, LS_VERSION } from "../constants/storageKeys.js";

function storageKey(key) {
  if (!key) throw new Error("Chave de armazenamento não informada.");
  return String(key).startsWith(LS_PREFIX) ? String(key) : `${LS_PREFIX}${key}`;
}

// v0.3.26.7 — E7: o prefixo carrega a versão do schema (`fpro_v1_`). Antes desta
// correção, subir LS_VERSION mudava TODAS as chaves e órfãva 100% dos dados do
// usuário silenciosamente. Aqui, ao ler uma chave inexistente no prefixo atual,
// procuramos a mesma chave lógica em prefixos de versões ANTERIORES e migramos.
const LEGACY_PREFIX_RE = /^fpro_v(\d+)_/;

function logicalName(key) {
  const full = storageKey(key);
  return full.startsWith(LS_PREFIX) ? full.slice(LS_PREFIX.length) : String(key);
}

function findLegacyRaw(logical) {
  try {
    let best = null; // { version, rawKey }
    for (let i = 0; i < localStorage.length; i++) {
      const storedKey = localStorage.key(i);
      if (!storedKey) continue;
      const match = storedKey.match(LEGACY_PREFIX_RE);
      if (!match) continue;
      const version = Number(match[1]);
      if (version >= LS_VERSION) continue; // só versões anteriores
      if (storedKey.slice(match[0].length) !== logical) continue;
      if (!best || version > best.version) best = { version, rawKey: storedKey };
    }
    return best;
  } catch {
    return null;
  }
}

// Retorna o valor bruto (string) da chave atual; se ausente, tenta migrar do
// prefixo legado mais recente e grava sob o prefixo atual (migração preguiçosa).
function readRawWithMigration(key) {
  const fullKey = storageKey(key);
  const current = localStorage.getItem(fullKey);
  if (current !== null) return current;

  const legacy = findLegacyRaw(logicalName(key));
  if (!legacy) return null;

  const legacyValue = localStorage.getItem(legacy.rawKey);
  if (legacyValue === null) return null;

  try {
    localStorage.setItem(fullKey, legacyValue); // promove para o prefixo atual
  } catch {
    // Se não puder gravar (quota), ainda devolvemos o valor legado para leitura.
  }
  return legacyValue;
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
      return safeParse(readRawWithMigration(key), fallback);
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
