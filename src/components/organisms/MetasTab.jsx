// MetasTab.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (aba "Metas").
import { C } from "../../theme/tokens.js";
import { MONTHS } from "../../utils/dateUtils.js";
import { fmtBRL } from "../../utils/moneyUtils.js";
import { Card } from "../atoms/Card.jsx";
import { Label } from "../atoms/Label.jsx";
import { ProgressBar } from "../atoms/ProgressBar.jsx";
import { Badge } from "../atoms/Badge.jsx";
import { MetaInput } from "../molecules/MetaInput.jsx";

export function MetasTab({ rootCats, metas, setMetas, gastoCatMes, selMon, selYear }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🎯 Metas Mensais por Categoria</div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 4 }}>
          Define um limite de gasto mensal por categoria. Considera gastos de <strong style={{ color: C.text }}>conta corrente e vales</strong> (não inclui cartão de crédito).
        </div>
        <div style={{ fontSize: 12, color: C.gold, background: C.gold + "11", padding: "7px 11px", borderRadius: 7, marginBottom: 0 }}>
          💡 Para editar, clique no valor de limite de qualquer categoria e pressione Enter para salvar.
        </div>
      </Card>

      {/* Categorias com meta definida */}
      {rootCats.some(c => metas[c.id] > 0) && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            Metas configuradas
            <span style={{ fontSize: 12, fontWeight: 400, color: C.soft }}>— {MONTHS[selMon - 1]} {selYear}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rootCats.filter(c => metas[c.id] > 0).map(cat => {
              const gasto = gastoCatMes[cat.nome] || 0;
              const limite = metas[cat.id] || 0;
              const pct = limite > 0 ? Math.min(gasto / limite, 1) : 0;
              const over = gasto > limite;
              const warn = !over && pct >= 0.8;
              const barCol = over ? C.coral : warn ? C.gold : cat.cor || C.emerald;
              return (
                <div key={cat.id}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{cat.icon}</span>
                      <span style={{ fontWeight: 600 }}>{cat.nome}</span>
                      {over && <Badge color={C.coral}>⚠ Acima do limite</Badge>}
                      {warn && <Badge color={C.gold}>⚡ Atenção</Badge>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                      <span style={{ color: over ? C.coral : C.text, fontWeight: 700 }}>{fmtBRL(gasto)}</span>
                      <span style={{ color: C.soft }}>/</span>
                      <MetaInput catId={cat.id} metas={metas} setMetas={setMetas} />
                    </div>
                  </div>
                  <ProgressBar pct={pct} color={barCol} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 3, color: C.soft }}>
                    <span>{(pct * 100).toFixed(0)}% utilizado</span>
                    <span>{over ? `Excedido em ${fmtBRL(gasto - limite)}` : `Restam ${fmtBRL(limite - gasto)}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Todas as categorias para configurar */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Configurar limites</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
          {rootCats.map(cat => {
            const gasto = gastoCatMes[cat.nome] || 0;
            const limite = metas[cat.id] || 0;
            const over = limite > 0 && gasto > limite;
            return (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.navy, borderRadius: 9, padding: "10px 13px", border: `1px solid ${over ? C.coral + "55" : C.border}` }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{cat.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.nome}</div>
                  <div style={{ fontSize: 11, color: C.soft }}>Gasto: <span style={{ color: over ? C.coral : C.text, fontWeight: 600 }}>{fmtBRL(gasto)}</span></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: C.soft }}>Limite:</span>
                  <MetaInput catId={cat.id} metas={metas} setMetas={setMetas} compact />
                  {limite > 0 && <button onClick={() => setMetas(p => { const n = { ...p }; delete n[cat.id]; return n; })} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "0 2px" }}>×</button>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Resumo: categorias sem meta e total comprometido */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card>
          <Label>Total com meta configurada</Label>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.emerald }}>{fmtBRL(rootCats.filter(c => metas[c.id] > 0).reduce((s, c) => s + (metas[c.id] || 0), 0))}</div>
          <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>limite total do mês</div>
        </Card>
        <Card>
          <Label>Total gasto (corrente + vales)</Label>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>{fmtBRL(Object.values(gastoCatMes).reduce((s, v) => s + v, 0))}</div>
          <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>em {MONTHS[selMon - 1]}</div>
        </Card>
      </div>
    </div>
  );
}

export default MetasTab;
