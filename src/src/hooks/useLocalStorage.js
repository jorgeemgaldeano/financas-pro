import { useCallback, useState } from "react";
import { localFinanceRepository } from "../services/financeRepository.js";

// v0.3.26.7 — L6: antes, uma falha de gravação (ex.: QuotaExceededError) era
// engolida: o estado React atualizava em memória, a UI refletia a mudança, mas
// o LocalStorage nunca gravava — e o dado sumia no reload, sem aviso. Agora
// qualquer falha de persistência é propagada a um handler registrável, para que
// a aplicação avise o usuário e sugira backup.
let persistErrorHandler = null;

export function onPersistError(handler) {
  persistErrorHandler = typeof handler === "function" ? handler : null;
  return () => { if (persistErrorHandler === handler) persistErrorHandler = null; };
}

function notifyPersistError(key) {
  try {
    if (persistErrorHandler) persistErrorHandler({ key });
  } catch {}
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fpro:persist-error", { detail: { key } }));
    }
  } catch {}
}

export function lsGet(key, fallback = null) {
  return localFinanceRepository.get(key, fallback);
}

export function lsSave(key, value) {
  const ok = localFinanceRepository.set(key, value);
  if (!ok) notifyPersistError(key);
  return ok;
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
