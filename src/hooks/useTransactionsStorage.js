// useTransactionsStorage.js — v0.3.28
//
// Substituto pontual de `useLS("trans", INIT_TRANS)`. Mesma assinatura e
// mesmo comportamento de persistência (delega a useLS), mas aplica a
// migração/normalização de `transactionNormalizer` + `migrationPipeline` na
// LEITURA inicial — antes de o primeiro render acontecer com dados
// inconsistentes (mesmo princípio do E7: normalizar na fronteira, não
// espalhar pelos pontos de uso).
//
// Escopo deliberadamente pequeno: troca uma linha no App.jsx
// (`useLS("trans", ...)` → `useTransactionsStorage(...)`), sem tocar em mais
// nada da árvore de componentes.

import { useLS } from "./useLocalStorage.js";
import { migrateTransactions } from "../services/migrationPipeline.js";

export function useTransactionsStorage(initialValue) {
  const [trans, setTrans] = useLS("trans", initialValue);

  // Idempotente e barato: normalizeTransactions só recria objetos que
  // realmente precisam de correção, preservando identidade referencial dos
  // demais (não invalida useMemo desnecessariamente).
  const { data: normalized } = migrateTransactions(trans, 0);

  // Se a normalização mudou algo em relação ao que está persistido, grava a
  // versão corrigida de volta — assim a correção acontece uma vez por sessão
  // (não a cada render) e o LocalStorage fica consistente para a próxima leitura.
  if (normalized !== trans) {
    setTrans(normalized);
    return [normalized, setTrans];
  }

  return [trans, setTrans];
}
