import { useCallback, useState } from "react";
import { LS_PREFIX } from "../constants/storageKeys.js";

export function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSave(key, value) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch {}
}

export function useLS(key, init) {
  const [val, setVal] = useState(() => lsGet(key, init));

  const set = useCallback(updater => {
    setVal(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      lsSave(key, next);
      return next;
    });
  }, [key]);

  return [val, set];
}
