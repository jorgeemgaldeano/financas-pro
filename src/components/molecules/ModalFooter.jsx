// ModalFooter.jsx — v0.3.37 Fase 3 (DEC-0038)
// Molecule: rodapé Cancelar/Confirmar, repetido nos 6 modais do switch em
// App.jsx (mesmo layout `{ display:"flex", gap:9, marginTop:16 }`, só o
// texto/cor/handler do botão de confirmar muda por modal).
import { C } from "../../theme/tokens.js";
import { Button } from "../atoms/Button.jsx";

export function ModalFooter({ onCancel, cancelLabel = "Cancelar", onConfirm, confirmLabel, confirmBg = C.emerald, confirmDisabled }) {
  return (
    <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
      <Button bg={C.border} style={{ flex: 1 }} onClick={onCancel}>{cancelLabel}</Button>
      <Button bg={confirmBg} style={{ flex: 1 }} onClick={onConfirm} disabled={confirmDisabled}>{confirmLabel}</Button>
    </div>
  );
}

export default ModalFooter;
