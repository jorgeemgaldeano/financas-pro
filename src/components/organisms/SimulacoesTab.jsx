// SimulacoesTab.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (aba "Simulações"). Simula uma compra parcelada
// sem afetar lançamentos reais; usa simulationService.js para o cálculo.
import { C } from "../../theme/tokens.js";
import { MONTHS, fmtDate } from "../../utils/dateUtils.js";
import { fmtBRL } from "../../utils/moneyUtils.js";
import { transMonthKey } from "../../services/saldoService.js";
import { normalizeSimulationInstallments, getSimulationInstallmentValue } from "../../services/simulationService.js";
import { Card } from "../atoms/Card.jsx";
import { Button } from "../atoms/Button.jsx";
import { Label } from "../atoms/Label.jsx";
import { MoneyInput } from "../atoms/MoneyInput.jsx";
import { DateInput } from "../ui/DateInput.jsx";
import { CategorySelect } from "../molecules/CategorySelect.jsx";

export function SimulacoesTab({
  cats, cards, params, sims, simTrans,
  simForm, setSimForm, requiredModal, inputStyle, inp,
  addSim, refazerSim, delSim, resolveCardCompetencia, calcularFaturaCartao,
  getCatColor, getCatIcon, getCatLabel,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Nova Simulação</div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 14 }}>Simule uma compra sem afetar os lançamentos reais.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 9 }}>
          <div><Label>Cartão</Label><select style={inputStyle("simCartaoId")} value={simForm.cartaoId || ""} onChange={e => setSimForm(f => ({ ...f, cartaoId: e.target.value }))}><option value="">Sel.</option>{cards.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
          <div><Label>Descrição</Label><input style={inputStyle("simDescricao")} placeholder="Ex: MacBook" value={simForm.descricao || ""} onChange={e => setSimForm(f => ({ ...f, descricao: e.target.value }))} /></div>
          <div><Label>Categoria</Label><CategorySelect cats={cats} value={simForm.catId} onChange={v => setSimForm(f => ({ ...f, catId: v }))} validationInfo={requiredModal} fieldKey="simCatId" /></div>
          <div><Label>Modo</Label><select style={inp} value={simForm.modoParc} onChange={e => setSimForm(f => ({ ...f, modoParc: e.target.value }))}><option value="total">Valor total</option><option value="parcela">Vlr parcela</option></select></div>
          <div><Label>Valor (R$)</Label><MoneyInput style={inputStyle("simValor")} value={simForm.valor || ""} onChange={value => setSimForm(f => ({ ...f, valor: value }))} /></div>
          <div><Label>Parcelas</Label><input style={inp} type="number" min={1} max={48} value={simForm.parcelas ?? ""} onChange={e => setSimForm(f => ({ ...f, parcelas: e.target.value }))} /></div>
          <div><Label>Data 1ª</Label><DateInput style={inputStyle("simData")} value={simForm.data || ""} onChange={value => setSimForm(f => ({ ...f, data: value }))} /></div>
          <div><Label>Competência 1ª fatura (opcional)</Label><input style={inp} type="month" value={simForm.faturaCompetencia || ""} onChange={e => setSimForm(f => ({ ...f, faturaCompetencia: e.target.value }))} /><div style={{ fontSize: 10, color: C.soft, marginTop: 3 }}>{simForm.data && simForm.cartaoId ? `Automática: ${resolveCardCompetencia(simForm.data, simForm.cartaoId)}` : "Calculada pelo fechamento se vazio."}</div></div>
        </div>
        <div style={{ marginTop: 11 }}><Button bg={C.gold} style={{ color: C.navy }} onClick={addSim}>＋ Adicionar</Button></div>
      </Card>

      {sims.length > 0 && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Simulações salvas</div>
          {sims.map(s => {
            const c = cards.find(c => c.id === s.cartaoId);
            const n = normalizeSimulationInstallments(s.parcelas);
            const vp = getSimulationInstallmentValue(s);
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 9, background: C.navy, borderRadius: 9, padding: "9px 13px", marginBottom: 7, borderLeft: `3px solid ${C.gold}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{s.descricao}</div>
                  <div style={{ fontSize: 12, color: C.soft }}>{c?.nome} · impacto em {n} parcela{n > 1 ? "s" : ""} · {n}× de {fmtBRL(vp)} · 1ª compra em {fmtDate(s.data)} · 1ª fatura {s.faturaCompetencia || resolveCardCompetencia(s.data, s.cartaoId)}{s.recalculatedAt ? ` · refeita em ${fmtDate(s.recalculatedAt.slice(0, 10))}` : ""}</div>
                </div>
                <span style={{ fontSize: 10, background: getCatColor(s.catId) + "22", color: getCatColor(s.catId), padding: "2px 7px", borderRadius: 20 }}>{getCatIcon(s.catId)} {getCatLabel(s.catId)}</span>
                <button onClick={() => refazerSim(s.id)} style={{ background: C.gold + "22", border: `1px solid ${C.gold}44`, borderRadius: 5, color: C.gold, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>Refazer</button>
                <button onClick={() => delSim(s.id)} style={{ background: C.coral + "22", border: `1px solid ${C.coral}44`, borderRadius: 5, color: C.coral, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>Excluir</button>
              </div>
            );
          })}
        </Card>
      )}

      {sims.length > 0 && cards.map(c => {
        const sc = sims.filter(s => s.cartaoId === c.id);
        if (!sc.length) return null;
        return (
          <Card key={c.id}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{c.nome} — Impacto por competência de fatura</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: 520 }}>
                <thead><tr style={{ background: C.border }}>{["Mês", "Real", "+ Sim", "Total", "Restante", "Status"].map((h, i) => <th key={h} style={{ padding: "7px 11px", textAlign: i > 0 ? "right" : "left", color: C.soft, fontSize: 10 }}>{h}</th>)}</tr></thead>
                <tbody>{Array.from(new Map(simTrans.filter(t => t.cartaoId === c.id).sort((a, b) => transMonthKey(a).localeCompare(transMonthKey(b))).map(t => [transMonthKey(t), { key: transMonthKey(t), label: `${MONTHS[parseInt(transMonthKey(t).slice(5, 7), 10) - 1]} ${transMonthKey(t).slice(0, 4)}` }])).values()).map(mo => {
                  const real = calcularFaturaCartao(c, mo.key).total;
                  const sv = simTrans.filter(t => t.cartaoId === c.id && transMonthKey(t) === mo.key).reduce((s, t) => s + t.valor, 0);
                  const tot = real + sv;
                  const rest = c.limite - tot;
                  const pct = tot / c.limite;
                  const status = pct > 1 ? "🔴 Excede" : pct > params.alertaLimite / 100 ? "🟡 Atenção" : "🟢 OK";
                  return (
                    <tr key={mo.key} style={{ borderTop: `1px solid ${C.border}`, background: pct > 1 ? C.coral + "11" : pct > params.alertaLimite / 100 ? C.gold + "0D" : "transparent" }}>
                      <td style={{ padding: "8px 11px", fontWeight: 600 }}>{mo.label}</td>
                      <td style={{ padding: "8px 11px", textAlign: "right", color: C.soft }}>{real > 0 ? fmtBRL(real) : "—"}</td>
                      <td style={{ padding: "8px 11px", textAlign: "right", color: sv > 0 ? C.gold : C.soft, fontWeight: sv > 0 ? 700 : 400 }}>{sv > 0 ? "+" + fmtBRL(sv) : "—"}</td>
                      <td style={{ padding: "8px 11px", textAlign: "right", fontWeight: 700 }}>{tot > 0 ? fmtBRL(tot) : "—"}</td>
                      <td style={{ padding: "8px 11px", textAlign: "right", color: rest < 0 ? C.coral : rest < c.limite * 0.15 ? C.gold : C.emerald, fontWeight: 700 }}>{fmtBRL(rest)}</td>
                      <td style={{ padding: "8px 11px", textAlign: "right", fontSize: 11 }}>{tot > 0 ? status : "—"}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </Card>
        );
      })}

      {sims.length === 0 && (
        <Card style={{ textAlign: "center", padding: "44px 24px", color: C.soft }}>
          <div style={{ fontSize: 30, marginBottom: 9 }}>🔬</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>Nenhuma simulação ativa</div>
        </Card>
      )}
    </div>
  );
}

export default SimulacoesTab;
