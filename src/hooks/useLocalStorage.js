import { useCallback, useState } from "react";
import { localFinanceRepository } from "../services/financeRepository.js";
import { stampChangedRecords } from "../services/recordStamp.js";

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
  } catch { /* handler do app falhou: nao pode derrubar a gravacao */ }
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fpro:persist-error", { detail: { key } }));
    }
  } catch { /* CustomEvent indisponivel (ambiente sem window): erro ja foi notificado acima */ }
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

// v0.3.38 Fase 1 — o carimbo `updatedAt`/`updatedBy` é aplicado aqui, na
// fronteira de persistência, e não em cada ponto que chama um setter: o
// `App.jsx` tem dezenas deles e o esquecido só apareceria na Fase 4, como
// conflito que o merge não sabe resolver. `stampChangedRecords` recebe o par
// (anterior, próximo) e só marca o que de fato mudou.
//
// `opcoes.stamp === false` desliga o carimbo para escritas que NÃO são edição
// do usuário: restauração de backup (precisa preservar as datas gravadas no
// arquivo) e normalização de leitura (correção automática de formato).
export function useLS(key, initialValue) {
  const [value, setValue] = useState(() => lsGet(key, initialValue));

  const setAndPersist = useCallback((nextValueOrUpdater, opcoes) => {
    setValue(previousValue => {
      const rawValue = typeof nextValueOrUpdater === "function"
        ? nextValueOrUpdater(previousValue)
        : nextValueOrUpdater;

      const nextValue = opcoes?.stamp === false
        ? rawValue
        : stampChangedRecords(rawValue, previousValue);

      lsSave(key, nextValue);
      return nextValue;
    });
  }, [key]);

  return [value, setAndPersist];
}
