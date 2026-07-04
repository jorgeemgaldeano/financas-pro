import { dateForMonthDay, mKey, monthOffset } from "../utils/dateUtils.js";

export const CLOSED_INVOICE_STATUSES = ["fechada", "parcialmente_paga", "paga"];

export const invoiceIdFor = (cardId, monthKey) => `inv_${cardId}_${monthKey}`;

export const getCardPaymentAccountId = (card, fallback = null) => (
  card?.contaPagamentoId || card?.accountId || fallback || null
);

export const invoiceStatusByPayment = (paidAmount, totalAmount) => {
  const paid = Number(paidAmount) || 0;
  const total = Number(totalAmount) || 0;
  if (total > 0 && paid >= total) return "paga";
  if (paid > 0) return "parcialmente_paga";
  return "fechada";
};

export const paymentStatusByPaidAmount = (paidAmount, totalAmount) => {
  const paid = Number(paidAmount) || 0;
  const total = Number(totalAmount) || 0;
  if (total > 0 && paid >= total) return "pago";
  if (paid > 0) return "parcial";
  return "previsto";
};

export const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

const safeMoneyAmount = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  return moneyToNumber(value);
};

const getSimulationInstallmentValue = (sim) => {
  const parcelas = Math.max(1, parseInt(sim?.parcelas, 10) || 1);
  const valorBase = safeMoneyAmount(sim?.valor);

  return roundMoney(sim?.modoParc === "total" ? valorBase / parcelas : valorBase);
};

export const invoicePaymentLabel = (paidAmount, totalAmount) => {
  const paid = roundMoney(paidAmount);
  const total = roundMoney(totalAmount);
  if (total <= 0) return "Sem valor";
  if (paid >= total) return "Paga";
  if (paid > 0) return "Paga parcialmente";
  return "Pendente de pagamento";
};

export const invoiceClosureLabel = (closureStatus) => {
  if (closureStatus === "manual") return "Fechada manualmente";
  if (closureStatus === "automatic") return "Fechada automaticamente";
  return "Aberta";
};

export const getInvoiceRecordFor = (faturas, cardId, monthKey) => {
  return Array.isArray(faturas)
    ? faturas.find(f =>
        f.cardId === cardId &&
        (f.competenceMonth || f.competencia || f.faturaMes) === monthKey
      )
    : null;
};

export const getInvoiceClosureStatusForMonth = (
  faturas,
  card,
  monthKey,
  todayKey = new Date().toISOString().slice(0, 10)
) => {
  if (!card || !monthKey) return "open";
  const invoiceRecord = getInvoiceRecordFor(faturas, card.id, monthKey);
  if (invoiceRecord?.status === "aberta") return "open";
  if (invoiceRecord && CLOSED_INVOICE_STATUSES.includes(invoiceRecord.status)) {
    return invoiceRecord.closureType || invoiceRecord.fechamentoTipo || invoiceRecord.closedBy || "manual";
  }
  const fechamentoData = dateForMonthDay(monthKey, card.fechamento || card.closingDay || 31);
  return todayKey > fechamentoData ? "automatic" : "open";
};

export const isInvoiceClosed = (faturas, cardId, monthKey) => {
  const invoiceRecord = getInvoiceRecordFor(faturas, cardId, monthKey);
  return Boolean(invoiceRecord && CLOSED_INVOICE_STATUSES.includes(invoiceRecord.status));
};

export const isInvoiceClosedForNewEntries = (faturas, card, monthKey) => {
  return getInvoiceClosureStatusForMonth(faturas, card, monthKey) !== "open";
};

export const getCardInvoiceCompetence = (dateKey, card) => {
  if (!dateKey) return mKey(new Date().toISOString());
  const baseMonth = mKey(dateKey);
  if (!card) return baseMonth;
  const day = parseInt(String(dateKey).slice(8, 10), 10) || 1;
  const closingDay = parseInt(card.fechamento || card.closingDay || 31, 10) || 31;
  return day <= closingDay ? baseMonth : monthOffset(baseMonth, 1);
};

export const signedCardAmount = (transaction) => {
  const value = Number(transaction?.valor) || 0;
  if (transaction?.natureza === "ajuste_fatura_cartao" && transaction?.ajusteFaturaTipo === "reducao") return -value;
  if (transaction?.tipo === "receita") return -value;
  return value;
};
