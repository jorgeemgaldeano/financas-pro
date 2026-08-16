// CartoesTab.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (aba "Cartões").
import { C } from "../../theme/tokens.js";
import { dateForMonthDay, fmtDate, monthOffset } from "../../utils/dateUtils.js";
import { fmtBRL } from "../../utils/moneyUtils.js";
import { signedCardAmount } from "../../services/cardInvoiceService.js";
import { Button } from "../atoms/Button.jsx";

export function CartoesTab({
  cardTotals, selMonth, monthTrans, params, expandedCards, toggleCardAccordion,
  primeiraContaCorrenteId, setModal, setForm, card, lbl, ghost, btn,
  renderCategoryEditor, adicionarAjusteFatura, abrirFaturaCartao, fecharFaturaCartao, exportCreditCardExpensesTxt,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><Button bg={C.emerald} onClick={() => { setModal("addCard"); setForm({ cor: "#00A878", contaPagamentoId: primeiraContaCorrenteId, accountId: primeiraContaCorrenteId }); }}>+ Adicionar Cartão</Button></div>
      {cardTotals.map(c => {
        const fatura = dateForMonthDay(selMonth, c.fechamento);
        const venc = dateForMonthDay(monthOffset(selMonth, 1), c.vencimento);
        const tc = monthTrans.filter(t => t.cartaoId === c.id && t.origem === "cartao");
        const aberto = expandedCards[c.id] ?? true;
        return (
          <div key={c.id} style={card()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 38, height: 24, borderRadius: 6, background: c.cor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{c.nome.slice(0, 2).toUpperCase()}</div>
                <div><div style={{ fontWeight: 800, fontSize: 14 }}>{c.nome}</div><div style={{ fontSize: 12, color: C.soft }}>Limite: {fmtBRL(c.limite)} · Fecha {c.fechamento} · Vence {c.vencimento} · Conta: {c.contaPagamentoNome}</div></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}><div style={lbl}>Fatura atual</div><div style={{ fontSize: 18, fontWeight: 800, color: c.gasto / c.limite > params.alertaLimite / 100 ? C.coral : C.text }}>{fmtBRL(c.gasto)}</div></div>
                <button onClick={() => toggleCardAccordion(c.id)} aria-expanded={aberto} style={ghost({ padding: "5px 10px", fontSize: 13 })}>{aberto ? "▲ Fechar" : "▼ Abrir"}</button>
              </div>
            </div>
            {aberto && <>
              <div style={{ background: C.border, borderRadius: 5, height: 6, marginBottom: 6 }}><div style={{ height: 6, borderRadius: 5, width: `${Math.min(100, (c.gasto / c.limite) * 100)}%`, background: c.gasto / c.limite > params.alertaLimite / 100 ? C.coral : c.cor }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.soft, marginBottom: 14 }}><span>{((c.gasto / c.limite) * 100).toFixed(0)}% utilizado</span><span>Disponível: {fmtBRL(c.disponivel)}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 9, marginBottom: 14 }}>
                <div style={{ background: C.navy, borderRadius: 7, padding: "9px 12px" }}><div style={lbl}>Fechamento</div><div style={{ fontWeight: 700 }}>{fmtDate(fatura)}</div></div>
                <div style={{ background: C.navy, borderRadius: 7, padding: "9px 12px" }}><div style={lbl}>Vencimento previsto</div><div style={{ fontWeight: 700 }}>{fmtDate(venc)}</div></div>
                <div style={{ background: C.navy, borderRadius: 7, padding: "9px 12px", border: `1px solid ${c.invoiceClosureStatus === "open" ? C.emerald : C.gold}55` }}>
                  <div style={lbl}>Situação da fatura</div>
                  <div style={{ fontWeight: 800, color: c.invoiceClosureStatus === "open" ? C.emerald : C.gold }}>{c.invoiceClosureLabel}</div>
                </div>
                <div style={{ background: C.navy, borderRadius: 7, padding: "9px 12px", border: `1px solid ${c.invoicePaidAmount >= c.invoiceTotal && c.invoiceTotal > 0 ? C.emerald : c.invoicePaidAmount > 0 ? C.gold : C.coral}55` }}>
                  <div style={lbl}>Pagamento</div>
                  <div style={{ fontWeight: 800, color: c.invoicePaidAmount >= c.invoiceTotal && c.invoiceTotal > 0 ? C.emerald : c.invoicePaidAmount > 0 ? C.gold : C.coral }}>{c.invoicePaymentStatusLabel}</div>
                  <div style={{ fontSize: 10, color: C.soft, marginTop: 3 }}>Pago {fmtBRL(c.invoicePaidAmount)} · Pendente {fmtBRL(c.invoicePendingAmount)}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <button onClick={() => adicionarAjusteFatura(c.id, "acrescimo")} style={btn(C.gold, { color: C.navy, fontSize: 12, padding: "6px 12px" })}>+ Ajuste fatura</button>
                <button onClick={() => adicionarAjusteFatura(c.id, "reducao")} style={btn(C.border, { fontSize: 12, padding: "6px 12px" })}>− Ajuste fatura</button>
                {c.invoiceClosureStatus !== "open" && <button onClick={() => abrirFaturaCartao(c.id)} style={btn(C.gold, { color: C.navy, fontSize: 12, padding: "6px 12px" })}>Reabrir fatura</button>}
                <button onClick={() => fecharFaturaCartao(c.id)} style={btn(C.emerald, { fontSize: 12, padding: "6px 12px" })}>Fechar fatura e lançar pagamento previsto</button>
                <button onClick={() => exportCreditCardExpensesTxt(c.id, selMonth)} style={btn(C.border, { fontSize: 12, padding: "6px 12px" })}>Exportar TXT</button>
              </div>
              {tc.length > 0 && (
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead><tr>{["Data", "Descrição", "Categoria", "Valor"].map(h => <th key={h} style={{ textAlign: "left", color: C.soft, fontSize: 10, padding: "3px 7px", borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {tc.map(t => (
                      <tr key={t.id}>
                        <td style={{ padding: "6px 7px", color: C.soft }}>{fmtDate(t.data)}</td>
                        <td style={{ padding: "6px 7px" }}>{t.descricao}{t.natureza === "ajuste_fatura_cartao" && <span style={{ marginLeft: 3, fontSize: 9, background: C.gold + "22", padding: "1px 4px", borderRadius: 3, color: C.gold }}>ajuste</span>}{t.totalParcelas && <span style={{ marginLeft: 3, fontSize: 9, background: C.gold + "22", padding: "1px 4px", borderRadius: 3, color: C.gold }}>{t.parcela}/{t.totalParcelas}×</span>}</td>
                        <td style={{ padding: "6px 7px", minWidth: 190 }}>{renderCategoryEditor(t, true)}</td>
                        <td style={{ padding: "6px 7px", fontWeight: 700, color: signedCardAmount(t) < 0 ? C.emerald : C.text }}>{signedCardAmount(t) < 0 ? "-" : ""}{fmtBRL(Math.abs(signedCardAmount(t)))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>}
          </div>
        );
      })}
    </div>
  );
}

export default CartoesTab;
