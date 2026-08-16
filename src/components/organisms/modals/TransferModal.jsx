// TransferModal.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (modal "addTransfer" — RN031).
import { C } from "../../../theme/tokens.js";
import { DateInput } from "../../ui/DateInput.jsx";
import { MoneyInput } from "../../atoms/MoneyInput.jsx";
import { ModalFooter } from "../../molecules/ModalFooter.jsx";

export function TransferModal({ form, setForm, inp, lbl, contasCorrentes, closeModal, realizarTransferencia }) {
  return (
    <>
      <h3 style={{ margin: "0 0 14px", fontWeight: 800 }}>Transferência entre contas</h3>
      <div style={{ fontSize: 12, color: C.soft, marginBottom: 14 }}>Movimento nulo: sai de uma conta e entra em outra, sem contar como receita nem despesa (RN031).</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={lbl}>Conta de origem</div>
          <select style={inp} value={form.fromAccountId || ""} onChange={e => setForm(f => ({ ...f, fromAccountId: e.target.value }))}>
            <option value="">Selecione</option>
            {contasCorrentes.map(ct => <option key={ct.id} value={ct.id}>{ct.nome}</option>)}
          </select>
        </div>
        <div>
          <div style={lbl}>Conta de destino</div>
          <select style={inp} value={form.toAccountId || ""} onChange={e => setForm(f => ({ ...f, toAccountId: e.target.value }))}>
            <option value="">Selecione</option>
            {contasCorrentes.filter(ct => ct.id !== form.fromAccountId).map(ct => <option key={ct.id} value={ct.id}>{ct.nome}</option>)}
          </select>
        </div>
        <div><div style={lbl}>Valor (R$)</div><MoneyInput style={inp} value={form.valor || ""} onChange={value => setForm(f => ({ ...f, valor: value }))} /></div>
        <div><div style={lbl}>Data</div><DateInput style={inp} value={form.data || ""} onChange={value => setForm(f => ({ ...f, data: value }))} /></div>
        <div><div style={lbl}>Descrição (opcional)</div><input style={inp} placeholder="Transferência entre contas" value={form.descricao || ""} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} /></div>
      </div>
      <ModalFooter onCancel={closeModal} onConfirm={realizarTransferencia} confirmBg="#0891B2" confirmLabel="Transferir" />
    </>
  );
}

export default TransferModal;
