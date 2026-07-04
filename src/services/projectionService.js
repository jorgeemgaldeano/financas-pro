function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function monthKeyFromDate(value) {
  return String(value || "").slice(0, 7);
}

function transactionMonthKey(transaction) {
  return transaction?.competencia || transaction?.competenceMonth || monthKeyFromDate(transaction?.data);
}

function monthOffset(monthKey, offset) {
  const [year, month] = String(monthKey || "").split("-").map(Number);
  const date = new Date(year || new Date().getFullYear(), (month || 1) - 1 + offset, 1);
  return date.toISOString().slice(0, 7);
}

function monthCompare(a, b) {
  return String(a || "").localeCompare(String(b || ""));
}

function monthLabel(monthKey, monthLabels) {
  const [year, month] = String(monthKey || "").split("-").map(Number);
  const label = monthLabels?.[(month || 1) - 1] || String(month || "").padStart(2, "0");
  return `${label}/${year}`;
}

function buildMonthRange({ mode = "periodo", year, startMonth, endMonth, selectedMonth, numberOfMonths = 12 } = {}) {
  if (mode === "ano") {
    const safeYear = parseInt(year, 10) || new Date().getFullYear();
    return Array.from({ length: 12 }, (_, index) => `${safeYear}-${String(index + 1).padStart(2, "0")}`);
  }

  const start = startMonth || selectedMonth || new Date().toISOString().slice(0, 7);
  const fallbackEnd = monthOffset(start, Math.max(1, parseInt(numberOfMonths, 10) || 1) - 1);
  const end = endMonth && monthCompare(endMonth, start) >= 0 ? endMonth : fallbackEnd;

  const months = [];
  let current = start;
  let guard = 0;
  while (monthCompare(current, end) <= 0 && guard < 60) {
    months.push(current);
    current = monthOffset(current, 1);
    guard += 1;
  }
  return months.length ? months : [start];
}

function realizedAmount(transaction) {
  if (transaction?.status === "previsto") return 0;
  if (transaction?.status === "parcial") {
    return Math.min(money(transaction?.valorPago ?? transaction?.paidAmount), money(transaction?.valor ?? transaction?.amount));
  }
  return money(transaction?.valor ?? transaction?.amount);
}

function transactionProjectedAmount(transaction) {
  return money(transaction?.valor ?? transaction?.amount);
}

function paymentRecordForInvoice({ transactions, invoice, invoiceId, cardId, invoiceCompetence }) {
  if (invoice?.paymentTransactionId) {
    const byId = transactions.find(t => t.id === invoice.paymentTransactionId);
    if (byId) return byId;
  }

  return transactions.find(t =>
    t?.natureza === "fatura_cartao" &&
    (t.invoiceId === invoiceId || (t.faturaMes === invoiceCompetence && (t.cartaoId === cardId || t.cardId === cardId)))
  ) || null;
}

function invoiceRecordFor({ invoices, invoiceId, cardId, invoiceCompetence }) {
  return invoices.find(invoice => invoice?.id === invoiceId)
    || invoices.find(invoice =>
      (invoice?.cardId === cardId || invoice?.cartaoId === cardId) &&
      (invoice?.competenceMonth === invoiceCompetence || invoice?.competencia === invoiceCompetence || invoice?.month === invoiceCompetence)
    )
    || null;
}

function sumSimulationDueInMonth({ simulationTransactions, monthKey }) {
  return simulationTransactions
    .filter(transaction => monthOffset(transactionMonthKey(transaction), 1) === monthKey)
    .reduce((sum, transaction) => sum + transactionProjectedAmount(transaction), 0);
}

function buildMonthProjection({
  monthKey,
  transactions,
  cards,
  invoices,
  simulationTransactions,
  getInitialBalanceForMonth,
  getCardInvoiceTotal,
  getInvoiceId,
}) {
  const monthTransactions = transactions.filter(transaction => transactionMonthKey(transaction) === monthKey);

  const receitasItens = monthTransactions.filter(transaction => transaction?.tipo === "receita" && transaction?.origem !== "cartao");
  const despesasItens = monthTransactions.filter(transaction =>
    transaction?.tipo === "despesa" &&
    transaction?.origem !== "cartao" &&
    transaction?.natureza !== "fatura_cartao"
  );
  const pagamentosFatura = monthTransactions.filter(transaction => transaction?.natureza === "fatura_cartao");

  const receitasRealizadas = receitasItens.reduce((sum, transaction) => sum + realizedAmount(transaction), 0);
  const receitasProjetadas = receitasItens.reduce((sum, transaction) => sum + transactionProjectedAmount(transaction), 0);
  const despesasRealizadas = despesasItens.reduce((sum, transaction) => sum + realizedAmount(transaction), 0);
  const despesasProjetadas = despesasItens.reduce((sum, transaction) => sum + transactionProjectedAmount(transaction), 0);
  const faturasPagasOuPrevistas = pagamentosFatura.reduce((sum, transaction) => sum + transactionProjectedAmount(transaction), 0);

  const invoiceCompetence = monthOffset(monthKey, -1);
  const faturasProjetadasAbertas = cards.reduce((sum, card) => {
    const cardId = card?.id;
    if (!cardId) return sum;
    const invoiceId = getInvoiceId ? getInvoiceId(cardId, invoiceCompetence) : `${cardId}_${invoiceCompetence}`;
    const invoice = invoiceRecordFor({ invoices, invoiceId, cardId, invoiceCompetence });
    const payment = paymentRecordForInvoice({ transactions, invoice, invoiceId, cardId, invoiceCompetence });
    if (payment && transactionMonthKey(payment) === monthKey) return sum;

    const invoiceAmount = money(invoice?.finalAmount ?? invoice?.valorFinal ?? invoice?.amount ?? invoice?.valor ?? getCardInvoiceTotal?.(card, invoiceCompetence));
    return sum + Math.max(0, invoiceAmount);
  }, 0);

  const simulacoes = sumSimulationDueInMonth({ simulationTransactions, monthKey });
  const faturas = faturasPagasOuPrevistas + faturasProjetadasAbertas;
  const saldoInicial = money(getInitialBalanceForMonth?.(monthKey));
  const entradas = receitasProjetadas;
  const saidas = despesasProjetadas + faturas + simulacoes;
  const saldoProjetado = saldoInicial + entradas - saidas;

  return {
    monthKey,
    saldoInicial: roundMoney(saldoInicial),
    receitas: roundMoney(receitasProjetadas),
    receitasRealizadas: roundMoney(receitasRealizadas),
    receitasPendentes: roundMoney(Math.max(0, receitasProjetadas - receitasRealizadas)),
    despesas: roundMoney(despesasProjetadas),
    despesasRealizadas: roundMoney(despesasRealizadas),
    despesasPendentes: roundMoney(Math.max(0, despesasProjetadas - despesasRealizadas)),
    faturas: roundMoney(faturas),
    faturasExistentes: roundMoney(faturasPagasOuPrevistas),
    faturasProjetadas: roundMoney(faturasProjetadasAbertas),
    simulacoes: roundMoney(simulacoes),
    entradas: roundMoney(entradas),
    saidas: roundMoney(saidas),
    saldoProjetado: roundMoney(saldoProjetado),
  };
}

export function buildRealCashFlowProjection({
  transactions = [],
  cards = [],
  invoices = [],
  simulationTransactions = [],
  mode = "periodo",
  year,
  startMonth,
  endMonth,
  selectedMonth,
  numberOfMonths = 12,
  monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  getInitialBalanceForMonth,
  getCardInvoiceTotal,
  getInvoiceId,
} = {}) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeCards = Array.isArray(cards) ? cards : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeSimulationTransactions = Array.isArray(simulationTransactions) ? simulationTransactions : [];
  const months = buildMonthRange({ mode, year, startMonth, endMonth, selectedMonth, numberOfMonths });

  let runningBalance = null;

  return months.map(monthKey => {
    const month = buildMonthProjection({
      monthKey,
      transactions: safeTransactions,
      cards: safeCards,
      invoices: safeInvoices,
      simulationTransactions: safeSimulationTransactions,
      getInitialBalanceForMonth,
      getCardInvoiceTotal,
      getInvoiceId,
    });

    const openingBalance = runningBalance === null ? month.saldoInicial : runningBalance;
    const closingBalance = roundMoney(openingBalance + month.entradas - month.saidas);
    runningBalance = closingBalance;

    return {
      ...month,
      label: monthLabel(monthKey, monthLabels),
      saldoInicial: roundMoney(openingBalance),
      saldoProjetado: closingBalance,
      fluxoLiquido: roundMoney(month.entradas - month.saidas),
    };
  });
}

// Mantido temporariamente para compatibilidade documental da v0.3.19.
export function buildMonthlyExpenseProjection(options = {}) {
  return buildRealCashFlowProjection(options).map(month => ({
    label: month.label,
    value: month.saidas,
    fixo: 0,
    variavel: 0,
  }));
}
