// MetaInput.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx: valor de limite de meta editável inline (clique →
// campo de dinheiro → Enter/blur salva, Escape cancela).
import { useState } from "react";
import { MoneyInput } from "../atoms/MoneyInput.jsx";
import { moneyToNumber } from "../../utils/moneyUtils.js";

export function MetaInput({ catId, metas, setMetas, compact = false }) {
  const [editing, setEditing] = useState(false);
  const [buf, setBuf] = useState("");
  const val = metas[catId] || 0;
  if (editing) {
    return (
      <MoneyInput autoFocus value={buf}
        style={{ width: compact ? 80 : 100, background: "#0F1E36", border: "1px solid #00A878", borderRadius: 6, color: "#E8EDF4", padding: "3px 7px", fontSize: 13, outline: "none" }}
        onChange={setBuf}
        onBlur={() => { setMetas(p => ({ ...p, [catId]: moneyToNumber(buf) || 0 })); setEditing(false); }}
        onKeyDown={e => { if (e.key === "Enter") { setMetas(p => ({ ...p, [catId]: moneyToNumber(buf) || 0 })); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
      />
    );
  }
  return (
    <span onClick={() => { setBuf(val ? val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""); setEditing(true); }}
      style={{
        minWidth: compact ? 70 : 90, display: "inline-block", textAlign: "right", cursor: "pointer", fontWeight: 700, fontSize: compact ? 13 : 14,
        color: val > 0 ? "#E8EDF4" : "#4A6380", background: val > 0 ? "#1E3050" : "transparent",
        border: "1px solid #1E3050", borderRadius: 6, padding: "3px 8px",
      }}>
      {val > 0 ? val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Definir"}
    </span>
  );
}

export default MetaInput;
