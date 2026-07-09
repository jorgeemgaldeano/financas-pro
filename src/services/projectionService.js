import { isMovimentoContabil } from "./accountingService.js";

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

function dateForMonth(monthKey, sourceDate) {
  const day = Math.min(Math.max(parseInt(String(sourceDate || "").slice(8, 10), 10) || 1, 1), 28);
  return `${monthKey}-${String(day).padStart(2, "0")}`;
}

function textKey(value) {
  return String(value || "").trim().toLowerCase();
}

function recurringIdentity(transaction) {
  return [
    transaction?.tipo || "",
    transaction?.origem || "",
    textKey(transaction?.descricao || transaction?.description),
    transaction?.catId || transaction?.categoryId || "",
    transaction?.contaId || transaction?.accountId || "",
    transaction?.cartaoId || transaction?.cardId || "",
  ].join("|");
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

function transactionDetail(transaction, source) {
  const valor = transactionProjectedAmount(transaction);
  const valorReal = realizedAmount(transaction);
  return {
    id: transaction?.id || `${source}_${transaction?.descricao || transaction?.description || Math.random()}`,
    source,
    descricao: transaction?.descricao || transaction?.description || "Sem descrição",
    valor: roundMoney(valor),
    realizado: roundMoney(valorReal),
    pendente: roundMoney(Math.max(0, valor - valorReal)),
    status: transaction?.status || "realizado",
    data: transaction?.data || transaction?.date || "",
    origem: transaction?.origem || transaction?.origin || "",
    catId: transaction?.catId || transaction?.categoryId || "",
    contaId: transaction?.contaId || transaction?.accountId || "",
    cartaoId: transaction?.cartaoId || transaction?.cardId || "",
  };
}

function matchesCategoryFilter(transaction, categoryIds) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return true;
  const catId = transaction?.catId || transaction?.categoryId || "";
  return categoryIds.includes(catId);
}

function matchesAccountFilter(transaction, accountId) {
  if (!accountId) return true;
  return (transaction?.contaId || transaction?.accountId || "") === accountId;
}

function matchesCardFilter(transaction, cardId) {
  if (!cardId) return true;
  return (transaction?.cartaoId || transaction?.cardId || "") === cardId;
}

function matchesOriginFilter(source, originFilter) {
  if (!originFilter || originFilter === "todos") return true;
  return source === originFilter;
}

function applyDetailFilters(detail, source, filters = {}) {
  if (!matchesOriginFilter(source, filters.origin)) return false;
  if (!matchesCategoryFilter(detail, filters.categoryIds)) return false;
  if (!matchesAccountFilter(detail, filters.accountId)) return false;
  if (!matchesCardFilter(detail, filters.cardId)) return false;
  return true;
}

function isRecurringTransaction(transaction) {
  return Boolean(
    transaction?.fixo === true ||
    transaction?.recorrenciaId ||
    transaction?.parcelaGrupo ||
    transaction?.projetadoPorRecorrencia === true
  );
}

function isRealizedTransaction(transaction) {
  const status = transaction?.status || "";
  if (status === "pago" || status === "recebido") return true;
  return realizedAmount(transaction) > 0;
}

function shouldIncludeRecurringTransaction(transaction, filters = {}) {
  if (filters.includeRecurrences !== false) return true;
  if (!isRecurringTransaction(transaction)) return true;

  // Ao desligar "Projetar recorrências", preserva apenas o que já foi realizado.
  // Lançamentos recorrentes ainda previstos deixam de compor a projeção analítica.
  return isRealizedTransaction(transaction);
}

function recurringTransactionsForMonth({ transactions, monthKey, filters = {} }) {
  if (filters.includeRecurrences === false) return [];

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const actualIdentityInMonth = new Set(
    safeTransactions
      .filter(transaction => transactionMonthKey(transaction) === monthKey)
      .map(recurringIdentity)
  );

  const seedsByIdentity = new Map();
  safeTransactions
    .filter(transaction => transaction?.fixo === true && transaction?.origem !== "cartao" && transaction?.natureza !== "fatura_cartao" && isMovimentoContabil(transaction))
    .forEach(transaction => {
      const identity = recurringIdentity(transaction);
      const current = seedsByIdentity.get(identity);
      if (!current || monthCompare(transactionMonthKey(transaction), transactionMonthKey(current)) > 0) {
        seedsByIdentity.set(identity, transaction);
      }
    });

  return Array.from(seedsByIdentity.values())
    .filter(transaction => monthCompare(monthKey, transactionMonthKey(transaction)) > 0)
    .filter(transaction => !actualIdentityInMonth.has(recurringIdentity(transaction)))
    .map(transaction => ({
      ...transaction,
      id: `rec_${transaction.id || recurringIdentity(transaction)}_${monthKey}`,
      data: dateForMonth(monthKey, transaction?.data || transaction?.date),
      competencia: monthKey,
      status: "previsto",
      valorPago: 0,
      projetadoPorRecorrencia: true,
      descricao: transaction?.descricao || transaction?.description || "Recorrência projetada",
    }));
}

function simulationDetailsDueInMonth({ simulationTransactions, monthKey, filters = {} }) {
  if (filters.includeSimulations === false) return [];
  if (!matchesOriginFilter("simulacoes", filters.origin)) return [];

  return simulationTransactions
    .filter(transaction => monthOffset(transactionMonthKey(transaction), 1) === monthKey)
    .map(transaction => ({
      ...transactionDetail(transaction, "simulacoes"),
      descricao: transaction?.descricao || transaction?.description || "Simulação",
      competenciaOrigem: transactionMonthKey(transaction),
      parcela: transaction?.parcela,
      totalParcelas: transaction?.totalParcelas,
      simId: transaction?.simId,
    }))
    .filter(detail => applyDetailFilters(detail, "simulacoes", filters));
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

function invoiceDetailAllowed(detail, filters = {}) {
  if (!matchesOriginFilter("faturas", filters.origin)) return false;
  if (Array.isArray(filters.categoryIds) && filters.categoryIds.length > 0) return false;
  if (!matchesAccountFilter(detail, filters.accountId)) return false;
  if (!matchesCardFilter(detail, filters.cardId)) return false;
  return true;
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
  filters = {},
}) {
  const projectedRecurring = recurringTransactionsForMonth({ transactions, monthKey, filters });
  const monthTransactions = [
    ...transactions
      .filter(transaction => transactionMonthKey(transaction) === monthKey)
      .filter(transaction => shouldIncludeRecurringTransaction(transaction, filters)),
    ...projectedRecurring,
  ];

  const receitasItens = monthTransactions
    .filter(transaction => transaction?.tipo === "receita" && transaction?.origem !== "cartao" && isMovimentoContabil(transaction))
    .filter(transaction => applyDetailFilters(transactionDetail(transaction, "receitas"), "receitas", filters));

  const despesasItens = monthTransactions
    .filter(transaction =>
      transaction?.tipo === "despesa" &&
      transaction?.origem !== "cartao" &&
      transaction?.natureza !== "fatura_cartao" &&
      isMovimentoContabil(transaction)
    )
    .filter(transaction => applyDetailFilters(transactionDetail(transaction, "despesas"), "despesas", filters));

  const pagamentosFatura = monthTransactions.filter(transaction => transaction?.natureza === "fatura_cartao");

  const receitasRealizadas = receitasItens.reduce((sum, transaction) => sum + realizedAmount(transaction), 0);
  const receitasProjetadas = receitasItens.reduce((sum, transaction) => sum + transactionProjectedAmount(transaction), 0);
  const despesasRealizadas = despesasItens.reduce((sum, transaction) => sum + realizedAmount(transaction), 0);
  const despesasProjetadas = despesasItens.reduce((sum, transaction) => sum + transactionProjectedAmount(transaction), 0);

  const receitasDetalhes = receitasItens.map(transaction => transactionDetail(transaction, transaction?.projetadoPorRecorrencia ? "recorrencia_receita" : "receitas"));
  const despesasDetalhes = despesasItens.map(transaction => transactionDetail(transaction, transaction?.projetadoPorRecorrencia ? "recorrencia_despesa" : "despesas"));

  const faturasDetalhes = pagamentosFatura.map(transaction => ({
    ...transactionDetail(transaction, "faturas"),
    descricao: transaction?.descricao || transaction?.description || "Pagamento de fatura",
    invoiceId: transaction?.invoiceId || transaction?.faturaId || "",
    faturaMes: transaction?.faturaMes || transaction?.competenciaFatura || "",
  })).filter(detail => invoiceDetailAllowed(detail, filters));

  const faturasPagasOuPrevistas = faturasDetalhes.reduce((sum, detail) => sum + money(detail.valor), 0);

  const invoiceCompetence = monthOffset(monthKey, -1);
  const faturasProjetadasDetalhes = [];
  const faturasProjetadasAbertas = cards.reduce((sum, card) => {
    const cardId = card?.id;
    if (!cardId) return sum;
    const invoiceId = getInvoiceId ? getInvoiceId(cardId, invoiceCompetence) : `${cardId}_${invoiceCompetence}`;
    const invoice = invoiceRecordFor({ invoices, invoiceId, cardId, invoiceCompetence });
    const payment = paymentRecordForInvoice({ transactions, invoice, invoiceId, cardId, invoiceCompetence });
    if (payment && transactionMonthKey(payment) === monthKey) return sum;

    const invoiceAmount = money(invoice?.finalAmount ?? invoice?.valorFinal ?? invoice?.amount ?? invoice?.valor ?? getCardInvoiceTotal?.(card, invoiceCompetence));
    const safeAmount = Math.max(0, invoiceAmount);
    if (safeAmount > 0) {
      const detail = {
        id: invoice?.id || invoiceId,
        source: "faturas",
        descricao: `Fatura projetada ${card?.nome || "Cartão"} - ${invoiceCompetence}`,
        valor: roundMoney(safeAmount),
        realizado: 0,
        pendente: roundMoney(safeAmount),
        status: invoice?.status || "projetada",
        data: "",
        origem: "cartao",
        catId: "",
        contaId: card?.contaPagamentoId || card?.accountId || "",
        cartaoId: cardId,
        invoiceId,
        faturaMes: invoiceCompetence,
        cardName: card?.nome || "Cartão",
      };
      if (invoiceDetailAllowed(detail, filters)) {
        faturasProjetadasDetalhes.push(detail);
        return sum + safeAmount;
      }
    }
    return sum;
  }, 0);

  const simulacoesDetalhes = simulationDetailsDueInMonth({ simulationTransactions, monthKey, filters });
  const simulacoes = simulacoesDetalhes.reduce((sum, transaction) => sum + money(transaction.valor), 0);
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
    receitasRecorrentes: roundMoney(receitasDetalhes.filter(item => item.source === "recorrencia_receita").reduce((sum, item) => sum + money(item.valor), 0)),
    despesas: roundMoney(despesasProjetadas),
    despesasRealizadas: roundMoney(despesasRealizadas),
    despesasPendentes: roundMoney(Math.max(0, despesasProjetadas - despesasRealizadas)),
    despesasRecorrentes: roundMoney(despesasDetalhes.filter(item => item.source === "recorrencia_despesa").reduce((sum, item) => sum + money(item.valor), 0)),
    faturas: roundMoney(faturas),
    faturasExistentes: roundMoney(faturasPagasOuPrevistas),
    faturasProjetadas: roundMoney(faturasProjetadasAbertas),
    simulacoes: roundMoney(simulacoes),
    entradas: roundMoney(entradas),
    saidas: roundMoney(saidas),
    saldoProjetado: roundMoney(saldoProjetado),
    detalhes: {
      receitas: receitasDetalhes,
      despesas: despesasDetalhes,
      faturas: [...faturasDetalhes, ...faturasProjetadasDetalhes],
      simulacoes: simulacoesDetalhes,
    },
  };
}

function buildInsights(months) {
  if (!Array.isArray(months) || months.length === 0) {
    return {
      menorSaldo: 0,
      menorSaldoMes: "",
      maiorSaida: 0,
      maiorSaidaMes: "",
      maiorQueda: 0,
      maiorQuedaMes: "",
      mesesNegativos: 0,
      comprometimentoFaturas: 0,
      comprometimentoFaturasMes: "",
    };
  }

  const minBalance = months.reduce((min, item) => item.saldoProjetado < min.saldoProjetado ? item : min, months[0]);
  const maxOut = months.reduce((max, item) => item.saidas > max.saidas ? item : max, months[0]);
  const maxDrop = months.reduce((max, item) => item.fluxoLiquido < max.fluxoLiquido ? item : max, months[0]);
  const maxInvoiceShare = months.reduce((max, item) => {
    const share = item.saidas > 0 ? item.faturas / item.saidas : 0;
    const maxShare = max.saidas > 0 ? max.faturas / max.saidas : 0;
    return share > maxShare ? item : max;
  }, months[0]);

  return {
    menorSaldo: roundMoney(minBalance.saldoProjetado),
    menorSaldoMes: minBalance.label,
    maiorSaida: roundMoney(maxOut.saidas),
    maiorSaidaMes: maxOut.label,
    maiorQueda: roundMoney(maxDrop.fluxoLiquido),
    maiorQuedaMes: maxDrop.label,
    mesesNegativos: months.filter(item => item.saldoProjetado < 0).length,
    comprometimentoFaturas: roundMoney(maxInvoiceShare.saidas > 0 ? (maxInvoiceShare.faturas / maxInvoiceShare.saidas) * 100 : 0),
    comprometimentoFaturasMes: maxInvoiceShare.label,
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
  filters = {},
} = {}) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeCards = Array.isArray(cards) ? cards : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeSimulationTransactions = Array.isArray(simulationTransactions) ? simulationTransactions : [];
  const months = buildMonthRange({ mode, year, startMonth, endMonth, selectedMonth, numberOfMonths });
  const safeFilters = {
    origin: filters.origin || "todos",
    accountId: filters.accountId || "",
    cardId: filters.cardId || "",
    categoryIds: Array.isArray(filters.categoryIds) ? filters.categoryIds : [],
    includeSimulations: filters.includeSimulations !== false,
    includeRecurrences: filters.includeRecurrences !== false,
  };

  let runningBalance = null;

  const projectionMonths = months.map(monthKey => {
    const month = buildMonthProjection({
      monthKey,
      transactions: safeTransactions,
      cards: safeCards,
      invoices: safeInvoices,
      simulationTransactions: safeSimulationTransactions,
      getInitialBalanceForMonth,
      getCardInvoiceTotal,
      getInvoiceId,
      filters: safeFilters,
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

  projectionMonths.insights = buildInsights(projectionMonths);
  return projectionMonths;
}

export function buildProjectionInsights(projections = []) {
  return buildInsights(projections);
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
