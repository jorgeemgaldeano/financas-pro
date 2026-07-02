import { DateInput } from "../ui/DateInput.jsx";

export const EMPTY_TRANSACTION_FILTERS = {
  dataInicio: "",
  dataFim: "",
  rootCatId: "",
  origem: "",
  tipo: "",
  status: "",
};

export function getTransactionFilterStatus(transaction) {
  const rawStatus = String(transaction?.status || "").trim().toLowerCase();

  if (["previsto", "parcial", "pago", "cancelado"].includes(rawStatus)) {
    return rawStatus;
  }

  // Compatibilidade com lançamentos antigos, criados antes da introdução formal de status.
  // Na UI atual, lançamentos sem status são exibidos como pagos; o filtro deve seguir a mesma regra.
  const amount = Number(transaction?.valor) || 0;
  const paidAmount = Number(transaction?.valorPago);

  if (Number.isFinite(paidAmount) && paidAmount > 0 && amount > 0 && paidAmount < amount) {
    return "parcial";
  }

  if (Number.isFinite(paidAmount) && amount > 0 && paidAmount >= amount) {
    return "pago";
  }

  return "pago";
}

export function filterTransactions({
  transactions = [],
  monthTransactions = [],
  filters = EMPTY_TRANSACTION_FILTERS,
  cats = [],
  findRootCat,
}) {
  const normalizedFilters = {
    ...EMPTY_TRANSACTION_FILTERS,
    ...(filters || {}),
  };

  const hasDateFilter = Boolean(normalizedFilters.dataInicio || normalizedFilters.dataFim);
  const baseTransactions = hasDateFilter ? transactions : monthTransactions;

  return [...baseTransactions]
    .filter(transaction => {
      if (normalizedFilters.dataInicio && String(transaction.data || "") < normalizedFilters.dataInicio) {
        return false;
      }

      if (normalizedFilters.dataFim && String(transaction.data || "") > normalizedFilters.dataFim) {
        return false;
      }

      if (normalizedFilters.rootCatId) {
        const rootCategory = findRootCat?.(cats, transaction.catId);
        if (rootCategory?.id !== normalizedFilters.rootCatId) {
          return false;
        }
      }

      if (normalizedFilters.origem && transaction.origem !== normalizedFilters.origem) {
        return false;
      }

      if (normalizedFilters.tipo && transaction.tipo !== normalizedFilters.tipo) {
        return false;
      }

      if (normalizedFilters.status) {
        const transactionStatus = getTransactionFilterStatus(transaction);
        if (transactionStatus !== normalizedFilters.status) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
}

export function TransactionFiltersPanel({
  filters = EMPTY_TRANSACTION_FILTERS,
  onChange,
  onClear,
  rootCats = [],
  card,
  lbl,
  inp,
  ghost,
}) {
  const currentFilters = {
    ...EMPTY_TRANSACTION_FILTERS,
    ...(filters || {}),
  };

  const updateFilter = (field, value) => {
    onChange?.({
      ...currentFilters,
      [field]: value,
    });
  };

  const clearFilters = () => {
    if (onClear) {
      onClear();
      return;
    }

    onChange?.(EMPTY_TRANSACTION_FILTERS);
  };

  return (
    <div style={card()}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Filtros</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
        <div>
          <div style={lbl}>Data início</div>
          <DateInput
            style={inp}
            value={currentFilters.dataInicio}
            onChange={value => updateFilter("dataInicio", value)}
          />
        </div>

        <div>
          <div style={lbl}>Data fim</div>
          <DateInput
            style={inp}
            value={currentFilters.dataFim}
            onChange={value => updateFilter("dataFim", value)}
          />
        </div>

        <div>
          <div style={lbl}>Categoria principal</div>
          <select
            style={inp}
            value={currentFilters.rootCatId}
            onChange={event => updateFilter("rootCatId", event.target.value)}
          >
            <option value="">Todas</option>
            {rootCats.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={lbl}>Origem</div>
          <select
            style={inp}
            value={currentFilters.origem}
            onChange={event => updateFilter("origem", event.target.value)}
          >
            <option value="">Todas</option>
            <option value="corrente">Conta corrente</option>
            <option value="cartao">Cartão</option>
            <option value="vale_alimentacao">Vale alimentação</option>
            <option value="vale_refeicao">Vale refeição</option>
          </select>
        </div>

        <div>
          <div style={lbl}>Tipo</div>
          <select
            style={inp}
            value={currentFilters.tipo}
            onChange={event => updateFilter("tipo", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </div>

        <div>
          <div style={lbl}>Status</div>
          <select
            style={inp}
            value={currentFilters.status}
            onChange={event => updateFilter("status", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="previsto">Previsto</option>
            <option value="parcial">Parcial</option>
            <option value="pago">Pago</option>
          </select>
        </div>

        <button onClick={clearFilters} style={ghost({ height: 38, alignSelf: "end" })}>
          Limpar filtros
        </button>
      </div>
    </div>
  );
}