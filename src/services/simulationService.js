// simulationService.js — v0.3.37 (item original do backlog + Fase 4/DEC-0038)
//
// Extraído de App.jsx: cálculo de simulações (compra hipotética sem afetar
// lançamentos reais) — normalização de parcelas, valor de parcela e
// expansão da simulação em "transações fantasma" (`simul:true`) usadas só
// para exibição/projeção, nunca persistidas em `trans`.

import { moneyToNumber } from "../utils/moneyUtils.js";
import { addMonthsToDate, monthOffset } from "../utils/dateUtils.js";
import { getCardInvoiceCompetence } from "./cardInvoiceService.js";

export function safeMoneyAmount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return moneyToNumber(value);
}

export function normalizeSimulationInstallments(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function getSimulationInstallmentValue(sim) {
  const parcelas = normalizeSimulationInstallments(sim?.parcelas);
  const valorBase = safeMoneyAmount(sim?.valor);
  const valorParcela = sim?.modoParc === "total" ? valorBase / parcelas : valorBase;
  return Math.round((Number(valorParcela) || 0) * 100) / 100;
}

// Expande uma simulação em N "transações" de exibição (uma por parcela),
// nunca persistidas — só usadas para projeção/impacto em fatura.
export function expandSim(sim, cards = [], faturas = []) {
  if (!sim?.data) return [];

  const n = Math.max(1, parseInt(sim.parcelas, 10) || 1);
  const card = cards.find(c => c.id === sim.cartaoId);

  const vp = getSimulationInstallmentValue(sim);

  const firstCompetence = sim.faturaCompetencia || getCardInvoiceCompetence(sim.data, card, faturas);

  return Array.from({ length: n }, (_, i) => {
    const dateKey = addMonthsToDate(sim.data, i);
    const competencia = monthOffset(firstCompetence, i);
    return {
      id: sim.id + "_" + i,
      simId: sim.id,
      tipo: "despesa",
      origem: "cartao",
      cartaoId: sim.cartaoId,
      catId: sim.catId,
      descricao: sim.descricao,
      valor: parseFloat(vp.toFixed(2)),
      data: dateKey,
      competencia,
      parcela: i + 1,
      totalParcelas: n,
      simul: true,
    };
  });
}
