// DashboardTab.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (aba "Dashboard").
import { C } from "../../theme/tokens.js";
import { MONTHS } from "../../utils/dateUtils.js";
import { fmtBRL } from "../../utils/moneyUtils.js";
import { valorRealizado } from "../../services/saldoService.js";
import { BarChart } from "../charts/BarChart.jsx";
import { DonutChart } from "../charts/DonutChart.jsx";

export function DashboardTab({
  card, lbl, big,
  saldoInicialTotal, contas, getSaldoInicialConta, selMonth,
  receitas, receitaCorr, receitaVales, despCorrTotal, despCorr, despVales,
  cardTotals, despCart, saldoFinal, monthTrans, last6, catBreakdown, selMon, params,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── KPIs principais ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>

        {/* Saldo Inicial */}
        <div style={card()}>
          <div style={lbl}>Saldo Inicial</div>
          <div style={big(C.text)}>{fmtBRL(saldoInicialTotal)}</div>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            {contas.map(ct => (
              <div key={ct.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: C.soft }}>{ct.icon} {ct.nome}</span>
                <span>{fmtBRL(getSaldoInicialConta(ct, selMonth))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Entradas */}
        <div style={card()}>
          <div style={lbl}>Entradas do Mês</div>
          <div style={big(C.emerald)}>{fmtBRL(receitas)}</div>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: C.soft }}>🏦 Corrente</span><span style={{ color: C.emerald }}>{fmtBRL(receitaCorr)}</span></div>
            {receitaVales > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: C.soft }}>🎫 Vales</span><span style={{ color: "#84CC16" }}>{fmtBRL(receitaVales)}</span></div>}
          </div>
        </div>

        {/* Despesas Correntes */}
        <div style={card()}>
          <div style={lbl}>Desp. Correntes</div>
          <div style={big(C.gold)}>{fmtBRL(despCorrTotal)}</div>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: C.soft }}>🏦 Corrente</span><span style={{ color: C.gold }}>{fmtBRL(despCorr)}</span></div>
            {despVales > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: C.soft }}>🎫 Vales</span><span style={{ color: "#F97316" }}>{fmtBRL(despVales)}</span></div>}
          </div>
        </div>

        {/* Faturas do Cartão */}
        <div style={card()}>
          <div style={lbl}>Faturas do Mês</div>
          <div style={big("#CE93D8")}>{fmtBRL(despCart)}</div>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            {cardTotals.filter(c => c.gasto > 0).map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: C.soft }}>💳 {c.nome}</span>
                <span style={{ color: "#CE93D8" }}>{fmtBRL(c.gasto)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Saldo Final */}
        <div style={{ ...card(), border: `1px solid ${saldoFinal >= 0 ? C.emerald + "66" : C.coral + "66"}`, background: saldoFinal >= 0 ? C.emerald + "0A" : C.coral + "0A" }}>
          <div style={lbl}>Saldo Final</div>
          <div style={big(saldoFinal >= 0 ? C.emerald : C.coral)}>{fmtBRL(saldoFinal)}</div>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: C.soft }}>Inicial</span><span>{fmtBRL(saldoInicialTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: C.soft }}>+ Entradas</span><span style={{ color: C.emerald }}>+{fmtBRL(receitas)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: C.soft }}>− Correntes</span><span style={{ color: C.gold }}>-{fmtBRL(despCorrTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: C.soft }}>Faturas abertas</span><span style={{ color: "#CE93D8" }}>{fmtBRL(despCart)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Todas as contas / vales ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
        {contas.map(ct => {
          const entradas = monthTrans.filter(t => t.contaId === ct.id && t.tipo === "receita").reduce((s, t) => s + valorRealizado(t), 0);
          const saidas = monthTrans.filter(t => t.contaId === ct.id && t.tipo === "despesa").reduce((s, t) => s + valorRealizado(t), 0);
          const saldoIni = getSaldoInicialConta(ct, selMonth);
          const saldoFin = saldoIni + entradas - saidas;
          const base = saldoIni + entradas;
          const pct = base > 0 ? saidas / base : 0;
          const isVale = ct.tipo !== "corrente";
          return (
            <div key={ct.id} style={card()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 18 }}>{ct.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{ct.nome}</div>
                    <div style={{ fontSize: 10, color: C.soft }}>{ct.tipo === "corrente" ? "Conta Corrente" : ct.tipo === "vale_alimentacao" ? "Vale Alimentação" : "Vale Refeição"}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 9 }}>
                <div style={{ background: C.navy, borderRadius: 6, padding: "7px 8px" }}>
                  <div style={{ fontSize: 9, color: C.soft, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Inicial</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{fmtBRL(saldoIni)}</div>
                </div>
                <div style={{ background: C.navy, borderRadius: 6, padding: "7px 8px" }}>
                  <div style={{ fontSize: 9, color: C.soft, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{isVale ? "Crédito" : "Entradas"}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.emerald }}>+{fmtBRL(entradas)}</div>
                </div>
                <div style={{ background: C.navy, borderRadius: 6, padding: "7px 8px" }}>
                  <div style={{ fontSize: 9, color: C.soft, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Saídas</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.coral }}>-{fmtBRL(saidas)}</div>
                </div>
              </div>
              {isVale && base > 0 && (
                <div style={{ marginBottom: 7 }}>
                  <div style={{ background: C.border, borderRadius: 4, height: 5 }}>
                    <div style={{ height: 5, borderRadius: 4, width: `${Math.min(100, pct * 100)}%`, background: pct > 0.85 ? C.coral : ct.cor }} />
                  </div>
                  <div style={{ fontSize: 10, color: C.soft, marginTop: 3 }}>{(pct * 100).toFixed(0)}% utilizado</div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 7, borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.soft }}>Saldo final</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: saldoFin >= 0 ? ct.cor : C.coral }}>{fmtBRL(saldoFin)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Gráficos ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={card()}><div style={{ ...lbl, marginBottom: 12 }}>Despesas — Últimos 6 meses</div><BarChart data={last6} color={C.emerald} height={100} /></div>
        <div style={card()}>
          <div style={{ ...lbl, marginBottom: 10 }}>Por Categoria — {MONTHS[selMon - 1]}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {catBreakdown.length > 0 && (<><DonutChart segments={catBreakdown.map(x => ({ value: x.val, color: x.color }))} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                {catBreakdown.slice(0, 6).map(x => (
                  <div key={x.cat} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: 2, background: x.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, flex: 1 }}>{x.cat}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{fmtBRL(x.val)}</span>
                  </div>
                ))}
              </div></>)}
            {catBreakdown.length === 0 && <span style={{ color: C.soft }}>Sem despesas</span>}
          </div>
        </div>
      </div>

      {/* ── Cartões de crédito ── */}
      <div>
        <div style={{ ...lbl, marginBottom: 10 }}>Cartões de Crédito</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          {cardTotals.map(c => (
            <div key={c.id} style={card()}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}><div style={{ width: 9, height: 9, borderRadius: 2, background: c.cor }} /><span style={{ fontWeight: 700 }}>{c.nome}</span></div>
              <div style={lbl}>Gasto / Limite</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: c.gasto / c.limite > params.alertaLimite / 100 ? C.coral : C.text }}>{fmtBRL(c.gasto)} <span style={{ fontSize: 11, fontWeight: 400, color: C.soft }}>/ {fmtBRL(c.limite)}</span></div>
              <div style={{ marginTop: 7, background: C.border, borderRadius: 4, height: 5 }}><div style={{ height: 5, borderRadius: 4, width: `${Math.min(100, (c.gasto / c.limite) * 100)}%`, background: c.gasto / c.limite > params.alertaLimite / 100 ? C.coral : C.emerald }} /></div>
              <div style={{ marginTop: 4, fontSize: 11, color: C.soft }}>Disponível: {fmtBRL(c.disponivel)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardTab;
