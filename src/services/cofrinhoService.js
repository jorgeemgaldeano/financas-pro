// cofrinhoService.js — v0.3.34 (DEC-0035 / RN032)
//
// Cofrinho: objetivo de poupança com valor-alvo e data-alvo, ledger próprio
// de aportes/retiradas — desacoplado de `trans` (decisão do usuário em
// DEC-0035, mesmo sendo contabilmente menos "correto"). Não confundir com
// Metas (`metas[catId]`, orçamento por categoria).
//
// Padrão do projeto (ver CLAUDE.md): funções PURAS que recebem o estado
// relevante e devolvem o SNAPSHOT COMPLETO de `cofrinhos`, para o App
// aplicar num único setCofrinhos (operação atômica).

import { monthsBetween } from "../utils/dateUtils.js";

const fallbackUid = () =>
  "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 11);

// ── Saldo do ledger ──────────────────────────────────────────────────────
// Saldo = soma dos aportes − retiradas (RN032).
export function saldoCofrinho(cofrinho) {
  const aportes = cofrinho?.aportes || [];
  return aportes.reduce((sum, a) => {
    const v = Number(a?.valor) || 0;
    return sum + (a?.tipo === "retirada" ? -v : v);
  }, 0);
}

// ── Status (3 estados — RN032) ──────────────────────────────────────────
// "concluido": saldoAtual >= valorAlvo.
// "atrasado": dataAlvo já é o mês de referência ou passou, meta não atingida.
// "em_dia": caso normal.
export function statusCofrinho(cofrinho, refMonthKey) {
  const valorAlvo = Number(cofrinho?.valorAlvo) || 0;
  const saldoAtual = saldoCofrinho(cofrinho);
  if (valorAlvo > 0 && saldoAtual >= valorAlvo) return "concluido";

  const dataAlvoMonth = String(cofrinho?.dataAlvo || "").slice(0, 7);
  if (dataAlvoMonth && monthsBetween(refMonthKey, dataAlvoMonth) <= 0) return "atrasado";
  return "em_dia";
}

// ── Simulação de aporte mensal (RN032/DEC-0035) ─────────────────────────
// "Em dia": (valorAlvo − saldoAtual) / meses até a dataAlvo.
// "Concluído": sem sugestão de aporte.
// "Atrasado": recalcula como se a meta fosse o mês seguinte ao de
// referência — nunca divide por zero, nunca mostra valor negativo.
// retorno: { status, saldoAtual, valorAlvo, restante, mesesRestantes, aporteSugerido, projecaoMes }
export function simularAporteMensal(cofrinho, refMonthKey) {
  const valorAlvo = Number(cofrinho?.valorAlvo) || 0;
  const saldoAtual = saldoCofrinho(cofrinho);
  const status = statusCofrinho(cofrinho, refMonthKey);
  const restante = Math.max(valorAlvo - saldoAtual, 0);

  if (status === "concluido") {
    return { status, saldoAtual, valorAlvo, restante: 0, mesesRestantes: 0, aporteSugerido: 0, projecaoMes: null };
  }

  const dataAlvoMonth = String(cofrinho?.dataAlvo || "").slice(0, 7);
  const mesesRestantes =
    status === "atrasado" ? 1 : Math.max(monthsBetween(refMonthKey, dataAlvoMonth), 1);
  const aporteSugerido = restante / mesesRestantes;
  const [refY, refM] = refMonthKey.split("-").map(Number);
  const projecaoDate = new Date(refY, refM - 1 + mesesRestantes, 1);
  const projecaoMes = `${projecaoDate.getFullYear()}-${String(projecaoDate.getMonth() + 1).padStart(2, "0")}`;

  return { status, saldoAtual, valorAlvo, restante, mesesRestantes, aporteSugerido, projecaoMes };
}

// ── CRUD de cofrinho ─────────────────────────────────────────────────────
// state: { cofrinhos }
// opts:  { nome, valorAlvo, dataAlvo, uid }
// retorno: { ok:true, id, cofrinhos } | { ok:false, reason }
export function createCofrinho(state, opts) {
  const { cofrinhos = [] } = state || {};
  const uid = opts?.uid || fallbackUid;
  const nome = String(opts?.nome || "").trim();
  const valorAlvo = Number(opts?.valorAlvo) || 0;
  const dataAlvo = opts?.dataAlvo || "";

  if (!nome) return { ok: false, reason: "missing_name" };
  if (valorAlvo <= 0) return { ok: false, reason: "invalid_amount" };
  if (!dataAlvo) return { ok: false, reason: "missing_date" };

  const id = uid();
  const item = { id, nome, valorAlvo, dataAlvo, aportes: [], arquivado: false };
  return { ok: true, id, cofrinhos: [...cofrinhos, item] };
}

export function deleteCofrinho(state, opts) {
  const { cofrinhos = [] } = state || {};
  const { id } = opts || {};
  if (!cofrinhos.some((c) => c.id === id)) return { ok: false, reason: "not_found" };
  return { ok: true, cofrinhos: cofrinhos.filter((c) => c.id !== id) };
}

export function setArquivadoCofrinho(state, opts) {
  const { cofrinhos = [] } = state || {};
  const { id, arquivado } = opts || {};
  if (!cofrinhos.some((c) => c.id === id)) return { ok: false, reason: "not_found" };
  return {
    ok: true,
    cofrinhos: cofrinhos.map((c) => (c.id === id ? { ...c, arquivado: Boolean(arquivado) } : c)),
  };
}

// ── Aporte / retirada ────────────────────────────────────────────────────
// state: { cofrinhos }
// opts:  { cofrinhoId, valor, data, tipo:"aporte"|"retirada", uid }
// Retirada não pode deixar o saldo negativo (DEC-0035, item 4).
export function addMovimentoCofrinho(state, opts) {
  const { cofrinhos = [] } = state || {};
  const { cofrinhoId, data, tipo } = opts || {};
  const uid = opts?.uid || fallbackUid;
  const valor = Number(opts?.valor) || 0;

  const cofrinho = cofrinhos.find((c) => c.id === cofrinhoId);
  if (!cofrinho) return { ok: false, reason: "not_found" };
  if (valor <= 0) return { ok: false, reason: "invalid_amount" };
  if (!data) return { ok: false, reason: "missing_date" };
  if (tipo !== "aporte" && tipo !== "retirada") return { ok: false, reason: "invalid_type" };
  if (tipo === "retirada" && valor > saldoCofrinho(cofrinho)) {
    return { ok: false, reason: "insufficient_balance" };
  }

  const movimento = { id: uid(), data, valor, tipo };
  return {
    ok: true,
    cofrinhos: cofrinhos.map((c) =>
      c.id === cofrinhoId ? { ...c, aportes: [...c.aportes, movimento] } : c
    ),
  };
}

export function removeMovimentoCofrinho(state, opts) {
  const { cofrinhos = [] } = state || {};
  const { cofrinhoId, movimentoId } = opts || {};
  const cofrinho = cofrinhos.find((c) => c.id === cofrinhoId);
  if (!cofrinho) return { ok: false, reason: "not_found" };
  if (!cofrinho.aportes.some((a) => a.id === movimentoId)) return { ok: false, reason: "not_found" };

  return {
    ok: true,
    cofrinhos: cofrinhos.map((c) =>
      c.id === cofrinhoId ? { ...c, aportes: c.aportes.filter((a) => a.id !== movimentoId) } : c
    ),
  };
}
