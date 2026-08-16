// StatValue.jsx — v0.3.37 Fase 2 (DEC-0038)
// Atom equivalente ao helper `big()` hoje repetido em App.jsx (valor
// numérico grande em destaque — saldo, total, contador).
import { C } from "../../theme/tokens.js";

export function StatValue({ children, color = C.text, style, ...props }) {
  return (
    <div
      {...props}
      style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1.1, ...style }}
    >
      {children}
    </div>
  );
}

export default StatValue;
