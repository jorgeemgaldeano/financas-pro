// LancamentosTab.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (aba "Lançamentos").
import { C } from "../../theme/tokens.js";
import { fmtDate, formatMonthBR, todayIso } from "../../utils/dateUtils.js";
import { fmtBRL } from "../../utils/moneyUtils.js";
import { isTransfer } from "../../services/transferService.js";
import { EMPTY_TRANSACTION_FILTERS, TransactionFiltersPanel } from "../finance/TransactionFiltersPanel.jsx";
import { Button } from "../atoms/Button.jsx";

export function LancamentosTab({
  transactionFilters, setTransactionFilters, rootCats, card, lbl, inp, ghost,
  contasCorrentes, setForm, setModal, openAddTrans,
  filteredTransactions, cards, renderCategoryEditor, valorExibicaoLancamento,
  baixarTrans, baixarParcialTrans, delTrans, excluirTransferencia, selMonth,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ color: C.soft, fontSize: 12 }}>
          {transactionFilters.dataInicio || transactionFilters.dataFim
            ? "Filtro por período ativo"
            : `Exibindo mês selecionado: ${formatMonthBR(selMonth)}`}
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Button bg="#0891B2" disabled={contasCorrentes.length < 2} onClick={() => { setForm({ fromAccountId: contasCorrentes[0]?.id || "", toAccountId: contasCorrentes[1]?.id || "", data: todayIso() }); setModal("addTransfer"); }}>🔁 Transferir</Button>
          <Button bg={C.emerald} onClick={openAddTrans}>+ Novo Lançamento</Button>
        </div>
      </div>

      <TransactionFiltersPanel
        filters={transactionFilters}
        onChange={setTransactionFilters}
        onClear={() => setTransactionFilters(EMPTY_TRANSACTION_FILTERS)}
        rootCats={rootCats}
        card={card}
        lbl={lbl}
        inp={inp}
        ghost={ghost}
      />

      <div style={card({ padding: 0, overflow: "hidden" })}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: C.border }}>{["Data", "Descrição", "Categoria", "Origem", "Tipo", "Status", "Valor", ""].map(h => <th key={h} style={{ padding: "9px 13px", textAlign: "left", fontWeight: 600, color: C.soft, fontSize: 11 }}>{h}</th>)}</tr></thead>
          <tbody>
            {filteredTransactions.length === 0 && <tr><td colSpan={8} style={{ padding: 28, textAlign: "center", color: C.soft }}>Nenhum lançamento encontrado para os filtros informados.</td></tr>}
            {filteredTransactions.map(t => (
              <tr key={t.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "9px 13px", color: C.soft }}>{fmtDate(t.data)}</td>
                <td style={{ padding: "9px 13px" }}>
                  {t.descricao}
                  {t.fixo && <span style={{ marginLeft: 5, fontSize: 10, background: C.border, padding: "2px 5px", borderRadius: 4, color: C.soft }}>fixo</span>}
                  {t.totalParcelas && <span style={{ marginLeft: 5, fontSize: 10, background: C.gold + "22", padding: "2px 5px", borderRadius: 4, color: C.gold }}>{t.parcela}/{t.totalParcelas}×</span>}
                  {t.importado && <span style={{ marginLeft: 5, fontSize: 10, background: C.emerald + "22", padding: "2px 5px", borderRadius: 4, color: C.emerald }}>importado</span>}
                </td>
                <td style={{ padding: "9px 13px", minWidth: 210 }}>
                  {isTransfer(t) ? <span style={{ color: C.soft, fontSize: 12 }}>— (transferência)</span> : renderCategoryEditor(t)}
                </td>
                <td style={{ padding: "9px 13px", color: C.soft, fontSize: 12 }}>{t.origem === "cartao" ? (cards.find(c => c.id === t.cartaoId)?.nome || "Cartão") : t.origem === "vale_alimentacao" ? "🛒 Vale Alim." : t.origem === "vale_refeicao" ? "🍽️ Vale Ref." : "🏦 Corrente"}</td>
                <td style={{ padding: "9px 13px" }}>{isTransfer(t) ? <span style={{ color: "#0891B2", fontWeight: 600, fontSize: 12 }}>🔁 Transferência</span> : <span style={{ color: t.tipo === "receita" ? C.emerald : C.coral, fontWeight: 600, fontSize: 12 }}>{t.tipo === "receita" ? "↑ Receita" : "↓ Despesa"}</span>}</td>
                <td style={{ padding: "9px 13px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: (t.status === "previsto" ? C.gold : t.status === "parcial" ? "#CE93D8" : C.emerald) + "22", color: t.status === "previsto" ? C.gold : t.status === "parcial" ? "#CE93D8" : C.emerald }}>
                    {t.status === "previsto" ? "Previsto" : t.status === "parcial" ? `Parcial (${fmtBRL(t.valorPago || 0)})` : "Pago"}
                  </span>
                </td>
                <td style={{ padding: "9px 13px", fontWeight: 700, color: t.tipo === "receita" ? C.emerald : C.text }}>{t.tipo === "receita" ? "+" : "-"}{fmtBRL(valorExibicaoLancamento(t))}</td>
                <td style={{ padding: "9px 13px", display: "flex", gap: 5, alignItems: "center" }}>
                  {(t.status === "previsto" || t.status === "parcial") && <button onClick={() => baixarTrans(t.id)} style={ghost({ padding: "3px 7px", fontSize: 11, color: C.emerald })}>Baixar</button>}
                  {(t.status === "previsto" || t.status === "parcial") && <button onClick={() => baixarParcialTrans(t.id)} style={ghost({ padding: "3px 7px", fontSize: 11, color: C.gold })}>Parcial</button>}
                  <button onClick={() => isTransfer(t) ? excluirTransferencia(t.transferId) : delTrans(t.id)} style={{ background: "transparent", border: "none", color: C.coral, cursor: "pointer", fontSize: 16 }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LancamentosTab;
