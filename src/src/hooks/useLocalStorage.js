import { useCallback, useState } from "react";
import { localFinanceRepository } from "../services/financeRepository.js";

export function lsGet(key, fallback = null) {
  return localFinanceRepository.get(key, fallback);
}

export function lsSave(key, value) {
  return localFinanceRepository.set(key, value);
}

export function lsRemove(key) {
  return localFinanceRepository.remove(key);
}

export function useLS(key, initialValue) {
  const [value, setValue] = useState(() => lsGet(key, initialValue));

  const setAndPersist = useCallback((nextValueOrUpdater) => {
    setValue(previousValue => {
      const nextValue = typeof nextValueOrUpdater === "function"
        ? nextValueOrUpdater(previousValue)
        : nextValueOrUpdater;

      lsSave(key, nextValue);
      return nextValue;
    });
  }, [key]);

  return [value, setAndPersist];
}
