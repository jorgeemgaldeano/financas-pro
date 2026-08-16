// EditRecorrenciaModal.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (modal "editRecorrencia").
import { C } from "../../../theme/tokens.js";
import { MoneyInput } from "../../atoms/MoneyInput.jsx";
import { CategorySelect } from "../../molecules/CategorySelect.jsx";
import { ModalFooter } from "../../molecules/ModalFooter.jsx";

export function EditRecorrenciaModal({
  form, setForm, inp, lbl, inputStyle, selMonth, cats, cards, contas, requiredModal,
  closeModal, salvarEdicaoRecorrencia,
}) {
  return (
    <>
      <h3 style={{ margin: "0 0 8px", fontWeight: 800 }}>Editar recorrência</h3>
      <div style={{ fontSize: 12, color: C.soft, marginBottom: 14 }}>A edição altera apenas lançamentos previstos, preservando lançamentos pagos ou parciais para não distorcer o histórico.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={lbl}>Escopo</div>
          <select style={inp} value={form.escopo || "futuros"} onChange={e => setForm(f => ({ ...f, escopo: e.target.value }))}>
            <option value="futuros">A partir do mês selecionado ({selMonth})</option>
            <option value="todos">Toda a série, exceto pagos/parciais</option>
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <div><div style={lbl}>Tipo</div><select style={inp} value={form.tipo || "despesa"} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}><option value="despesa">Despesa</option><option value="receita">Receita</option></select></div>
          <div><div style={lbl}>Dia do mês</div><input style={inputStyle("fixoDia")} type="number" min={1} max={31} value={form.fixoDia || ""} onChange={e => setForm(f => ({ ...f, fixoDia: e.target.value }))} /></div>
        </div>
        <div><div style={lbl}>Descrição</div><input style={inputStyle("descricao")} value={form.descricao || ""} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} /></div>
        <div><div style={lbl}>Valor (R$)</div><MoneyInput style={inputStyle("valor")} value={form.valor || ""} onChange={value => setForm(f => ({ ...f, valor: value }))} /></div>
        <div><div style={lbl}>Categoria</div><CategorySelect cats={cats} value={form.catId} onChange={v => setForm(f => ({ ...f, catId: v }))} style={inp} validationInfo={requiredModal} fieldKey="catId" /></div>
        <div>
          <div style={lbl}>Origem</div>
          <select style={inp} value={form.origemTipo || "conta"} onChange={e => setForm(f => ({ ...f, origemTipo: e.target.value, contaId: e.target.value === "cartao" ? "" : (f.contaId || contas[0]?.id || ""), cartaoId: e.target.value === "cartao" ? (f.cartaoId || cards[0]?.id || "") : "" }))}>
            <option value="conta">Conta / Vale</option>
            <option value="cartao">Cartão de crédito</option>
          </select>
        </div>
        {form.origemTipo === "cartao" ?
          <div><div style={lbl}>Cartão</div><select style={inputStyle("cartaoId")} value={form.cartaoId || ""} onChange={e => setForm(f => ({ ...f, cartaoId: e.target.value }))}><option value="">Selecione</option>{cards.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
          : <div><div style={lbl}>Conta / Vale</div><select style={inputStyle("contaId")} value={form.contaId || ""} onChange={e => setForm(f => ({ ...f, contaId: e.target.value }))}><option value="">Selecione</option>{contas.map(ct => <option key={ct.id} value={ct.id}>{ct.nome}</option>)}</select></div>
        }
      </div>
      <ModalFooter onCancel={closeModal} onConfirm={salvarEdicaoRecorrencia} confirmLabel="Salvar alterações" />
    </>
  );
}

export default EditRecorrenciaModal;
