// ProjecoesTab.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (aba "Projeções") — a maior organism, com filtros,
// KPIs, gráfico de fluxo de caixa e detalhamento expansível por competência.
import { Fragment } from "react";
import { C } from "../../theme/tokens.js";
import { fmtDate } from "../../utils/dateUtils.js";
import { fmtBRL } from "../../utils/moneyUtils.js";
import { CashFlowChart } from "../charts/CashFlowChart.jsx";
import { BarChart } from "../charts/BarChart.jsx";
import { MonthShortInput } from "../molecules/MonthShortInput.jsx";

export function ProjecoesTab({
  card, lbl, big, inp,
  projectionMode, setProjectionMode, projectionYear, setProjectionYear,
  projectionStartMonth, setProjectionStartMonth, projectionEndMonth, setProjectionEndMonth,
  projectionFilters, setProjectionFilters, contas, cards, cats,
  projectionFirst, projectionTotals, projectionLast, projectionInsights, projections,
  expandedProjectionMonths, setExpandedProjectionMonths, getCatLabel, last6,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Projeções reais e fluxo de caixa</div>
            <div style={{ fontSize: 13, color: C.soft }}>Baseado em receitas, despesas, pagamentos de fatura e simulações existentes no sistema.</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
            <div>
              <div style={lbl}>Modo</div>
              <select style={{ ...inp, width: 130 }} value={projectionMode} onChange={e => setProjectionMode(e.target.value)}>
                <option value="ano">Ano</option>
                <option value="periodo">Período</option>
              </select>
            </div>
            {projectionMode === "ano" ? (
              <div>
                <div style={lbl}>Ano</div>
                <input style={{ ...inp, width: 100 }} type="number" min="2000" max="2100" value={projectionYear} onChange={e => setProjectionYear(e.target.value)} />
              </div>
            ) : (
              <>
                <div>
                  <div style={lbl}>Início</div>
                  <MonthShortInput style={inp} value={projectionStartMonth} onChange={setProjectionStartMonth} />
                </div>
                <div>
                  <div style={lbl}>Fim</div>
                  <MonthShortInput style={inp} value={projectionEndMonth} onChange={setProjectionEndMonth} />
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 13px", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10 }}>Filtros da projeção</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, alignItems: "end" }}>
            <div>
              <div style={lbl}>Origem</div>
              <select style={inp} value={projectionFilters.origin} onChange={e => setProjectionFilters(prev => ({ ...prev, origin: e.target.value }))}>
                <option value="todos">Todas</option>
                <option value="receitas">Receitas</option>
                <option value="despesas">Despesas</option>
                <option value="faturas">Cartões / Faturas</option>
                <option value="simulacoes">Simulações</option>
              </select>
            </div>
            <div>
              <div style={lbl}>Conta</div>
              <select style={inp} value={projectionFilters.accountId} onChange={e => setProjectionFilters(prev => ({ ...prev, accountId: e.target.value }))}>
                <option value="">Todas</option>
                {contas.map(conta => <option key={conta.id} value={conta.id}>{conta.nome}</option>)}
              </select>
            </div>
            <div>
              <div style={lbl}>Cartão</div>
              <select style={inp} value={projectionFilters.cardId} onChange={e => setProjectionFilters(prev => ({ ...prev, cardId: e.target.value }))}>
                <option value="">Todos</option>
                {cards.map(card2 => <option key={card2.id} value={card2.id}>{card2.nome}</option>)}
              </select>
            </div>
            <div>
              <div style={lbl}>Categoria</div>
              <select style={inp} value={projectionFilters.rootCatId} onChange={e => setProjectionFilters(prev => ({ ...prev, rootCatId: e.target.value }))}>
                <option value="">Todas</option>
                {cats.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.nome}</option>)}
              </select>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 7, color: C.soft, fontSize: 12, paddingBottom: 8 }}>
              <input type="checkbox" checked={projectionFilters.includeSimulations} onChange={e => setProjectionFilters(prev => ({ ...prev, includeSimulations: e.target.checked }))} />
              Incluir simulações
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 7, color: C.soft, fontSize: 12, paddingBottom: 8 }}>
              <input type="checkbox" checked={projectionFilters.includeRecurrences} onChange={e => setProjectionFilters(prev => ({ ...prev, includeRecurrences: e.target.checked }))} />
              Projetar recorrências previstas
            </label>
          </div>
          <div style={{ fontSize: 11, color: C.soft, marginTop: 8 }}>
            Ao desmarcar recorrências, a projeção remove lançamentos recorrentes ainda previstos e mantém apenas valores já realizados.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
          <div style={{ background: C.navy, borderRadius: 9, padding: "13px 14px" }}><div style={lbl}>Saldo inicial</div><div style={big(C.text)}>{fmtBRL(projectionFirst?.saldoInicial || 0)}</div></div>
          <div style={{ background: C.navy, borderRadius: 9, padding: "13px 14px" }}><div style={lbl}>Entradas</div><div style={big(C.emerald)}>{fmtBRL(projectionTotals.entradas)}</div></div>
          <div style={{ background: C.navy, borderRadius: 9, padding: "13px 14px" }}><div style={lbl}>Saídas</div><div style={big(C.coral)}>{fmtBRL(projectionTotals.saidas)}</div></div>
          <div style={{ background: C.navy, borderRadius: 9, padding: "13px 14px" }}><div style={lbl}>Saldo final projetado</div><div style={big((projectionLast?.saldoProjetado || 0) < 0 ? C.coral : C.gold)}>{fmtBRL(projectionLast?.saldoProjetado || 0)}</div></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
          <div style={{ background: C.navy, borderRadius: 9, padding: "12px 13px" }}><div style={lbl}>Menor saldo</div><div style={big(projectionInsights.menorSaldo < 0 ? C.coral : C.gold)}>{fmtBRL(projectionInsights.menorSaldo)}</div><div style={{ fontSize: 11, color: C.soft }}>{projectionInsights.menorSaldoMes || "—"}</div></div>
          <div style={{ background: C.navy, borderRadius: 9, padding: "12px 13px" }}><div style={lbl}>Maior saída</div><div style={big(C.coral)}>{fmtBRL(projectionInsights.maiorSaida)}</div><div style={{ fontSize: 11, color: C.soft }}>{projectionInsights.maiorSaidaMes || "—"}</div></div>
          <div style={{ background: C.navy, borderRadius: 9, padding: "12px 13px" }}><div style={lbl}>Maior queda</div><div style={big(projectionInsights.maiorQueda < 0 ? C.coral : C.soft)}>{fmtBRL(projectionInsights.maiorQueda)}</div><div style={{ fontSize: 11, color: C.soft }}>{projectionInsights.maiorQuedaMes || "—"}</div></div>
          <div style={{ background: C.navy, borderRadius: 9, padding: "12px 13px" }}><div style={lbl}>Meses negativos</div><div style={big(projectionInsights.mesesNegativos > 0 ? C.coral : C.emerald)}>{projectionInsights.mesesNegativos}</div><div style={{ fontSize: 11, color: C.soft }}>no período filtrado</div></div>
          <div style={{ background: C.navy, borderRadius: 9, padding: "12px 13px" }}><div style={lbl}>Maior peso faturas</div><div style={big(C.gold)}>{projectionInsights.comprometimentoFaturas.toFixed(1)}%</div><div style={{ fontSize: 11, color: C.soft }}>{projectionInsights.comprometimentoFaturasMes || "—"}</div></div>
        </div>

        <CashFlowChart
          data={projections}
          height={260}
          colors={{ saldo: C.gold, entradas: C.emerald, saidas: C.coral, text: C.text, soft: C.soft, grid: C.border }}
        />
      </div>

      <div style={card()}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Detalhamento por competência</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 940 }}>
            <thead>
              <tr style={{ background: C.border }}>
                {["", "Mês", "Saldo inicial", "Receitas", "Despesas", "Faturas", "Simulações", "Fluxo líquido", "Saldo projetado"].map((h, i) => (
                  <th key={h || "detalhe"} style={{ padding: "8px 10px", textAlign: i <= 1 ? "left" : "right", color: C.soft, fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projections.map(p => {
                const saldoNegativo = p.saldoProjetado < 0;
                const expanded = Boolean(expandedProjectionMonths[p.monthKey]);
                const detalhes = p.detalhes || { receitas: [], despesas: [], faturas: [], simulacoes: [] };
                const detailGroups = [
                  { key: "faturas", label: "Cartões / Faturas", color: C.gold, sign: "-", rows: detalhes.faturas || [] },
                  { key: "simulacoes", label: "Simulações", color: "#CE93D8", sign: "-", rows: detalhes.simulacoes || [] },
                ];
                const totalItens = detailGroups.reduce((sum, group) => sum + group.rows.length, 0);
                return (
                  <Fragment key={p.monthKey}>
                    <tr style={{ borderTop: `1px solid ${C.border}`, background: saldoNegativo ? C.coral + "10" : "transparent" }}>
                      <td style={{ padding: "8px 10px", width: 42 }}>
                        <button
                          type="button"
                          title={expanded ? "Ocultar detalhes" : "Exibir detalhes"}
                          onClick={() => setExpandedProjectionMonths(prev => ({ ...prev, [p.monthKey]: !prev[p.monthKey] }))}
                          style={{ background: expanded ? C.gold + "22" : C.navy, border: `1px solid ${expanded ? C.gold : C.border}`, borderRadius: 7, color: expanded ? C.gold : C.soft, cursor: "pointer", width: 28, height: 24, fontWeight: 800 }}
                        >{expanded ? "−" : "+"}</button>
                      </td>
                      <td style={{ padding: "8px 10px", fontWeight: 700 }}>{p.label}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right" }}>{fmtBRL(p.saldoInicial)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: C.emerald }}>{fmtBRL(p.receitas)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: C.coral }}>{fmtBRL(p.despesas)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: p.faturas > 0 ? C.gold : C.soft }}>{p.faturas > 0 ? fmtBRL(p.faturas) : "—"}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: p.simulacoes > 0 ? "#CE93D8" : C.soft }}>{p.simulacoes > 0 ? fmtBRL(p.simulacoes) : "—"}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: p.fluxoLiquido < 0 ? C.coral : C.emerald, fontWeight: 700 }}>{fmtBRL(p.fluxoLiquido)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: saldoNegativo ? C.coral : C.gold, fontWeight: 800 }}>{fmtBRL(p.saldoProjetado)}</td>
                    </tr>
                    {expanded && (
                      <tr key={`${p.monthKey}_details`} style={{ background: C.navy }}>
                        <td colSpan={9} style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
                          {totalItens === 0 ? (
                            <div style={{ color: C.soft, fontSize: 12 }}>Nenhuma fatura ou simulação encontrada para esta competência.</div>
                          ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
                              {detailGroups.map(group => (
                                <div key={group.key} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 12px" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                    <div style={{ fontWeight: 800, color: group.color, fontSize: 12 }}>{group.label}</div>
                                    <div style={{ fontSize: 10, color: C.soft }}>{group.rows.length} item{group.rows.length === 1 ? "" : "s"}</div>
                                  </div>
                                  {group.rows.length === 0 ? (
                                    <div style={{ color: C.soft, fontSize: 11 }}>Sem itens.</div>
                                  ) : group.rows.slice(0, 8).map(item => (
                                    <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, borderTop: `1px solid ${C.border}`, padding: "7px 0" }}>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.descricao}</div>
                                        <div style={{ fontSize: 10, color: C.soft }}>{[item.data && fmtDate(item.data), item.status, item.origem, item.parcela ? `${item.parcela}/${item.totalParcelas}` : ""].filter(Boolean).join(" · ")}</div>
                                        {item.catId && <div style={{ fontSize: 10, color: C.soft }}>{getCatLabel(item.catId)}</div>}
                                      </div>
                                      <div style={{ color: group.color, fontWeight: 800, fontSize: 12, textAlign: "right" }}>{group.sign} {fmtBRL(item.valor)}</div>
                                    </div>
                                  ))}
                                  {group.rows.length > 8 && <div style={{ color: C.soft, fontSize: 10, marginTop: 6 }}>+ {group.rows.length - 8} item{group.rows.length - 8 === 1 ? "" : "s"} não exibido{group.rows.length - 8 === 1 ? "" : "s"}.</div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: C.soft, marginTop: 10 }}>
          O detalhamento exibe apenas cartões/faturas e simulações para reduzir poluição visual. Receitas, despesas e recorrências permanecem consolidadas nos totais mensais e podem ser analisadas pelos filtros.
        </div>
      </div>

      <div style={card()}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Histórico de despesas realizadas</div>
        <BarChart data={last6} color={C.gold} height={110} />
      </div>
    </div>
  );
}

export default ProjecoesTab;
