// ContasTab.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (aba "Contas").
import { C } from "../../theme/tokens.js";
import { fmtDate } from "../../utils/dateUtils.js";
import { fmtBRL } from "../../utils/moneyUtils.js";
import { valorRealizado } from "../../services/saldoService.js";
import { Button, GhostButton } from "../atoms/Button.jsx";
import { MoneyInput } from "../atoms/MoneyInput.jsx";

export function ContasTab({
  showContaForm, setShowContaForm, novaContaForm, setNovaContaForm, addContaFromForm, inputStyle,
  contas, monthTrans, getSaldoInicialConta, selMonth, expandedAccounts, toggleAccountAccordion,
  setSaldoInicialContaMes, renderCategoryEditor, card, lbl, inp, ghost,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Contas</div>
            <div style={{ fontSize: 13, color: C.soft }}>Cadastre e acompanhe contas correntes, vale alimentação e vale refeição.</div>
          </div>
          <Button onClick={() => setShowContaForm(v => !v)}>+ Nova Conta</Button>
        </div>
        {showContaForm && <div style={{ marginTop: 14, background: C.navy, borderRadius: 10, padding: "13px 15px", border: `1px dashed ${C.border}` }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Nova conta</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px auto", gap: 8, alignItems: "end" }}>
            <div><div style={lbl}>Nome</div><input style={inputStyle("novaContaNome")} placeholder="Ex: Banco do Brasil" value={novaContaForm.nome} onChange={e => setNovaContaForm(f => ({ ...f, nome: e.target.value }))} onKeyDown={e => e.key === "Enter" && addContaFromForm()} /></div>
            <div><div style={lbl}>Tipo</div><select style={inp} value={novaContaForm.tipo} onChange={e => setNovaContaForm(f => ({ ...f, tipo: e.target.value }))}><option value="corrente">Conta Corrente</option><option value="vale_alimentacao">Vale Alimentação</option><option value="vale_refeicao">Vale Refeição</option></select></div>
            <div style={{ display: "flex", gap: 8 }}><Button style={{ whiteSpace: "nowrap" }} onClick={addContaFromForm}>Salvar</Button><GhostButton onClick={() => setShowContaForm(false)}>Cancelar</GhostButton></div>
          </div>
        </div>}
      </div>
      {contas.map(ct => {
        const ctTrans = monthTrans.filter(t => t.contaId === ct.id).sort((a, b) => b.data.localeCompare(a.data));
        const entradas = ctTrans.filter(t => t.tipo === "receita").reduce((s, t) => s + valorRealizado(t), 0);
        const saidas = ctTrans.filter(t => t.tipo === "despesa").reduce((s, t) => s + valorRealizado(t), 0);
        const saldoIni = getSaldoInicialConta(ct, selMonth);
        const saldoFin = saldoIni + entradas - saidas;
        const base = saldoIni + entradas;
        const pct = base > 0 ? saidas / base : 0;
        const aberto = expandedAccounts[ct.id] ?? true;
        return (
          <div key={ct.id} style={card()}>
            {/* Header da conta */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: ct.cor + "22", border: `2px solid ${ct.cor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{ct.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{ct.nome}</div>
                  <div style={{ fontSize: 11, color: C.soft, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {ct.tipo === "corrente" ? "Conta Corrente" : ct.tipo === "vale_alimentacao" ? "Vale Alimentação" : "Vale Refeição"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={lbl}>Saldo do mês</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: saldoFin >= 0 ? C.emerald : C.coral }}>{fmtBRL(saldoFin)}</div>
                </div>
                <button onClick={() => toggleAccountAccordion(ct.id)} aria-expanded={aberto} style={ghost({ padding: "5px 10px", fontSize: 13 })}>{aberto ? "▲ Fechar" : "▼ Abrir"}</button>
              </div>
            </div>

            {aberto && <>
              {/* Barra de uso (só para vales) */}
              {ct.tipo !== "corrente" && entradas > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ background: C.border, borderRadius: 5, height: 7 }}>
                    <div style={{ height: 7, borderRadius: 5, width: `${Math.min(100, pct * 100)}%`, background: pct > 0.85 ? C.coral : ct.cor }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 4, color: C.soft }}>
                    <span>Crédito: {fmtBRL(entradas)}</span>
                    <span>Usado: {(pct * 100).toFixed(0)}% · Disponível: {fmtBRL(saldoFin)}</span>
                  </div>
                </div>
              )}

              {/* Resumo: saldo inicial | entradas | saidas | saldo final */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9, marginBottom: 14 }}>
                <div style={{ background: C.navy, borderRadius: 8, padding: "10px 13px" }}>
                  <div style={lbl}>Saldo Inicial do Mês</div>
                  <MoneyInput style={{ ...inp, padding: "5px 8px", fontSize: 12 }} value={String(saldoIni)} onChange={value => setSaldoInicialContaMes(ct.id, selMonth, value)} />
                </div>
                <div style={{ background: C.navy, borderRadius: 8, padding: "10px 13px" }}>
                  <div style={lbl}>↑ Entradas</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.emerald }}>{fmtBRL(entradas)}</div>
                </div>
                <div style={{ background: C.navy, borderRadius: 8, padding: "10px 13px" }}>
                  <div style={lbl}>↓ Saídas</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.coral }}>{fmtBRL(saidas)}</div>
                </div>
                <div style={{ background: saldoFin >= 0 ? C.emerald + "11" : C.coral + "11", border: `1px solid ${saldoFin >= 0 ? C.emerald + "44" : C.coral + "44"}`, borderRadius: 8, padding: "10px 13px" }}>
                  <div style={lbl}>Saldo Final</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: saldoFin >= 0 ? C.emerald : C.coral }}>{fmtBRL(saldoFin)}</div>
                </div>
              </div>

              {/* Tabela de lançamentos */}
              {ctTrans.length > 0 && (
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Data", "Descrição", "Categoria", "Valor"].map((h, i) => <th key={h} style={{ padding: "6px 10px", textAlign: i === 3 ? "right" : "left", color: C.soft, fontSize: 10, fontWeight: 600 }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {ctTrans.map(t => (
                      <tr key={t.id} style={{ borderTop: `1px solid ${C.border}` }}>
                        <td style={{ padding: "8px 10px", color: C.soft, whiteSpace: "nowrap" }}>{fmtDate(t.data)}</td>
                        <td style={{ padding: "8px 10px" }}>
                          {t.descricao}
                          {t.fixo && <span style={{ marginLeft: 4, fontSize: 9, background: C.border, padding: "1px 4px", borderRadius: 3, color: C.soft }}>fixo</span>}
                          {t.status && <span style={{ marginLeft: 4, fontSize: 9, background: (t.status === "previsto" ? C.gold : C.emerald) + "22", padding: "1px 4px", borderRadius: 3, color: t.status === "previsto" ? C.gold : C.emerald }}>{t.status}</span>}
                        </td>
                        <td style={{ padding: "8px 10px", minWidth: 190 }}>
                          {renderCategoryEditor(t, true)}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: t.tipo === "receita" ? C.emerald : C.coral }}>
                          {t.tipo === "receita" ? "+" : "-"}{fmtBRL(valorRealizado(t))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {ctTrans.length === 0 && (
                <div style={{ textAlign: "center", padding: "22px 0", color: C.soft, fontSize: 13 }}>Nenhum lançamento neste mês.</div>
              )}
            </>}
          </div>
        );
      })}
    </div>
  );
}

export default ContasTab;
