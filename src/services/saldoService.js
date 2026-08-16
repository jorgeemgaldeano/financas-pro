// saldoService.js — v0.3.35 (DEC-0036 / E4)
//
// Extração de `movimentoContaMes`/`getSaldoInicialConta` (antes inline em
// `App.jsx:2201-2221`) para fora do componente, com o algoritmo trocado de
// O(C×M×N) (recursão mês a mês, cada passo refiltrando todo `trans`) para
// O(N + C×M): agrupa `trans` por (contaId, mês) numa passada única (O(N)),
// e resolve o saldo inicial de cada conta com memoização iterativa em vez
// de recursão sem cache — cada (contaId, mês) só é calculado uma vez por
// resolver, mesmo que consultado várias vezes no mesmo render.
//
// A semântica é IDÊNTICA à recursão original (testes de caracterização em
// tests/saldoService.test.js travam o comportamento antes desta extração):
// um saldo inicial manual (`saldosIniciais[mês][contaId]`) quebra a cadeia
// e vira o novo ponto de partida; sem override, o saldo do mês vem do saldo
// do mês anterior + o movimento do mês anterior; abaixo do mês-base
// (`baseSaldoMonth`) ou além de 72 meses de profundidade, cai para
// `conta.saldoInicial`.

import { monthCompare, monthOffset } from "../utils/dateUtils.js";

const MAX_DEPTH = 72;

export const transMonthKey = (t) => t.competencia || t.competenceMonth || mKeyFallback(t.data);
function mKeyFallback(value) { return (value || "").slice(0, 7); }

export const valorRealizado = (t) => {
  if (t.status === "previsto") return 0;
  if (t.status === "parcial") return Math.min(Number(t.valorPago) || 0, Number(t.valor) || 0);
  return Number(t.valor) || 0;
};

// ── Índice de movimento por conta+mês (O(N), uma passada) ────────────────
export function buildMovimentoIndex(trans) {
  const index = new Map();
  for (const t of trans) {
    if (t.origem === "cartao") continue;
    if (!t.contaId) continue;
    const monthKey = transMonthKey(t);
    if (!monthKey) continue;
    const v = valorRealizado(t);
    const signed = t.tipo === "receita" ? v : -v;
    let contaMap = index.get(t.contaId);
    if (!contaMap) { contaMap = new Map(); index.set(t.contaId, contaMap); }
    contaMap.set(monthKey, (contaMap.get(monthKey) || 0) + signed);
  }
  return index;
}

export function movimentoContaMesFromIndex(index, contaId, monthKey) {
  return index.get(contaId)?.get(monthKey) || 0;
}

// ── Resolver de saldo inicial (memoizado) ─────────────────────────────────
// Cria um resolvedor ligado a um snapshot de (trans, saldosIniciais,
// baseSaldoMonth). Reaproveitar a mesma instância entre chamadas no mesmo
// render evita o custo O(M) por conta a cada consulta.
export function createSaldoInicialResolver(trans, saldosIniciais, baseSaldoMonth) {
  const index = buildMovimentoIndex(trans);
  const cache = new Map(); // `${contaId}|${monthKey}` -> valor

  const manualAt = (monthKey, contaId) => {
    const manual = saldosIniciais?.[monthKey]?.[contaId];
    return manual !== undefined && manual !== null && manual !== "" ? Number(manual) || 0 : undefined;
  };

  function resolve(ct, monthKey) {
    const cacheKey = `${ct.id}|${monthKey}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const manual = manualAt(monthKey, ct.id);
    if (manual !== undefined) {
      cache.set(cacheKey, manual);
      return manual;
    }
    if (monthCompare(monthKey, baseSaldoMonth) <= 0) {
      const value = Number(ct.saldoInicial) || 0;
      cache.set(cacheKey, value);
      return value;
    }

    // Caminha para trás até achar um ponto já resolvido/anchorado (cache,
    // override manual, ou o piso de baseSaldoMonth/profundidade máxima).
    const path = [monthKey];
    let cursor = monthKey;
    let anchorValue;
    for (let depth = 0; ; depth++) {
      const prevKey = monthOffset(cursor, -1);
      const prevCacheKey = `${ct.id}|${prevKey}`;
      if (cache.has(prevCacheKey)) { anchorValue = cache.get(prevCacheKey); cursor = prevKey; break; }
      const prevManual = manualAt(prevKey, ct.id);
      if (prevManual !== undefined) { anchorValue = prevManual; cache.set(prevCacheKey, anchorValue); cursor = prevKey; break; }
      if (monthCompare(prevKey, baseSaldoMonth) <= 0 || depth >= MAX_DEPTH) {
        anchorValue = Number(ct.saldoInicial) || 0;
        cache.set(prevCacheKey, anchorValue);
        cursor = prevKey;
        break;
      }
      path.push(prevKey);
      cursor = prevKey;
    }

    // Dobra para frente do ancoradouro até o mês pedido, preenchendo o cache.
    let value = anchorValue;
    let monthCursor = cursor;
    for (let i = path.length - 1; i >= 0; i--) {
      value = value + movimentoContaMesFromIndex(index, ct.id, monthCursor);
      cache.set(`${ct.id}|${path[i]}`, value);
      monthCursor = path[i];
    }
    return cache.get(cacheKey);
  }

  return {
    getSaldoInicialConta: resolve,
    movimentoContaMes: (ct, monthKey) => movimentoContaMesFromIndex(index, ct.id, monthKey),
  };
}
