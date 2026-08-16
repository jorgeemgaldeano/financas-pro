// RecorrenciasTab.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (aba "Recorrências").
import { C } from "../../theme/tokens.js";
import { fmtBRL } from "../../utils/moneyUtils.js";
import { Button } from "../atoms/Button.jsx";

export function RecorrenciasTab({
  recorrenciasAgrupadas, cards, contas, getCatColor, getCatIcon, getCatLabel,
  card, ghost, openAddTrans, abrirEdicaoRecorrencia, findarRecorrencia, excluirRecorrencia,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Lançamentos recorrentes</div>
            <div style={{ fontSize: 13, color: C.soft }}>Visualize, edite, exclua ou finde séries criadas como lançamento fixo/recorrente. O mês selecionado define a partir de quando editar ou findar.</div>
          </div>
          <Button bg={C.emerald} onClick={openAddTrans}>+ Nova recorrência</Button>
        </div>
      </div>

      {recorrenciasAgrupadas.length === 0 &&
        <div style={card({ textAlign: "center", padding: "34px 22px" })}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔁</div>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Nenhuma recorrência cadastrada</div>
          <div style={{ fontSize: 13, color: C.soft }}>Crie um lançamento e marque a opção “Lançamento fixo / recorrente”.</div>
        </div>
      }

      {recorrenciasAgrupadas.length > 0 &&
        <div style={card({ padding: 0, overflow: "hidden" })}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.border }}>
                {["Recorrência", "Categoria", "Origem", "Período", "Status", "Valores", "Ações"].map(h => <th key={h} style={{ padding: "9px 13px", textAlign: "left", fontWeight: 600, color: C.soft, fontSize: 11 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {recorrenciasAgrupadas.map(g => {
                const t = g.sample;
                const origemNome = t.origem === "cartao"
                  ? `💳 ${cards.find(c => c.id === t.cartaoId)?.nome || "Cartão"}`
                  : `${contas.find(c => c.id === t.contaId)?.icon || "🏦"} ${contas.find(c => c.id === t.contaId)?.nome || "Conta"}`;
                const ativa = g.futurosPendentes > 0;
                return (
                  <tr key={g.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "11px 13px" }}>
                      <div style={{ fontWeight: 800 }}>{t.descricao || "Sem descrição"}</div>
                      <div style={{ fontSize: 11, color: C.soft, marginTop: 3 }}>
                        {t.tipo === "receita" ? "↑ Receita" : "↓ Despesa"} · {g.lancamentos.length} lançamentos · dia {(t.data || "").slice(8, 10) || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "11px 13px" }}>
                      <span style={{ fontSize: 11, background: getCatColor(t.catId) + "22", color: getCatColor(t.catId), padding: "2px 8px", borderRadius: 20, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {getCatIcon(t.catId)} {getCatLabel(t.catId)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 13px", color: C.soft, fontSize: 12 }}>{origemNome}</td>
                    <td style={{ padding: "11px 13px", color: C.soft, fontSize: 12 }}>{g.inicio || "—"} até {g.fim || "—"}</td>
                    <td style={{ padding: "11px 13px" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 20, background: ativa ? C.emerald + "22" : C.muted + "22", color: ativa ? C.emerald : C.soft }}>
                        {ativa ? "Ativa" : "Sem futuros"}
                      </span>
                      <div style={{ fontSize: 10, color: C.soft, marginTop: 4 }}>{g.previstosEditaveis} previstos editáveis</div>
                    </td>
                    <td style={{ padding: "11px 13px" }}>
                      <div style={{ fontWeight: 800, color: t.tipo === "receita" ? C.emerald : C.text }}>{fmtBRL(t.valor)}</div>
                      <div style={{ fontSize: 10, color: C.soft, marginTop: 3 }}>Pendente total: {fmtBRL(g.totalPendente)}</div>
                    </td>
                    <td style={{ padding: "11px 13px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => abrirEdicaoRecorrencia(g)} style={ghost({ padding: "4px 8px", fontSize: 11, color: C.emerald })}>Editar</button>
                        <button onClick={() => findarRecorrencia(g.id)} style={ghost({ padding: "4px 8px", fontSize: 11, color: C.gold })}>Findar</button>
                        <button onClick={() => excluirRecorrencia(g.id)} style={ghost({ padding: "4px 8px", fontSize: 11, color: C.coral })}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
}

export default RecorrenciasTab;
