// AddCardModal.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (modal "addCard").
import { MoneyInput } from "../../atoms/MoneyInput.jsx";
import { ModalFooter } from "../../molecules/ModalFooter.jsx";

const CARD_COLORS = ["#7C3AED", "#E8504A", "#00A878", "#F5B700", "#0891B2", "#DB2777", "#6366F1", "#F97316", "#84CC16", "#B0BEC5"];

export function AddCardModal({ form, setForm, inp, lbl, inputStyle, contasCorrentes, closeModal, addCard }) {
  return (
    <>
      <h3 style={{ margin: "0 0 16px", fontWeight: 800 }}>Adicionar Cartão</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div><div style={lbl}>Nome</div><input style={inputStyle("cardNome")} placeholder="Ex: Bradesco Visa" value={form.nome || ""} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
        <div><div style={lbl}>Limite (R$)</div><MoneyInput style={inp} value={form.limite || ""} onChange={value => setForm(f => ({ ...f, limite: value }))} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <div><div style={lbl}>Dia Fechamento</div><input style={inp} type="number" min={1} max={31} value={form.fechamento || ""} onChange={e => setForm(f => ({ ...f, fechamento: e.target.value }))} /></div>
          <div><div style={lbl}>Dia Vencimento</div><input style={inp} type="number" min={1} max={31} value={form.vencimento || ""} onChange={e => setForm(f => ({ ...f, vencimento: e.target.value }))} /></div>
        </div>
        <div><div style={lbl}>Conta corrente para pagamento da fatura</div><select style={inputStyle("cardContaPagamentoId")} value={form.contaPagamentoId || ""} onChange={e => setForm(f => ({ ...f, contaPagamentoId: e.target.value, accountId: e.target.value }))}><option value="">Selecione a conta</option>{contasCorrentes.map(ct => <option key={ct.id} value={ct.id}>{ct.nome}</option>)}</select></div>
        <div><div style={lbl}>Cor</div><div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 4 }}>{CARD_COLORS.map(cor => <div key={cor} onClick={() => setForm(f => ({ ...f, cor }))} style={{ width: 24, height: 24, borderRadius: 5, background: cor, cursor: "pointer", border: form.cor === cor ? "2px solid #fff" : "2px solid transparent" }} />)}</div></div>
      </div>
      <ModalFooter onCancel={closeModal} onConfirm={addCard} confirmLabel="Salvar" />
    </>
  );
}

export default AddCardModal;
