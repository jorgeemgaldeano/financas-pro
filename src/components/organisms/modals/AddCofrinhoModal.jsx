// AddCofrinhoModal.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (modal "addCofrinho" — DEC-0035/RN032).
import { C } from "../../../theme/tokens.js";
import { DateInput } from "../../ui/DateInput.jsx";
import { MoneyInput } from "../../atoms/MoneyInput.jsx";
import { FormField } from "../../molecules/FormField.jsx";
import { ModalFooter } from "../../molecules/ModalFooter.jsx";

export function AddCofrinhoModal({ form, setForm, inp, closeModal, criarCofrinho }) {
  return (
    <>
      <h3 style={{ margin: "0 0 14px", fontWeight: 800 }}>Novo cofrinho</h3>
      <div style={{ fontSize: 12, color: C.soft, marginBottom: 14 }}>Ledger próprio de aportes/retiradas, independente das suas contas (RN032).</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <FormField label="Nome"><input style={inp} placeholder="Ex: Viagem, Reserva de emergência" value={form.nome || ""} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></FormField>
        <FormField label="Valor-alvo (R$)"><MoneyInput style={inp} value={form.valorAlvo || ""} onChange={value => setForm(f => ({ ...f, valorAlvo: value }))} /></FormField>
        <FormField label="Data-alvo"><DateInput style={inp} value={form.dataAlvo || ""} onChange={value => setForm(f => ({ ...f, dataAlvo: value }))} /></FormField>
      </div>
      <ModalFooter onCancel={closeModal} onConfirm={criarCofrinho} confirmLabel="Criar cofrinho" />
    </>
  );
}

export default AddCofrinhoModal;
