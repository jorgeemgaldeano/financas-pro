// cardInvoiceOperations.js — v0.3.27
// Operações de fatura de cartão como funções PURAS.
//
// Princípio (isolamento + atomicidade): cada operação recebe o estado atual
// ({ trans, faturas, cards, contas }) e devolve o estado COMPLETO resultante
// ({ trans, faturas }) num único objeto. O componente React aplica os dois
// setState no mesmo ciclo, a partir de um único snapshot — eliminando o
// "commit parcial" que existia quando setTrans e setFaturas eram chamados
// separadamente, cada um com seu próprio closure.
//
// As decisões de UI (confirmar, perguntar valor, alertar) NÃO vivem aqui:
// as funções recebem os inputs já resolvidos e sinalizam via `reason` quando
// precisam de uma confirmação do usuário, para o wrapper decidir.
//
// O comportamento e os campos gravados replicam exatamente a v0.3.26.7.

import { dateForMonthDay, monthOffset } from "../utils/dateUtils.js";
import {
  getCardPaymentAccountId,
  invoiceIdFor,
  getInvoiceRecordFor,
  invoiceStatusByPayment,
  paymentStatusByPaidAmount,
  roundMoney,
  signedCardAmount,
  isInvoiceClosedForNewEntries,
  getInvoiceClosureStatusForMonth,
} from "./cardInvoiceService.js";

const transMonthKey = (t) =>
  t.competencia || t.competenceMonth || (t.data || "").slice(0, 7);

const nowIso = () => new Date().toISOString();

// Gerador de id de fallback caso o wrapper não injete um (testes).
// ── Resolução da categoria de pagamento/ajuste de fatura (E6) ───────────────
// Valida o parâmetro configurável contra a lista real de categorias; se a
// categoria configurada não existir (ex.: foi excluída pelo usuário), cai
// para "cat10" (categoria padrão "Outros", que não é removível pela UI).
export function resolveInvoiceCategoryId(cats, configuredCatId) {
  const list = Array.isArray(cats) ? cats : [];
  if (configuredCatId && list.some((c) => c.id === configuredCatId)) {
    return configuredCatId;
  }
  return "cat10";
}

const fallbackUid = () =>
  "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 11);

// ── Cálculo puro da fatura (equivalente a calcularFaturaCartao) ───────────────
export function computeCardInvoice(trans, card, monthKey) {
  const itens = (trans || []).filter(
    (t) => t.cartaoId === card.id && t.origem === "cartao" && transMonthKey(t) === monthKey
  );
  const total = itens.reduce((sum, t) => sum + signedCardAmount(t), 0);
  const ajustes = itens
    .filter((t) => t.natureza === "ajuste_fatura_cartao")
    .reduce((sum, t) => sum + signedCardAmount(t), 0);
  return { itens, total: Math.max(0, Number(total.toFixed(2))), ajustes };
}

// Localiza a transação de pagamento previsto vinculada a uma fatura.
function findExistingPayment(trans, { existingInvoice, invoiceId, cardId, monthKey }) {
  return (
    (existingInvoice?.paymentTransactionId
      ? trans.find((t) => t.id === existingInvoice.paymentTransactionId)
      : null) ||
    trans.find((t) => t.invoiceId === invoiceId && t.natureza === "fatura_cartao") ||
    trans.find(
      (t) => t.faturaMes === monthKey && t.cartaoId === cardId && t.natureza === "fatura_cartao"
    )
  );
}

// Monta os campos comuns de sincronização do pagamento previsto.
function syncedPaymentFields({ totalFatura, paymentDate, paymentMonth, contaPagamentoId, cardId, invoiceId, monthKey, existingPago, now }) {
  const pago = roundMoney(Number(existingPago) || 0);
  return {
    valor: totalFatura,
    amount: totalFatura,
    data: paymentDate,
    competencia: paymentMonth,
    competenceMonth: paymentMonth,
    contaId: contaPagamentoId,
    accountId: contaPagamentoId,
    cartaoId: cardId,
    cardId,
    invoiceId,
    faturaMes: monthKey,
    status: paymentStatusByPaidAmount(pago, totalFatura),
    valorPago: pago,
    paidAmount: pago,
    pendingAmount: Math.max(0, roundMoney(totalFatura - pago)),
    updatedAt: now,
  };
}

function upsertInvoice(faturas, invoiceId, nova) {
  return faturas.some((f) => f.id === invoiceId)
    ? faturas.map((f) => (f.id === invoiceId ? { ...f, ...nova } : f))
    : [...faturas, nova];
}

// ── FECHAR fatura (equivalente a fecharFaturaCartao) ─────────────────────────
// opts: { cardId, monthKey, confirmUpdateExisting, uid, now }
// reasons: card_not_found | no_account | no_amount | needs_confirm_update
export function closeInvoice(state, opts) {
  const { trans = [], faturas = [], cards = [], contas = [] } = state;
  const { cardId, monthKey, confirmUpdateExisting = false } = opts;
  const uid = opts.uid || fallbackUid;
  const now = opts.now || nowIso();
  const catId = opts.catId || "cat10"; // v0.3.28 — E6: configurável via params.catIdPagamentoFatura

  const card = cards.find((c) => c.id === cardId);
  if (!card) return { ok: false, reason: "card_not_found" };

  const primeiraCC = contas.find((c) => c.tipo === "corrente")?.id || contas[0]?.id || "cc1";
  const contaPagamentoId = getCardPaymentAccountId(card, primeiraCC);
  if (!contaPagamentoId) return { ok: false, reason: "no_account" };

  const fat = computeCardInvoice(trans, card, monthKey);
  const totalFatura = roundMoney(fat.total);
  if (totalFatura <= 0) return { ok: false, reason: "no_amount" };

  const invoiceId = invoiceIdFor(cardId, monthKey);
  const paymentMonth = monthOffset(monthKey, 1);
  const paymentDate = dateForMonthDay(paymentMonth, card.vencimento);
  const existingInvoice =
    getInvoiceRecordFor(faturas, cardId, monthKey) || faturas.find((f) => f.id === invoiceId);
  const existingPayment = findExistingPayment(trans, { existingInvoice, invoiceId, cardId, monthKey });
  const paymentTransactionId =
    existingPayment?.id || existingInvoice?.paymentTransactionId || uid();

  // Se já existe pagamento previsto, o wrapper precisa confirmar a atualização.
  if (existingPayment && !confirmUpdateExisting) {
    return { ok: false, reason: "needs_confirm_update", requiresConfirm: true };
  }

  const existingPago = existingPayment?.valorPago ?? existingPayment?.paidAmount ?? 0;

  let nextTrans;
  if (existingPayment) {
    const patch = syncedPaymentFields({
      totalFatura, paymentDate, paymentMonth, contaPagamentoId, cardId, invoiceId, monthKey,
      existingPago, now,
    });
    nextTrans = trans.map((t) => (t.id === existingPayment.id ? { ...t, ...patch } : t));
  } else {
    nextTrans = [
      ...trans,
      {
        id: paymentTransactionId,
        tipo: "despesa",
        origem: "corrente",
        natureza: "fatura_cartao",
        catId,
        descricao: `Pagamento fatura ${card.nome} - ${monthKey}`,
        valor: totalFatura,
        amount: totalFatura,
        data: paymentDate,
        competencia: paymentMonth,
        competenceMonth: paymentMonth,
        contaId: contaPagamentoId,
        accountId: contaPagamentoId,
        cartaoId: cardId,
        cardId,
        invoiceId,
        faturaMes: monthKey,
        status: "previsto",
        valorPago: 0,
        paidAmount: 0,
        pendingAmount: totalFatura,
        fixo: false,
      },
    ];
  }

  const valorPagoAtual = roundMoney(Number(existingPago) || 0);
  const nova = {
    id: invoiceId,
    cardId,
    accountId: contaPagamentoId,
    contaPagamentoId,
    competenceMonth: monthKey,
    dueMonth: paymentMonth,
    status: invoiceStatusByPayment(valorPagoAtual, totalFatura),
    expensesTotal: roundMoney(totalFatura - fat.ajustes),
    adjustmentsTotal: roundMoney(fat.ajustes),
    finalAmount: totalFatura,
    paidAmount: valorPagoAtual,
    pendingAmount: Math.max(0, roundMoney(totalFatura - valorPagoAtual)),
    paymentTransactionId,
    closureType: "manual",
    fechamentoTipo: "manual",
    closedBy: "manual",
    closedAt: now,
    updatedAt: now,
  };
  const nextFaturas = upsertInvoice(faturas, invoiceId, nova);

  return {
    ok: true,
    trans: nextTrans,
    faturas: nextFaturas,
    meta: { invoiceId, paymentTransactionId, totalFatura, updatedExisting: Boolean(existingPayment) },
  };
}

// ── REABRIR fatura (equivalente a abrirFaturaCartao) ─────────────────────────
// opts: { cardId, monthKey, uid, now }
// reasons: card_not_found | no_account
export function reopenInvoice(state, opts) {
  const { trans = [], faturas = [], cards = [], contas = [] } = state;
  const { cardId, monthKey } = opts;
  const now = opts.now || nowIso();

  const card = cards.find((c) => c.id === cardId);
  if (!card) return { ok: false, reason: "card_not_found" };

  const primeiraCC = contas.find((c) => c.tipo === "corrente")?.id || contas[0]?.id || "cc1";
  const contaPagamentoId = getCardPaymentAccountId(card, primeiraCC);
  if (!contaPagamentoId) return { ok: false, reason: "no_account" };

  const invoiceId = invoiceIdFor(cardId, monthKey);
  const existingInvoice =
    getInvoiceRecordFor(faturas, cardId, monthKey) || faturas.find((f) => f.id === invoiceId);
  const existingPayment = existingInvoice?.paymentTransactionId
    ? trans.find((t) => t.id === existingInvoice.paymentTransactionId)
    : trans.find((t) => t.invoiceId === invoiceId && t.natureza === "fatura_cartao");

  const fat = computeCardInvoice(trans, card, monthKey);
  const totalFatura = roundMoney(fat.total);
  const valorPagoAtual = roundMoney(
    Number(existingPayment?.valorPago) || Number(existingInvoice?.paidAmount) || 0
  );
  const paymentMonth = monthOffset(monthKey, 1);
  const paymentDate = dateForMonthDay(paymentMonth, card.vencimento);

  let nextTrans = trans;
  if (existingPayment) {
    const existingPago = existingPayment.valorPago ?? existingPayment.paidAmount ?? 0;
    const patch = syncedPaymentFields({
      totalFatura, paymentDate, paymentMonth, contaPagamentoId, cardId, invoiceId, monthKey,
      existingPago, now,
    });
    nextTrans = trans.map((t) => (t.id === existingPayment.id ? { ...t, ...patch } : t));
  }

  const nova = {
    id: invoiceId,
    cardId,
    accountId: contaPagamentoId,
    contaPagamentoId,
    competenceMonth: monthKey,
    dueMonth: paymentMonth,
    status: "aberta",
    expensesTotal: roundMoney(totalFatura - fat.ajustes),
    adjustmentsTotal: roundMoney(fat.ajustes),
    finalAmount: totalFatura,
    paidAmount: valorPagoAtual,
    pendingAmount: Math.max(0, roundMoney(totalFatura - valorPagoAtual)),
    paymentTransactionId: existingPayment?.id || existingInvoice?.paymentTransactionId || null,
    closureType: "open",
    fechamentoTipo: "reaberta",
    closedBy: null,
    reopenedAt: now,
    updatedAt: now,
  };
  const nextFaturas = upsertInvoice(faturas, invoiceId, nova);

  return { ok: true, trans: nextTrans, faturas: nextFaturas, meta: { invoiceId } };
}

// ── AJUSTE de fatura (equivalente a adicionarAjusteFatura) ───────────────────
// opts: { cardId, monthKey, tipoAjuste, valor, descricao, uid, catId, now }
// reasons: card_not_found | invoice_closed | invalid_amount | missing_description
export function addInvoiceAdjustment(state, opts) {
  const { trans = [], faturas = [], cards = [] } = state;
  const { cardId, monthKey, tipoAjuste } = opts;
  const uid = opts.uid || fallbackUid;
  const now = opts.now || nowIso();
  const catId = opts.catId || "cat10";
  const day = Number(opts.day) || 1;
  const todayKey = opts.todayKey;
  const valor = Number(opts.valor) || 0;
  const descricao = String(opts.descricao || "").trim();

  const card = cards.find((c) => c.id === cardId);
  if (!card) return { ok: false, reason: "card_not_found" };

  if (isInvoiceClosedForNewEntries(faturas, card, monthKey, todayKey)) {
    return {
      ok: false,
      reason: "invoice_closed",
      closureStatus: getInvoiceClosureStatusForMonth(faturas, card, monthKey, todayKey),
    };
  }
  if (valor <= 0) return { ok: false, reason: "invalid_amount" };
  if (!descricao) return { ok: false, reason: "missing_description" };

  const nextTrans = [
    ...trans,
    {
      id: uid(),
      tipo: tipoAjuste === "reducao" ? "receita" : "despesa",
      origem: "cartao",
      natureza: "ajuste_fatura_cartao",
      ajusteFaturaTipo: tipoAjuste,
      catId,
      descricao,
      valor,
      data: dateForMonthDay(monthKey, day),
      competencia: monthKey,
      cartaoId: cardId,
      contaId: null,
      fixo: false,
      status: "pago",
      valorPago: valor,
    },
  ];

  return { ok: true, trans: nextTrans, faturas, meta: { cardId, monthKey } };
}

// ── GUARDA: fatura fechada bloqueia novo lançamento ──────────────────────────
// Uso no wrapper antes de salvar um lançamento de cartão.
export function assertInvoiceOpenForEntry(faturas, card, monthKey, todayKey) {
  if (!card) return { blocked: false };
  const closed = isInvoiceClosedForNewEntries(faturas, card, monthKey, todayKey);
  return {
    blocked: closed,
    closureStatus: closed ? getInvoiceClosureStatusForMonth(faturas, card, monthKey, todayKey) : "open",
  };
}
