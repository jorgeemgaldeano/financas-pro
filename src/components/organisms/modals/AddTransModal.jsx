// AddTransModal.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (modal "addTrans") — o formulário mais usado do
// app (novo lançamento, com parcelamento de cartão e recorrência fixa).
// Extração mecânica 1:1, sem mudar nenhuma lógica.
import { C } from "../../../theme/tokens.js";
import { MONTHS } from "../../../utils/dateUtils.js";
import { fmtBRL } from "../../../utils/moneyUtils.js";
import { fmtDate } from "../../../utils/dateUtils.js";
import { moneyToNumber } from "../../../utils/moneyUtils.js";
import { DateInput } from "../../ui/DateInput.jsx";
import { MoneyInput } from "../../atoms/MoneyInput.jsx";
import { CategorySelect } from "../../molecules/CategorySelect.jsx";

export function AddTransModal({
  form, setForm, inp, lbl, inputStyle, cats, requiredModal, cards,
  contasDisponiveis, isCartao, resolveCardCompetencia, parcPreview, recPreview,
  selMon, selYear, closeModal, addTransaction,
}) {
  return (
    <>
      <h3 style={{ margin: "0 0 14px", fontWeight: 800 }}>Novo Lançamento</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "75vh", overflowY: "auto", paddingRight: 2 }}>

        {/* Tipo: Despesa / Receita */}
        <div>
          <div style={lbl}>Tipo</div>
          <div style={{ display: "flex", gap: 7 }}>
            {[{ v: "despesa", l: "↓ Despesa" }, { v: "receita", l: "↑ Receita" }].map(o => (
              <button key={o.v} onClick={() => setForm(f => ({ ...f, tipo: o.v, parcelado: false, fixo: false }))}
                style={{
                  flex: 1, border: `2px solid ${form.tipo === o.v ? (o.v === "despesa" ? C.coral : C.emerald) : C.border}`, borderRadius: 8,
                  background: form.tipo === o.v ? (o.v === "despesa" ? C.coral + "22" : C.emerald + "22") : "transparent",
                  color: form.tipo === o.v ? (o.v === "despesa" ? C.coral : C.emerald) : C.soft,
                  padding: "8px 5px", fontSize: 13, fontWeight: 700, cursor: "pointer"
                }}>{o.l}</button>
            ))}
          </div>
        </div>

        {/* Origem: Conta/Vale ou Cartão */}
        <div>
          <div style={lbl}>Origem</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {contasDisponiveis.map(ct => (
              <button key={ct.id}
                onClick={() => setForm(f => ({ ...f, origemTipo: "conta", contaId: ct.id, cartaoId: "", parcelado: false }))}
                style={{
                  border: `2px solid ${form.contaId === ct.id && !isCartao ? ct.cor : C.border}`, borderRadius: 8,
                  background: form.contaId === ct.id && !isCartao ? ct.cor + "22" : "transparent",
                  color: form.contaId === ct.id && !isCartao ? ct.cor : C.soft,
                  padding: "7px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
                }}>
                {ct.icon} {ct.nome}
              </button>
            ))}
            <button
              onClick={() => setForm(f => ({ ...f, origemTipo: "cartao", contaId: "", cartaoId: cards[0]?.id || "", parcelado: false }))}
              style={{
                border: `2px solid ${isCartao ? "#CE93D8" : C.border}`, borderRadius: 8,
                background: isCartao ? "#CE93D8" + "22" : "transparent",
                color: isCartao ? "#CE93D8" : C.soft,
                padding: "7px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
              }}>
              💳 Cartão
            </button>
          </div>
        </div>

        {/* Seletor de cartão (só quando cartão selecionado) */}
        {isCartao && (
          <div>
            <div style={lbl}>Cartão</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {cards.map(c => (
                <button key={c.id} onClick={() => setForm(f => ({ ...f, cartaoId: c.id }))}
                  style={{
                    border: `2px solid ${form.cartaoId === c.id ? c.cor : C.border}`, borderRadius: 8,
                    background: form.cartaoId === c.id ? c.cor + "22" : "transparent",
                    color: form.cartaoId === c.id ? c.cor : C.soft,
                    padding: "7px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer"
                  }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: c.cor, marginRight: 5 }} />
                  {c.nome}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 9 }}>
              <div style={lbl}>Competência da fatura {form.parcelado ? "da 1ª parcela" : ""} (opcional)</div>
              <input style={inp} type="month" value={form.faturaCompetencia || ""} onChange={e => setForm(f => ({ ...f, faturaCompetencia: e.target.value }))} />
              <div style={{ fontSize: 10, color: C.soft, marginTop: 4 }}>
                {form.data && form.cartaoId
                  ? `Automática se vazio: ${resolveCardCompetencia(form.data, form.cartaoId)}`
                  : "Se vazio, o sistema usa a fatura aberta conforme fechamento do cartão."}
              </div>
            </div>
          </div>
        )}

        {/* Descrição + Categoria */}
        <div><div style={lbl}>Descrição</div><input style={inputStyle("descricao")} placeholder="Ex: Supermercado" value={form.descricao || ""} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} /></div>
        <div><div style={lbl}>Categoria</div><CategorySelect cats={cats} value={form.catId} onChange={v => setForm(f => ({ ...f, catId: v }))} validationInfo={requiredModal} fieldKey="catId" /></div>

        {/* Valor */}
        <div><div style={lbl}>Valor (R$)</div><MoneyInput style={inputStyle("valor")} value={form.valor || ""} onChange={value => setForm(f => ({ ...f, valor: value }))} /></div>

        {/* ── CARTÃO: parcelamento ── */}
        {isCartao && form.tipo === "despesa" && (
          <div style={{ background: C.navy, borderRadius: 9, padding: "11px 13px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer", marginBottom: form.parcelado ? 11 : 0 }}>
              <input type="checkbox" checked={!!form.parcelado} onChange={e => setForm(f => ({ ...f, parcelado: e.target.checked }))} />
              <span style={{ fontWeight: 600 }}>Compra parcelada</span>
            </label>
            {form.parcelado && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 9 }}>
                  {[{ v: "total", l: "Valor total" }, { v: "parcela", l: "Vlr parcela" }].map(o => (
                    <button key={o.v} onClick={() => setForm(f => ({ ...f, modoParc: o.v }))}
                      style={{
                        border: `2px solid ${form.modoParc === o.v ? C.emerald : C.border}`, borderRadius: 7,
                        background: form.modoParc === o.v ? C.emerald + "22" : "transparent",
                        color: form.modoParc === o.v ? C.emerald : C.soft,
                        padding: "6px 5px", fontSize: 12, fontWeight: 700, cursor: "pointer"
                      }}>{o.l}</button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                  <div><div style={lbl}>Parcelas</div><input style={inp} type="number" min={2} max={48} value={form.parcelas ?? ""} onChange={e => setForm(f => ({ ...f, parcelas: e.target.value }))} /></div>
                  <div><div style={lbl}>Data 1ª parcela</div><DateInput style={inputStyle("data")} value={form.data || ""} onChange={value => setForm(f => ({ ...f, data: value }))} /></div>
                </div>
                {form.valor && form.parcelas && (
                  <div style={{ marginTop: 7, fontSize: 12, color: C.soft }}>
                    {form.modoParc === "total"
                      ? `${form.parcelas}× de ${fmtBRL(moneyToNumber(form.valor) / parseInt(form.parcelas))}`
                      : `${form.parcelas}× de ${fmtBRL(moneyToNumber(form.valor))} = ${fmtBRL(moneyToNumber(form.valor) * parseInt(form.parcelas))}`}
                  </div>
                )}
                {parcPreview.length > 0 && (
                  <div style={{ background: C.surface, borderRadius: 8, padding: "9px 11px", marginTop: 7 }}>
                    <div style={{ ...lbl, marginBottom: 6 }}>Prévia</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 110, overflowY: "auto" }}>
                      {parcPreview.map((p, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: C.soft }}>{i + 1}ª · compra {fmtDate(p.data)} · fatura {p.competencia}</span><span style={{ fontWeight: 700, color: C.gold }}>{fmtBRL(p.valor)}</span></div>)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── NÃO é parcelado: data ou recorrente ── */}
        {!form.parcelado && (
          <>
            {/* Toggle fixo/recorrente */}
            <div style={{ background: C.navy, borderRadius: 9, padding: "11px 13px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer", marginBottom: form.fixo ? 12 : 0 }}>
                <input type="checkbox" checked={!!form.fixo} onChange={e => setForm(f => ({ ...f, fixo: e.target.checked, data: "" }))} />
                <span style={{ fontWeight: 600 }}>Lançamento fixo / recorrente</span>
              </label>

              {form.fixo && (
                <>
                  <div style={{ fontSize: 12, color: C.soft, marginBottom: 10 }}>
                    Será registrado todo mês no dia informado, a partir de <strong style={{ color: C.text }}>{MONTHS[selMon - 1]}/{selYear}</strong>.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                    <div>
                      <div style={lbl}>Dia do mês</div>
                      <input style={inputStyle("fixoDia")} type="number" min={1} max={31} placeholder="Ex: 5"
                        value={form.fixoDia || ""} onChange={e => setForm(f => ({ ...f, fixoDia: e.target.value }))} />
                      <div style={{ fontSize: 10, color: C.soft, marginTop: 3 }}>Dia do vencimento todo mês</div>
                    </div>
                    <div>
                      <div style={lbl}>Nº de meses</div>
                      <input style={inp} type="number" min={2} max={60} placeholder="Ex: 12"
                        value={form.fixoMeses || ""} onChange={e => setForm(f => ({ ...f, fixoMeses: e.target.value }))} />
                      <div style={{ fontSize: 10, color: C.soft, marginTop: 3 }}>Mínimo 2 meses</div>
                    </div>
                  </div>
                  {/* Prévia dos próximos meses */}
                  {recPreview.length > 0 && (
                    <div style={{ marginTop: 10, background: C.surface, borderRadius: 8, padding: "9px 11px" }}>
                      <div style={{ ...lbl, marginBottom: 6 }}>Prévia (primeiros lançamentos)</div>
                      {recPreview.map((p, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                          <span style={{ color: C.soft }}>{i + 1}º · {p.mes}</span>
                          <span style={{ fontWeight: 700, color: C.gold }}>dia {form.fixoDia} · {fmtBRL(moneyToNumber(form.valor))}</span>
                        </div>
                      ))}
                      {parseInt(form.fixoMeses) > 4 && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>... e mais {parseInt(form.fixoMeses) - 4} meses</div>}
                    </div>
                  )}
                </>
              )}
              {!form.fixo && (
                <div style={{ marginTop: 0 }}>
                  <div style={lbl}>Data</div>
                  <DateInput style={inputStyle("data")} value={form.data || ""} onChange={value => setForm(f => ({ ...f, data: value }))} />
                </div>
              )}
            </div>
          </>
        )}

        {/* Data para cartão NÃO parcelado */}
        {isCartao && !form.parcelado && (
          <div><div style={lbl}>Data</div><DateInput style={inputStyle("data")} value={form.data || ""} onChange={value => setForm(f => ({ ...f, data: value }))} /></div>
        )}

      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
        <button onClick={closeModal} style={{ flex: 1, background: C.border, border: "none", borderRadius: 8, color: "#fff", padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Cancelar</button>
        <button onClick={addTransaction} style={{ flex: 1, background: C.emerald, border: "none", borderRadius: 8, color: "#fff", padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          {form.parcelado ? `Salvar ${form.parcelas || ""}× parcelas` : form.fixo ? `Registrar ${form.fixoMeses || ""}× meses` : "Salvar"}
        </button>
      </div>
    </>
  );
}

export default AddTransModal;
