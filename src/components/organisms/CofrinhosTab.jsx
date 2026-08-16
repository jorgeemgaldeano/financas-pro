// CofrinhosTab.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (aba "Cofrinhos", v0.3.34/DEC-0035/RN032).
import { C } from "../../theme/tokens.js";
import { fmtDate, formatMonthBR, todayIso, addMonthsToDate } from "../../utils/dateUtils.js";
import { fmtBRL } from "../../utils/moneyUtils.js";
import { simularAporteMensal } from "../../services/cofrinhoService.js";
import { Card } from "../atoms/Card.jsx";
import { Button, GhostButton } from "../atoms/Button.jsx";
import { IconButton } from "../atoms/IconButton.jsx";
import { ProgressStat } from "../molecules/ProgressStat.jsx";

const STATUS_INFO = {
  concluido: { label: "✅ Concluído", color: C.emerald },
  atrasado: { label: "⚠ Atrasado", color: C.coral },
  em_dia: { label: "Em dia", color: C.gold },
};

export function CofrinhosTab({ cofrinhos, selMonth, setForm, setModal, excluirCofrinho, excluirMovimentoCofrinho }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🐷 Cofrinhos</div>
            <div style={{ fontSize: 13, color: C.soft }}>
              Objetivos de poupança com ledger próprio de aportes/retiradas — não é a mesma coisa que Metas (limite de gasto por categoria) e não movimenta o saldo das suas contas.
            </div>
          </div>
          <Button onClick={() => { setForm({ dataAlvo: addMonthsToDate(todayIso(), 6) }); setModal("addCofrinho"); }}>+ Novo cofrinho</Button>
        </div>
      </Card>

      {cofrinhos.length === 0 ? (
        <Card>
          <div style={{ fontSize: 13, color: C.soft, textAlign: "center", padding: "20px 0" }}>Nenhum cofrinho ainda. Crie o primeiro para simular o aporte mensal necessário até a data-alvo.</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
          {cofrinhos.map(cof => {
            const sim = simularAporteMensal(cof, selMonth);
            const pct = cof.valorAlvo > 0 ? Math.min(sim.saldoAtual / cof.valorAlvo, 1) : 0;
            const statusInfo = STATUS_INFO[sim.status];
            return (
              <Card key={cof.id}>
                <ProgressStat
                  title={cof.nome}
                  subtitle={`Alvo: ${fmtDate(cof.dataAlvo)}`}
                  badgeLabel={statusInfo.label}
                  badgeColor={statusInfo.color}
                  valueLabel={<div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{fmtBRL(sim.saldoAtual)}</span><span style={{ fontSize: 12, color: C.soft }}>/ {fmtBRL(cof.valorAlvo)}</span></div>}
                  pct={pct}
                  barColor={statusInfo.color}
                  caption={`${(pct * 100).toFixed(0)}% do alvo`}
                />

                {sim.status !== "concluido" && (
                  <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 11px", marginBottom: 10, fontSize: 12 }}>
                    <div>Aporte sugerido/mês: <strong style={{ color: C.text }}>{fmtBRL(sim.aporteSugerido)}</strong></div>
                    <div style={{ color: C.soft, marginTop: 2 }}>No ritmo sugerido, atinge em {formatMonthBR(sim.projecaoMes)}.</div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginBottom: cof.aportes.length ? 10 : 0 }}>
                  <Button bg={C.emerald} style={{ flex: 1, padding: "7px 10px", fontSize: 12 }} onClick={() => { setForm({ cofrinhoId: cof.id, tipoMovimento: "aporte", data: todayIso() }); setModal("movimentoCofrinho"); }}>+ Aporte</Button>
                  <Button bg={C.coral} style={{ flex: 1, padding: "7px 10px", fontSize: 12 }} disabled={sim.saldoAtual <= 0} onClick={() => { setForm({ cofrinhoId: cof.id, tipoMovimento: "retirada", data: todayIso() }); setModal("movimentoCofrinho"); }}>− Retirada</Button>
                  <GhostButton style={{ padding: "7px 10px" }} title="Excluir cofrinho" onClick={() => { if (window.confirm(`Excluir o cofrinho "${cof.nome}"? O histórico de aportes será perdido.`)) excluirCofrinho(cof.id); }}>🗑</GhostButton>
                </div>

                {cof.aportes.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 120, overflowY: "auto" }}>
                    {[...cof.aportes].sort((a, b) => b.data.localeCompare(a.data)).map(mv => (
                      <div key={mv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: C.soft }}>
                        <span>{fmtDate(mv.data)} — {mv.tipo === "retirada" ? "Retirada" : "Aporte"}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <strong style={{ color: mv.tipo === "retirada" ? C.coral : C.emerald }}>{mv.tipo === "retirada" ? "−" : "+"}{fmtBRL(mv.valor)}</strong>
                          <IconButton style={{ fontSize: 12 }} onClick={() => excluirMovimentoCofrinho(cof.id, mv.id)}>×</IconButton>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CofrinhosTab;
