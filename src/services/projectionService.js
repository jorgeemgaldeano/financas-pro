function transactionMonthKey(transaction) {
  return transaction?.competencia || transaction?.competenceMonth || String(transaction?.data || "").slice(0, 7);
}

function transactionAmount(transaction) {
  return Number(transaction?.valor) || 0;
}

function averageMonthlyValue(transactions) {
  const monthKeys = [...new Set(transactions.map(transactionMonthKey).filter(Boolean))];
  if (!monthKeys.length) return 0;
  return transactions.reduce((sum, transaction) => sum + transactionAmount(transaction), 0) / monthKeys.length;
}

export function buildMonthlyExpenseProjection({
  transactions = [],
  numberOfMonths = 3,
  baseDate = new Date(),
  monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
} = {}) {
  const monthsToProject = Math.max(1, parseInt(numberOfMonths, 10) || 1);
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const fixedExpenses = safeTransactions.filter(transaction => transaction?.fixo && transaction?.tipo === "despesa");
  const variableExpenses = safeTransactions.filter(transaction => !transaction?.fixo && transaction?.tipo === "despesa");

  const fixedAverage = averageMonthlyValue(fixedExpenses);
  const variableAverage = averageMonthlyValue(variableExpenses);

  return Array.from({ length: monthsToProject }, (_, index) => {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1 + index, 1);
    const label = `${monthLabels[date.getMonth()] || String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

    return {
      label,
      value: fixedAverage + variableAverage,
      fixo: fixedAverage,
      variavel: variableAverage,
    };
  });
}
