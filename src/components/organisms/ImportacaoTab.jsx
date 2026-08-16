// ImportacaoTab.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (aba "Importar"). É a organism mais complexa do app
// (upload → revisão → confirmação, com heurísticas de duplicata,
// classificação de crédito de cartão e vínculo de transferência) — extração
// mecânica 1:1, sem mudar nenhuma lógica.
import { C } from "../../theme/tokens.js";
import { fmtDate, formatMonthBR } from "../../utils/dateUtils.js";
import { fmtBRL } from "../../utils/moneyUtils.js";
import { CARD_CREDIT_TYPES, isCardCreditRowBlocked, resolveCardCreditCompetencia } from "../../services/cardImportService.js";
import { CardInstallmentDivergencePanel } from "../finance/CardInstallmentDivergencePanel.jsx";
import { CategorySelect } from "../molecules/CategorySelect.jsx";
import { Button } from "../atoms/Button.jsx";

export function ImportacaoTab({
  card, lbl, inp, ghost, btn,
  importBatches, undoImportBatch,
  impStep, impMode, setImpMode, setImpErr, setImpRows, setImpTog, setImpDups, setImpTransferLinks,
  impCId, setImpCId, impCompetencia, setImpCompetencia, impBanco, setImpBanco,
  impContaId, setImpContaId, impValeYear, setImpValeYear,
  cards, contas, cats, handleFile, impErr, impFile, resetImport,
  impRows, impDups, impIgnored, impTog, transferMatchCandidates, impTransferLinks, toggleTransferLink,
  installmentDivergenceRows, installmentCorrectionPreview, markInstallmentDivergenceAsKept, applyInstallmentDivergenceResolution,
  impSelectedForImport, confirmImport, lastImportReport, setTab,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card()}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Importação de Extratos</div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 12 }}>
          Importe fatura de cartão ou extrato bancário. Para extrato bancário, o sistema identifica receitas e despesas pelo sinal do valor e vincula tudo à conta selecionada.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 9 }}>
          {[
            { b: "💳 Cartão de crédito", f: "CSV · OFX · QFX · TXT", h: "Usa competência da fatura, preserva data da compra e expande parcelas." },
            { b: "🟡 Banco do Brasil", f: "OFX · CSV · TXT", h: "Importa operações da conta corrente e ignora BB Rende Fácil para evitar duplicidade com poupança associada." },
            { b: "🟠 Banco Itaú", f: "CSV · OFX · TXT", h: "Lê colunas de data, histórico/lançamento e valor/débito/crédito." },
            { b: "🎫 Vales Pluxee", f: "PDF · TXT", h: "Importa extrato de vale alimentação/refeição: DISPONIBILIZACAO DE VALOR como crédito e demais movimentos como débito." },
          ].map(x => (
            <div key={x.b} style={{ background: C.navy, borderRadius: 9, padding: "11px 13px" }}><div style={{ fontWeight: 700, marginBottom: 2 }}>{x.b}</div><div style={{ fontSize: 11, color: C.gold, marginBottom: 4 }}>{x.f}</div><div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5 }}>{x.h}</div></div>
          ))}
        </div>
      </div>
      {importBatches.length > 0 && <div style={card()}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}><div><div style={{ fontWeight: 800, fontSize: 14 }}>Lotes importados</div><div style={{ fontSize: 12, color: C.soft }}>Permite desfazer uma importação inteira sem remover manualmente lançamento por lançamento.</div></div></div><div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{importBatches.slice(0, 6).map(b => <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", background: C.navy, borderRadius: 8, padding: "8px 10px" }}><div style={{ fontSize: 12 }}><strong>{b.tipo === "cartao" ? "Cartão" : b.tipo === "vale" ? "Vale" : "Conta"}</strong> · {b.destinoNome} · {b.qtd} lançamento(s) · {fmtBRL(b.valorLiquido)}<div style={{ color: C.soft, fontSize: 11 }}>{fmtDate(b.primeiraData)} a {fmtDate(b.ultimaData)} · lote {b.id}</div></div><button onClick={() => undoImportBatch(b.id)} style={ghost({ color: C.coral, borderColor: C.coral })}>Desfazer lote</button></div>)}</div></div>}
      {impStep === "upload" && <div style={card()}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>1 · Tipo, destino e arquivo</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div>
            <div style={lbl}>Tipo de importação</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 8 }}>
              {[
                { id: "cartao", label: "💳 Fatura de cartão", hint: "Exige cartão e competência" },
                { id: "bancario", label: "🏦 Extrato bancário", hint: "Exige conta corrente/vale" },
                { id: "vale", label: "🎫 Extrato de vale", hint: "PDF Pluxee com ano e conta de vale" },
              ].map(opt => (
                <button key={opt.id} type="button" onClick={() => { setImpMode(opt.id); setImpErr(""); setImpRows([]); setImpTog({}); setImpDups(new Set()); setImpTransferLinks({}); }} style={{ ...ghost(), textAlign: "left", padding: "10px 12px", color: impMode === opt.id ? C.text : C.soft, borderColor: impMode === opt.id ? C.emerald : C.border, background: impMode === opt.id ? C.emerald + "18" : "transparent" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>{opt.hint}</div>
                </button>
              ))}
            </div>
          </div>
          {impMode === "cartao" && <>
            <div><div style={lbl}>Cartão</div><select style={inp} value={impCId} onChange={e => setImpCId(e.target.value)}><option value="">Selecione</option>{cards.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
            <div><div style={lbl}>Competência da fatura</div><input style={inp} type="month" value={impCompetencia} onChange={e => setImpCompetencia(e.target.value)} /><div style={{ fontSize: 11, color: C.soft, marginTop: 4 }}>A data da compra será preservada, mas a despesa será associada à competência informada.</div></div>
          </>}
          {impMode === "bancario" && <>
            <div><div style={lbl}>Banco de origem</div><select style={inp} value={impBanco} onChange={e => setImpBanco(e.target.value)}><option value="auto">Detectar automaticamente</option><option value="bb">Banco do Brasil</option><option value="itau">Banco Itaú</option></select><div style={{ fontSize: 11, color: C.soft, marginTop: 4 }}>Use Banco do Brasil ou Itaú para rastreabilidade. A leitura aceita OFX, CSV e TXT. Movimentações BB Rende Fácil são ignoradas automaticamente para evitar duplicidade entre conta corrente e poupança associada.</div></div>
            <div><div style={lbl}>Conta de destino</div><select style={inp} value={impContaId} onChange={e => setImpContaId(e.target.value)}><option value="">Selecione</option>{contas.map(c => <option key={c.id} value={c.id}>{c.icon || "🏦"} {c.nome}</option>)}</select><div style={{ fontSize: 11, color: C.soft, marginTop: 4 }}>Receitas serão lançadas como entrada e débitos como despesas na conta selecionada.</div></div>
          </>}
          {impMode === "vale" && <>
            <div><div style={lbl}>Ano do extrato Pluxee</div><input style={inp} type="number" min="2000" max="2100" value={impValeYear} onChange={e => setImpValeYear(e.target.value)} /><div style={{ fontSize: 11, color: C.soft, marginTop: 4 }}>O PDF da Pluxee informa dia e mês, mas não traz o ano em cada lançamento. O ano informado será usado na importação.</div></div>
            <div><div style={lbl}>Conta de vale destino</div><select style={inp} value={impContaId} onChange={e => setImpContaId(e.target.value)}><option value="">Selecione</option>{contas.filter(c => String(c.tipo || "").startsWith("vale_")).map(c => <option key={c.id} value={c.id}>{c.icon || "🎫"} {c.nome}</option>)}{contas.filter(c => String(c.tipo || "").startsWith("vale_")).length === 0 && contas.map(c => <option key={c.id} value={c.id}>{c.icon || "🏦"} {c.nome}</option>)}</select><div style={{ fontSize: 11, color: C.soft, marginTop: 4 }}>Somente DISPONIBILIZACAO DE VALOR será importado como receita. Todos os demais movimentos serão importados como despesas na conta de vale selecionada.</div></div>
          </>}
          <div><div style={lbl}>Arquivo</div><label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9, border: `2px dashed ${C.border}`, borderRadius: 11, padding: "28px 22px", cursor: "pointer", background: C.navy }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}><input type="file" accept={impMode === "vale" ? ".pdf,.txt" : ".csv,.ofx,.qfx,.txt"} style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} /><div style={{ fontSize: 26 }}>📂</div><div style={{ fontWeight: 700, fontSize: 13 }}>Arraste ou clique</div><div style={{ fontSize: 11, color: C.soft }}>{impMode === "vale" ? ".pdf · .txt" : ".csv · .ofx · .qfx · .txt"}</div></label></div>
          {impErr && <div style={{ color: C.coral, fontSize: 13, padding: "9px 12px", background: C.coral + "11", borderRadius: 7 }}>⚠️ {impErr}</div>}
        </div>
      </div>}
      {impStep === "review" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={card()}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, gap: 12, flexWrap: "wrap" }}><div><div style={{ fontWeight: 700, fontSize: 14 }}>2 · Revise os lançamentos</div><div style={{ fontSize: 12, color: C.soft }}><strong style={{ color: C.text }}>{impFile}</strong> · {impMode === "cartao" ? <>competência <strong style={{ color: C.text }}>{impCompetencia}</strong></> : <>conta <strong style={{ color: C.text }}>{contas.find(c => c.id === impContaId)?.nome || "—"}</strong></>} · {impRows.length} lançamentos · <span style={{ color: C.gold }}>{Object.values(impTog).filter(Boolean).length} selecionados</span>{(impDups.size > 0 || impIgnored.length > 0) && <span style={{ color: C.coral }}> · {impDups.size + impIgnored.length} duplicatas/ignorados</span>}</div></div><button onClick={resetImport} style={ghost()}>← Voltar</button></div><div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}><button onClick={() => setImpTog(Object.fromEntries(impRows.map(r => [r._id, !impDups.has(r._id) && !(impMode === "cartao" && isCardCreditRowBlocked(r))])))} style={ghost()}>Sel. tudo</button><button onClick={() => setImpTog(Object.fromEntries(impRows.map(r => [r._id, false])))} style={ghost()}>Desmarcar</button></div>{(impDups.size > 0 || impIgnored.length > 0) && <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 8 }}><div style={{ background: C.navy, borderRadius: 8, padding: "8px 10px" }}><div style={lbl}>Duplicatas</div><div style={{ fontWeight: 800, color: C.gold }}>{impDups.size}</div></div><div style={{ background: C.navy, borderRadius: 8, padding: "8px 10px" }}><div style={lbl}>Ignorados por regra</div><div style={{ fontWeight: 800, color: C.coral }}>{impIgnored.length}</div></div><div style={{ background: C.navy, borderRadius: 8, padding: "8px 10px" }}><div style={lbl}>Selecionados</div><div style={{ fontWeight: 800, color: C.emerald }}>{Object.values(impTog).filter(Boolean).length}</div></div></div>}{impIgnored.length > 0 && <div style={{ marginTop: 10, fontSize: 11, color: C.soft }}>Ignorados automaticamente: {impIgnored.slice(0, 3).map(i => i.motivo).join(", ")}{impIgnored.length > 3 ? ` e mais ${impIgnored.length - 3}` : ""}.</div>}</div>
          {impMode === "cartao" && (() => { const pend = impRows.filter(r => r.tipo === "receita" && isCardCreditRowBlocked(r)); if (!pend.length) return null; const soma = pend.reduce((s, r) => s + r.valor, 0); return (
            <div style={{ ...card(), borderColor: C.gold, background: C.gold + "12" }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: C.gold, marginBottom: 5 }}>⚠️ {pend.length} crédito(s) sem classificação — {fmtBRL(soma)}</div>
              <div style={{ fontSize: 12, color: C.soft }}>Classifique cada crédito (coluna à direita) para que abata a fatura. Créditos sem classificação <strong>não serão importados</strong> e a fatura ficará mais alta. Estornos e reparcelamentos já vêm sugeridos com a competência de {impCompetencia}.</div>
            </div>
          ); })()}
          <div style={card({ padding: 0, overflow: "hidden" })}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: C.border }}>{["", "Data", impMode === "cartao" ? "Competência" : "Tipo", "Descrição", "Categoria", "Parcela", "Valor", ""].map((h, i) => <th key={i} style={{ padding: "8px 11px", textAlign: i === 6 ? "right" : "left", color: C.soft, fontSize: 10 }}>{h}</th>)}</tr></thead>
              <tbody>
                {impRows.map(r => { const ck = !!impTog[r._id], isDup = impDups.has(r._id); const isCredit = impMode === "cartao" && r.tipo === "receita"; const creditBlocked = isCredit && isCardCreditRowBlocked(r); return (
                  <tr key={r._id} style={{ borderTop: `1px solid ${C.border}`, background: !ck ? C.navy + "60" : isDup ? C.gold + "0A" : "transparent", opacity: ck ? 1 : 0.45 }}>
                    <td style={{ padding: "8px 11px", width: 30 }}><input type="checkbox" checked={ck} disabled={creditBlocked} onChange={e => setImpTog(p => ({ ...p, [r._id]: e.target.checked }))} /></td>
                    <td style={{ padding: "8px 11px", color: C.soft, whiteSpace: "nowrap" }}>{fmtDate(r.data)}</td>
                    <td style={{ padding: "8px 11px", color: r.tipo === "receita" ? C.emerald : C.soft, whiteSpace: "nowrap", fontWeight: impMode !== "cartao" ? 700 : 400 }}>{impMode === "cartao" ? (isCredit ? (resolveCardCreditCompetencia(r, impCompetencia) || "—") : r.competencia) : (r.tipo === "receita" ? "Receita" : "Despesa")}</td>
                    <td style={{ padding: "8px 11px" }}><div>{r.descricao}</div>{r.importadoFuturo && <div style={{ fontSize: 10, color: C.soft }}>gerado automaticamente para parcela futura</div>}{r._cardInstallmentStatus === "novo_parcelamento" && <div style={{ fontSize: 10, color: C.emerald }}>parcelamento novo controlado internamente</div>}{isDup && <div style={{ fontSize: 10, color: C.gold }}>⚠ {r._cardInstallmentReason || "duplicata desprezada por padrão"}</div>}{r._cardInstallmentCanCorrectSequence && <div style={{ fontSize: 10, color: C.gold, marginTop: 5 }}>⚠ Divergência listada para análise manual no painel abaixo.</div>}
                      {/* v0.3.33 (Fase 2 — DEC-0034/RN031): a heurística só CALCULA
                          candidatos (transferMatchCandidates); o vínculo em si só
                          acontece se o usuário marcar esta caixa explicitamente. */}
                      {impMode === "bancario" && r.tipo === "despesa" && transferMatchCandidates[r._id]?.length > 0 && (() => {
                        const cands = transferMatchCandidates[r._id];
                        const linkedId = impTransferLinks[r._id];
                        const selected = cands.find(c => c.transactionId === linkedId) || cands[0];
                        return (
                          <div style={{ marginTop: 6, padding: "6px 8px", borderRadius: 6, background: linkedId ? "#0891B222" : C.navy, border: `1px solid ${linkedId ? "#0891B2" : C.border}` }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, cursor: "pointer", color: linkedId ? "#0891B2" : C.soft, fontWeight: linkedId ? 700 : 400 }}>
                              <input type="checkbox" checked={!!linkedId} onChange={() => toggleTransferLink(r._id, selected.transactionId)} />
                              🔁 Possível transferência para <strong>{selected.contaNome}</strong> ({fmtDate(selected.data)}{selected.diffDias === 0 ? ", mesmo dia" : `, ${selected.diffDias}d de diferença`})
                            </label>
                            {cands.length > 1 && <select style={{ ...inp, fontSize: 10, padding: "2px 5px", marginTop: 4 }} value={selected.transactionId} disabled={!linkedId} onChange={e => toggleTransferLink(r._id, e.target.value)}>
                              {cands.map(c => <option key={c.transactionId} value={c.transactionId}>{c.contaNome} · {fmtDate(c.data)} · {fmtBRL(c.valor)}</option>)}
                            </select>}
                          </div>
                        );
                      })()}
                      {isCredit && <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                        <select style={{ ...inp, fontSize: 11, padding: "3px 7px" }} value={r.creditoTipo || ""} onChange={e => { const v = e.target.value || null; const nextCreditoCompetencia = v === CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA ? (r.competencia || impCompetencia) : null; setImpRows(p => p.map(x => x._id === r._id ? { ...x, creditoTipo: v, creditoCompetencia: nextCreditoCompetencia } : x)); if (!isCardCreditRowBlocked({ ...r, creditoTipo: v, creditoCompetencia: nextCreditoCompetencia })) setImpTog(p => ({ ...p, [r._id]: true })); }}>
                          <option value="">⚠ Classifique este crédito</option>
                          <option value={CARD_CREDIT_TYPES.PAGAMENTO_FATURA_ANTERIOR}>Pagamento da fatura anterior (desprezar)</option>
                          <option value={CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA}>Crédito de reparcelamento de compra à vista</option>
                          <option value={CARD_CREDIT_TYPES.ESTORNO}>Estorno de juros</option>
                        </select>
                        {(r.creditoTipo === CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA || r.creditoTipo === CARD_CREDIT_TYPES.ESTORNO) &&
                          <input type="month" style={{ ...inp, fontSize: 11, padding: "3px 7px" }} value={r.creditoCompetencia || ""} onChange={e => { const v = e.target.value || null; setImpRows(p => p.map(x => x._id === r._id ? { ...x, creditoCompetencia: v } : x)); if (!isCardCreditRowBlocked({ ...r, creditoCompetencia: v })) setImpTog(p => ({ ...p, [r._id]: true })); }} />
                        }
                        {creditBlocked && <div style={{ fontSize: 10, color: C.coral }}>Selecione a classificação{r.creditoTipo && r.creditoTipo !== CARD_CREDIT_TYPES.PAGAMENTO_FATURA_ANTERIOR ? " e a competência de destino" : ""} para liberar esta linha.</div>}
                      </div>}
                    </td>
                    <td style={{ padding: "8px 11px" }}>{impTransferLinks[r._id] ? <span style={{ fontSize: 11, color: C.soft }}>— (transferência)</span> : <CategorySelect cats={cats} value={r.catId} onChange={v => setImpRows(p => p.map(x => x._id === r._id ? { ...x, catId: v } : x))} style={{ fontSize: 11, padding: "3px 7px", width: "auto" }} />}</td>
                    <td style={{ padding: "8px 11px", color: C.soft, whiteSpace: "nowrap" }}>{r.parcela ? `${r.parcela}/${r.totalParcelas}` : "—"}</td>
                    <td style={{ padding: "8px 11px", textAlign: "right", fontWeight: 700, color: r.tipo === "receita" ? C.emerald : C.coral }}>{r.tipo === "receita" ? "+" : "-"}{fmtBRL(r.valor)}</td>
                    <td style={{ padding: "8px 11px" }}><button onClick={() => setImpRows(p => p.filter(x => x._id !== r._id))} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}>×</button></td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
          {impMode === "cartao" && installmentDivergenceRows.length > 0 && (
            <CardInstallmentDivergencePanel
              divergences={installmentDivergenceRows}
              correctionsPreview={installmentCorrectionPreview}
              onKeep={markInstallmentDivergenceAsKept}
              onCorrectCurrentOnly={row => applyInstallmentDivergenceResolution(row, "current_only")}
              onCorrectCurrentAndFuture={row => applyInstallmentDivergenceResolution(row, "current_and_future")}
              fmtBRL={fmtBRL}
              formatMonthBR={formatMonthBR}
              C={C}
              cardStyle={card}
              ghost={ghost}
              btn={btn}
              lbl={lbl}
            />
          )}
          <div style={card()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div><div style={lbl}>Total selecionado</div><div style={{ fontSize: 18, fontWeight: 800, color: impSelectedForImport.reduce((s, r) => s + (r.tipo === "receita" ? r.valor : -r.valor), 0) >= 0 ? C.emerald : C.coral }}>{fmtBRL(impSelectedForImport.reduce((s, r) => s + (r.tipo === "receita" ? r.valor : -r.valor), 0))}</div><div style={{ fontSize: 11, color: C.soft }}>{impSelectedForImport.length} lançamentos → {impMode === "cartao" ? (cards.find(c => c.id === impCId)?.nome || "—") : (contas.find(c => c.id === impContaId)?.nome || "—")}</div></div>
              <div style={{ display: "flex", gap: 9 }}><Button bg={C.border} onClick={resetImport}>Cancelar</Button><Button bg={C.emerald} onClick={confirmImport}>✓ Importar {impSelectedForImport.length}</Button></div>
            </div>
            {impErr && <div style={{ color: C.coral, fontSize: 12, marginTop: 7 }}>⚠️ {impErr}</div>}
          </div>
        </div>
      )}
      {impStep === "done" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}><div style={{ ...card(), textAlign: "center", padding: "34px 24px" }}><div style={{ fontSize: 36, marginBottom: 9 }}>✅</div><div style={{ fontWeight: 800, fontSize: 16, marginBottom: 5 }}>Importação concluída!</div><div style={{ fontSize: 13, color: C.soft, marginBottom: 20 }}>Lançamentos adicionados {impMode === "cartao" ? <>ao {cards.find(c => c.id === impCId)?.nome} na competência {impCompetencia}</> : <>à conta {contas.find(c => c.id === impContaId)?.nome}</>}.</div><div style={{ display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap" }}><Button onClick={resetImport}>Importar outro</Button><Button bg={C.border} onClick={() => { setTab("lancamentos"); resetImport(); }}>Ver lançamentos</Button>{lastImportReport?.id && <Button bg={C.coral} onClick={() => undoImportBatch(lastImportReport.id)}>Desfazer este lote</Button>}</div></div>{lastImportReport && <div style={card()}><div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>Relatório da importação</div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}><div style={{ background: C.navy, borderRadius: 8, padding: "9px 11px" }}><div style={lbl}>Importados</div><div style={{ fontWeight: 800, color: C.emerald }}>{lastImportReport.importadas}</div></div><div style={{ background: C.navy, borderRadius: 8, padding: "9px 11px" }}><div style={lbl}>Duplicados</div><div style={{ fontWeight: 800, color: C.gold }}>{lastImportReport.duplicadas}</div></div><div style={{ background: C.navy, borderRadius: 8, padding: "9px 11px" }}><div style={lbl}>Ignorados</div><div style={{ fontWeight: 800, color: C.coral }}>{lastImportReport.ignoradas}</div></div><div style={{ background: C.navy, borderRadius: 8, padding: "9px 11px" }}><div style={lbl}>Valor líquido</div><div style={{ fontWeight: 800, color: lastImportReport.valorLiquido >= 0 ? C.emerald : C.coral }}>{fmtBRL(lastImportReport.valorLiquido)}</div></div>{lastImportReport.creditosDesconsiderados > 0 && <div style={{ background: C.navy, borderRadius: 8, padding: "9px 11px" }}><div style={lbl}>Créditos desconsiderados</div><div style={{ fontWeight: 800, color: C.gold }}>{lastImportReport.creditosDesconsiderados}</div></div>}</div>{lastImportReport.creditosDesconsideradosDetalhe?.length > 0 && <div style={{ marginTop: 12 }}><div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Créditos desconsiderados (pagamento de fatura anterior)</div>{lastImportReport.creditosDesconsideradosDetalhe.map((d, i) => <div key={i} style={{ fontSize: 11, color: C.soft, borderTop: `1px solid ${C.border}`, padding: "5px 0" }}>{fmtDate(d.data)} · {d.descricao} · {fmtBRL(d.valor)}</div>)}</div>}{lastImportReport.ignoradasDetalhe?.length > 0 && <div style={{ marginTop: 12 }}><div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Ignorados por regra</div>{lastImportReport.ignoradasDetalhe.map(i => <div key={i.id} style={{ fontSize: 11, color: C.soft, borderTop: `1px solid ${C.border}`, padding: "5px 0" }}>Linha {i.linha}: {i.motivo} — {i.descricao.slice(0, 120)}</div>)}</div>}{lastImportReport.duplicadasDetalhe?.length > 0 && <div style={{ marginTop: 12 }}><div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Duplicatas identificadas</div>{lastImportReport.duplicadasDetalhe.map((d, i) => <div key={i} style={{ fontSize: 11, color: C.soft, borderTop: `1px solid ${C.border}`, padding: "5px 0" }}>{fmtDate(d.data)} · {d.descricao} · {fmtBRL(d.valor)}{d.motivo ? ` · ${d.motivo}` : ""}</div>)}</div>}</div>}</div>}
    </div>
  );
}

export default ImportacaoTab;
