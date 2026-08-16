// transferService.js — v0.3.33 (Fase 1 — DEC-0034 / RN031)
//
// Transferência entre contas: movimento nulo, não representa receita nem
// despesa do usuário — só afeta o saldo das contas envolvidas.
//
// Modelo: duas transações ligadas por `transferId` comum. Cada perna
// mantém `tipo:"despesa"` (saída, conta origem) / `tipo:"receita"`
// (entrada, conta destino) — é o `tipo` que decide o sinal em
// `movimentoContaMes` (App.jsx), que continua olhando só para ele, sem
// alteração. `natureza:"transferencia"` é o marcador de exclusão dos
// totais de receita/despesa (App.jsx + projectionService.js), o mesmo
// padrão já usado para `natureza:"fatura_cartao"` em
// `cardInvoiceOperations.js`.
//
// Padrão do projeto (ver CLAUDE.md): funções PURAS que recebem o estado
// relevante e devolvem o SNAPSHOT COMPLETO de `trans`, para o App aplicar
// num único setTrans (operação atômica — nunca uma perna sem a outra).

import { mKey } from "../utils/dateUtils.js";

const fallbackUid = () =>
  "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 11);

// Helper de exclusão para os pontos de agregação de receita/despesa (RN031).
export const isTransfer = (t) => t?.natureza === "transferencia";

// ── Criar transferência ──────────────────────────────────────────────────
// state: { trans, contas }
// opts:  { fromAccountId, toAccountId, valor, data, descricao, uid }
// retorno: { ok:true, transferId, trans } | { ok:false, reason }
// reasons: account_not_found | same_account | invalid_amount | missing_date
export function createTransfer(state, opts) {
  const { trans = [], contas = [] } = state || {};
  const { fromAccountId, toAccountId, data } = opts || {};
  const uid = opts?.uid || fallbackUid;
  const valor = Number(opts?.valor) || 0;
  const descricao = String(opts?.descricao || "").trim() || "Transferência entre contas";

  if (!fromAccountId || !toAccountId) return { ok: false, reason: "account_not_found" };
  if (fromAccountId === toAccountId) return { ok: false, reason: "same_account" };
  if (contas.length && !contas.some((c) => c.id === fromAccountId)) {
    return { ok: false, reason: "account_not_found" };
  }
  if (contas.length && !contas.some((c) => c.id === toAccountId)) {
    return { ok: false, reason: "account_not_found" };
  }
  if (valor <= 0) return { ok: false, reason: "invalid_amount" };
  if (!data) return { ok: false, reason: "missing_date" };

  const transferId = uid();
  const competencia = mKey(data);
  const base = {
    transferId,
    natureza: "transferencia",
    origem: "corrente",
    catId: null,
    descricao,
    valor,
    data,
    competencia,
    fixo: false,
    status: "pago",
    valorPago: valor,
  };

  const saida = { ...base, id: uid(), tipo: "despesa", contaId: fromAccountId };
  const entrada = { ...base, id: uid(), tipo: "receita", contaId: toAccountId };

  return { ok: true, transferId, trans: [...trans, saida, entrada] };
}

// ── Excluir transferência (as duas pernas, como uma unidade) ────────────────
// state: { trans }
// opts:  { transferId }
// retorno: { ok:true, removed, trans } | { ok:false, reason:"not_found" }
export function deleteTransfer(state, opts) {
  const { trans = [] } = state || {};
  const { transferId } = opts || {};
  if (!transferId) return { ok: false, reason: "not_found" };
  const removed = trans.filter((t) => t.transferId === transferId).length;
  if (removed === 0) return { ok: false, reason: "not_found" };
  return { ok: true, removed, trans: trans.filter((t) => t.transferId !== transferId) };
}
