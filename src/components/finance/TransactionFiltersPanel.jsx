import { DateInput } from "../ui/DateInput.jsx";

export const EMPTY_TRANSACTION_FILTERS = {
  dataInicio: "",
  dataFim: "",
  rootCatId: "",
  origem: "",
  tipo: "",
  status: "",
};

export function filterTransactions({ transactions = [], monthTransactions = [], filters = EMPTY_TRANSACTION_FILTERS, cats = [], findRootCat }) {
  const hasDateRange = Boolean(filters.dataInicio || filters.dataFim);
  const baseRows = hasDateRange ? transactions : monthTransactions;

  return [...baseRows]
    .filter(t => !filters.dataInicio || (t.data || "") >= filters.dataInicio)
    .filter(t => !filters.dataFim || (t.data || "") <= filters.dataFim)
    .filter(t => !filters.rootCatId || findRootCat?.(cats, t.catId)?.id === filters.rootCatId)
    .filter(t => !filters.origem || t.origem === filters.origem)
    .filter(t => !filters.tipo || t.tipo === filters.tipo)
    .filter(t => !filters.status || t.status === filters.status)
    .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
}

export function TransactionFiltersPanel({ filters, onChange, onClear, rootCats, card, lbl, inp, ghost }) {
  const update = patch => onChange?.({ ...filters, ...patch });

  return (
    <div style={card()}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, alignItems:"end" }}>
        <div>
          <div style={lbl}>Data início</div>
          <DateInput style={inp} value={filters.dataInicio} onChange={value=>update({ dataInicio:value })}/>
        </div>
        <div>
          <div style={lbl}>Data fim</div>
          <DateInput style={inp} value={filters.dataFim} onChange={value=>update({ dataFim:value })}/>
        </div>
        <div>
          <div style={lbl}>Categoria principal</div>
          <select style={inp} value={filters.rootCatId} onChange={e=>update({ rootCatId:e.target.value })}>
            <option value="">Todas</option>
            {rootCats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.nome}</option>)}
          </select>
        </div>
        <div>
          <div style={lbl}>Origem</div>
          <select style={inp} value={filters.origem} onChange={e=>update({ origem:e.target.value })}>
            <option value="">Todas</option>
            <option value="corrente">Conta corrente</option>
            <option value="cartao">Cartão</option>
            <option value="vale_alimentacao">Vale alimentação</option>
            <option value="vale_refeicao">Vale refeição</option>
          </select>
        </div>
        <div>
          <div style={lbl}>Tipo</div>
          <select style={inp} value={filters.tipo} onChange={e=>update({ tipo:e.target.value })}>
            <option value="">Todos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </div>
        <div>
          <div style={lbl}>Status</div>
          <select style={inp} value={filters.status} onChange={e=>update({ status:e.target.value })}>
            <option value="">Todos</option>
            <option value="previsto">Previsto</option>
            <option value="parcial">Parcial</option>
            <option value="pago">Pago</option>
          </select>
        </div>
        <button onClick={onClear} style={ghost({ height:38 })}>Limpar filtros</button>
      </div>
    </div>
  );
}
