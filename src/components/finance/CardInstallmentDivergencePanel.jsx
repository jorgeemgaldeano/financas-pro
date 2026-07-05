// Finanças PRO v0.3.26.6
// Painel de divergências de parcelamento na importação de cartão.
// Componente visual sem acesso direto ao LocalStorage.

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function fmtParcela(parcela, total) {
  if (!parcela || !total) return "—";
  return `${parcela}/${total}`;
}

export function CardInstallmentDivergencePanel({
  divergences = [],
  correctionsPreview = {},
  onKeep,
  onCorrectCurrentOnly,
  onCorrectCurrentAndFuture,
  fmtBRL,
  formatMonthBR,
  C,
  cardStyle,
  ghost,
  btn,
  lbl,
}) {
  const rows = safeArray(divergences);
  if (!rows.length) return null;

  const color = C || {};
  const renderCard = typeof cardStyle === "function"
    ? cardStyle
    : (extra = {}) => ({ background:"#162640", border:"1px solid #1E3050", borderRadius:12, padding:16, ...extra });
  const ghostButton = typeof ghost === "function"
    ? ghost
    : (extra = {}) => ({ background:"transparent", border:"1px solid #1E3050", borderRadius:8, color:color.soft || "#8FA8C0", padding:"7px 10px", cursor:"pointer", ...extra });
  const primaryButton = typeof btn === "function"
    ? btn
    : (buttonColor, extra = {}) => ({ background:buttonColor, color:"white", border:"none", borderRadius:8, padding:"7px 10px", cursor:"pointer", fontWeight:700, ...extra });
  const labelStyle = lbl || { fontSize:10, color:color.soft || "#8FA8C0", textTransform:"uppercase" };
  const money = typeof fmtBRL === "function" ? fmtBRL : value => `R$ ${Number(value || 0).toFixed(2)}`;
  const month = typeof formatMonthBR === "function" ? formatMonthBR : value => value || "—";

  return (
    <div style={renderCard({ borderColor:color.gold || "#F5B700", boxShadow:`0 0 0 1px ${(color.gold || "#F5B700")}22 inset` })}>
      <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:12 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:color.gold || "#F5B700" }}>Divergências de parcelamento encontradas</div>
          <div style={{ fontSize:12, color:color.soft || "#8FA8C0", marginTop:3 }}>
            Estas linhas não serão importadas automaticamente. Revise o impacto e escolha como tratar cada divergência.
          </div>
        </div>
        <div style={{ fontSize:12, color:color.soft || "#8FA8C0", alignSelf:"center" }}>
          {rows.length} divergência(s)
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {rows.map(row => {
          const correction = row._cardInstallmentCorrection || {};
          const preview = safeArray(correctionsPreview[row._id]);
          const currentOnlyPreview = preview.slice(0, 1);
          const futurePreview = preview;
          const statusDecision = row._cardInstallmentUserDecision || "";

          return (
            <div key={row._id} style={{ background:color.navy || "#0F1E36", border:`1px solid ${color.border || "#1E3050"}`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"minmax(220px,1.5fr) repeat(4,minmax(90px,1fr))", gap:10, alignItems:"start" }}>
                <div>
                  <div style={labelStyle}>Descrição</div>
                  <div style={{ fontWeight:800 }}>{row.descricao}</div>
                  <div style={{ fontSize:11, color:color.soft || "#8FA8C0", marginTop:4 }}>{row._cardInstallmentReason}</div>
                </div>
                <div>
                  <div style={labelStyle}>Competência</div>
                  <div style={{ fontWeight:700 }}>{month(row.competencia || correction.competencia)}</div>
                </div>
                <div>
                  <div style={labelStyle}>Arquivo</div>
                  <div style={{ fontWeight:800, color:color.gold || "#F5B700" }}>{fmtParcela(correction.parcelaArquivo || row.parcela, correction.totalArquivo || row.totalParcelas)}</div>
                </div>
                <div>
                  <div style={labelStyle}>Sistema</div>
                  <div style={{ fontWeight:800, color:color.soft || "#8FA8C0" }}>{correction.parcelasSistema || "Ver parcelas"}</div>
                </div>
                <div>
                  <div style={labelStyle}>Valor</div>
                  <div style={{ fontWeight:800, color:color.coral || "#E8504A" }}>{money(row.valor)}</div>
                </div>
              </div>

              {futurePreview.length > 0 && (
                <div style={{ marginTop:10, background:color.surface || "#162640", borderRadius:8, padding:"9px 10px" }}>
                  <div style={{ fontWeight:700, fontSize:12, marginBottom:7 }}>Parcelas que podem ser impactadas</div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                      <thead>
                        <tr style={{ color:color.soft || "#8FA8C0" }}>
                          <th style={{ textAlign:"left", padding:"5px 6px", borderBottom:`1px solid ${color.border || "#1E3050"}` }}>Competência</th>
                          <th style={{ textAlign:"left", padding:"5px 6px", borderBottom:`1px solid ${color.border || "#1E3050"}` }}>Descrição atual</th>
                          <th style={{ textAlign:"center", padding:"5px 6px", borderBottom:`1px solid ${color.border || "#1E3050"}` }}>Atual</th>
                          <th style={{ textAlign:"center", padding:"5px 6px", borderBottom:`1px solid ${color.border || "#1E3050"}` }}>Se alterar atual e futuras</th>
                          <th style={{ textAlign:"right", padding:"5px 6px", borderBottom:`1px solid ${color.border || "#1E3050"}` }}>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {futurePreview.map(item => (
                          <tr key={item.id} style={{ opacity:item.altera ? 1 : 0.55 }}>
                            <td style={{ padding:"5px 6px", color:color.soft || "#8FA8C0" }}>{month(item.competencia)}</td>
                            <td style={{ padding:"5px 6px" }}>{item.descricao}</td>
                            <td style={{ padding:"5px 6px", textAlign:"center" }}>{fmtParcela(item.parcelaAtual, item.totalAtual)}</td>
                            <td style={{ padding:"5px 6px", textAlign:"center", color:item.altera ? (color.gold || "#F5B700") : (color.coral || "#E8504A"), fontWeight:800 }}>{item.altera ? fmtParcela(item.parcelaNova, item.totalNovo) : "fora do total"}</td>
                            <td style={{ padding:"5px 6px", textAlign:"right", color:color.coral || "#E8504A", fontWeight:700 }}>{money(item.valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {currentOnlyPreview.length > 0 && (
                    <div style={{ fontSize:11, color:color.soft || "#8FA8C0", marginTop:7 }}>
                      Se escolher alterar somente a parcela atual, apenas {month(currentOnlyPreview[0].competencia)} será alterada para {fmtParcela(row.parcela, row.totalParcelas)}.
                    </div>
                  )}
                </div>
              )}

              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:11 }}>
                <button type="button" onClick={() => onKeep?.(row)} style={ghostButton({ fontSize:12, padding:"6px 10px" })}>Manter como está</button>
                <button type="button" onClick={() => onCorrectCurrentOnly?.(row)} style={primaryButton(color.gold || "#F5B700", { fontSize:12, padding:"6px 10px", color:color.navy || "#0F1E36" })}>Alterar somente parcela atual</button>
                <button type="button" onClick={() => onCorrectCurrentAndFuture?.(row)} style={primaryButton(color.emerald || "#00A878", { fontSize:12, padding:"6px 10px" })}>Alterar atual e futuras</button>
                {statusDecision && <span style={{ alignSelf:"center", color:color.soft || "#8FA8C0", fontSize:11 }}>Decisão: {statusDecision}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
