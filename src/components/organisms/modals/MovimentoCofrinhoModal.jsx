// MovimentoCofrinhoModal.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx (modal "movimentoCofrinho" — DEC-0035/RN032).
import { C } from "../../../theme/tokens.js";
import { DateInput } from "../../ui/DateInput.jsx";
import { MoneyInput } from "../../atoms/MoneyInput.jsx";
import { FormField } from "../../molecules/FormField.jsx";
import { ModalFooter } from "../../molecules/ModalFooter.jsx";

export function MovimentoCofrinhoModal({ form, setForm, inp, closeModal, registrarMovimentoCofrinho }) {
  return (
    <>
      <h3 style={{ margin: "0 0 14px", fontWeight: 800 }}>{form.tipoMovimento === "retirada" ? "Retirada do cofrinho" : "Aporte no cofrinho"}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <FormField label="Valor (R$)"><MoneyInput style={inp} value={form.valor || ""} onChange={value => setForm(f => ({ ...f, valor: value }))} /></FormField>
        <FormField label="Data"><DateInput style={inp} value={form.data || ""} onChange={value => setForm(f => ({ ...f, data: value }))} /></FormField>
      </div>
      <ModalFooter
        onCancel={closeModal}
        onConfirm={registrarMovimentoCofrinho}
        confirmBg={form.tipoMovimento === "retirada" ? C.coral : C.emerald}
        confirmLabel={form.tipoMovimento === "retirada" ? "Confirmar retirada" : "Confirmar aporte"}
      />
    </>
  );
}

export default MovimentoCofrinhoModal;
