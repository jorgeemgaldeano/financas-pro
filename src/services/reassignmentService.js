// reassignmentService.js — v0.3.32
//
// Reatribuição em massa de lançamentos, para permitir MOVER registros antes de
// excluir um cartão/conta/categoria (evolução do bloqueio simples de DEC-0028)
// e recategorizar uma categoria por completo.
//
// Padrão do projeto (ver CLAUDE.md): funções PURAS que recebem o estado
// relevante e devolvem o SNAPSHOT COMPLETO já alterado, para o App aplicar de
// uma vez (operação atômica — nunca setTrans/setFaturas/... separados, que
// arriscam commit parcial).
//
// Regras financeiras respeitadas:
//  - RN012 (isolamento de fatura): ao mover um lançamento de cartão, a
//    competência é RECALCULADA pelo ciclo do cartão de destino
//    (getCardInvoiceCompetence). O movimento é BLOQUEADO se qualquer fatura
//    fechada estiver envolvida (origem ou destino) — não se altera fatura
//    fechada silenciosamente.
//  - Transações de PAGAMENTO de fatura (natureza "fatura_cartao") têm
//    origem "corrente", então o filtro origem==="cartao" já as exclui do move
//    de cartão — elas não são compras e não devem ser reatribuídas como tal.

import {
  getCardInvoiceCompetence,
  isInvoiceClosed,
  getCardPaymentAccountId,
  CLOSED_INVOICE_STATUSES,
} from "./cardInvoiceService.js";

const transMonthKey = (t) =>
  t.competencia || t.competenceMonth || (t.data || "").slice(0, 7);

const toIdSet = (ids) => (ids instanceof Set ? ids : new Set(Array.isArray(ids) ? ids : [ids]));

// Uma linha de cartão é candidata a mover se é compra/ajuste do cartão de
// origem (origem "cartao" já exclui o pagamento previsto, que é "corrente").
const isMovableCardRow = (t, fromCardId) => t.cartaoId === fromCardId && t.origem === "cartao";

// ── Mover lançamentos de um cartão para outro ────────────────────────────────
// state:  { trans, faturas, despPess, sims, cards }
// opts:   { fromCardId, toCardId }
// retorno bem-sucedido: { ok:true, moved, trans, faturas, despPess, sims }
// reasons: same_card | card_not_found | source_invoice_closed | dest_invoice_closed
export function moveCardTransactions(state, opts) {
  const { trans = [], faturas = [], despPess = [], sims = [], cards = [] } = state || {};
  const { fromCardId, toCardId } = opts || {};

  if (!fromCardId || !toCardId) return { ok: false, reason: "card_not_found" };
  if (fromCardId === toCardId) return { ok: false, reason: "same_card" };
  const toCard = cards.find((c) => c.id === toCardId);
  if (!toCard) return { ok: false, reason: "card_not_found" };

  // Guardrail 1: nenhuma fatura FECHADA do cartão de origem pode ser tocada.
  const sourceClosed = faturas.some(
    (f) => f.cardId === fromCardId && CLOSED_INVOICE_STATUSES.includes(f.status)
  );
  if (sourceClosed) return { ok: false, reason: "source_invoice_closed" };

  const movable = trans.filter((t) => isMovableCardRow(t, fromCardId));

  // Guardrail 2: a competência de destino calculada não pode cair numa fatura
  // já fechada do cartão de destino.
  const blockedDest = new Set();
  movable.forEach((t) => {
    const destMonth = getCardInvoiceCompetence(t.data, toCard);
    if (isInvoiceClosed(faturas, toCardId, destMonth)) blockedDest.add(destMonth);
  });
  if (blockedDest.size > 0) {
    return { ok: false, reason: "dest_invoice_closed", blockedMonths: [...blockedDest] };
  }

  const nextTrans = trans.map((t) => {
    if (!isMovableCardRow(t, fromCardId)) return t;
    const competencia = getCardInvoiceCompetence(t.data, toCard);
    return { ...t, cartaoId: toCardId, cardId: toCardId, competencia, competenceMonth: competencia };
  });
  // Despesas compartilhadas e simulações apenas repontam o cartão (mantêm a
  // competência manual própria — não são itens de fatura calculada).
  const nextDespPess = despPess.map((d) => (d.cartaoId === fromCardId ? { ...d, cartaoId: toCardId } : d));
  const nextSims = sims.map((s) => (s.cartaoId === fromCardId ? { ...s, cartaoId: toCardId } : s));
  // Registros de fatura do cartão de origem (todos abertos — guardrail 1) são
  // recomputados on-the-fly; descartá-los evita registros órfãos.
  const nextFaturas = faturas.filter((f) => f.cardId !== fromCardId);

  return {
    ok: true,
    moved: movable.length,
    trans: nextTrans,
    faturas: nextFaturas,
    despPess: nextDespPess,
    sims: nextSims,
  };
}

// ── Mover lançamentos de uma conta para outra ────────────────────────────────
// state:  { trans, cards, faturas }
// opts:   { fromAccountId, toAccountId }
// retorno: { ok:true, moved, trans, cards, faturas }
// reasons: same_account | account_not_found
export function moveAccountTransactions(state, opts) {
  const { trans = [], cards = [], faturas = [], contas = [] } = state || {};
  const { fromAccountId, toAccountId } = opts || {};

  if (!fromAccountId || !toAccountId) return { ok: false, reason: "account_not_found" };
  if (fromAccountId === toAccountId) return { ok: false, reason: "same_account" };
  if (contas.length && !contas.some((c) => c.id === toAccountId)) {
    return { ok: false, reason: "account_not_found" };
  }

  const movable = trans.filter((t) => t.contaId === fromAccountId);
  const nextTrans = trans.map((t) =>
    t.contaId === fromAccountId ? { ...t, contaId: toAccountId, accountId: toAccountId } : t
  );
  // Cartões que pagavam pela conta de origem passam a pagar pela de destino.
  const nextCards = cards.map((c) =>
    getCardPaymentAccountId(c) === fromAccountId
      ? { ...c, contaPagamentoId: toAccountId, accountId: toAccountId }
      : c
  );
  // Registros de fatura que referenciavam a conta de origem para pagamento.
  const nextFaturas = faturas.map((f) =>
    f.accountId === fromAccountId || f.contaPagamentoId === fromAccountId
      ? { ...f, accountId: toAccountId, contaPagamentoId: toAccountId }
      : f
  );

  return { ok: true, moved: movable.length, trans: nextTrans, cards: nextCards, faturas: nextFaturas };
}

// ── Recategorizar uma categoria por completo ─────────────────────────────────
// state: { trans, despPess }
// opts:  { fromCatIds (Set|array — inclua descendentes), toCatId }
// retorno: { ok:true, moved, trans, despPess }
// reasons: same_category | no_source | no_target
export function recategorizeCategory(state, opts) {
  const { trans = [], despPess = [] } = state || {};
  const { toCatId } = opts || {};
  const fromCatIds = toIdSet(opts?.fromCatIds);

  if (!toCatId) return { ok: false, reason: "no_target" };
  if (fromCatIds.size === 0) return { ok: false, reason: "no_source" };
  if (fromCatIds.has(toCatId)) return { ok: false, reason: "same_category" };

  let moved = 0;
  const nextTrans = trans.map((t) => {
    if (!fromCatIds.has(t.catId)) return t;
    moved += 1;
    return { ...t, catId: toCatId };
  });
  const nextDespPess = despPess.map((d) => {
    if (!fromCatIds.has(d.catId)) return d;
    moved += 1;
    return { ...d, catId: toCatId };
  });

  return { ok: true, moved, trans: nextTrans, despPess: nextDespPess };
}
