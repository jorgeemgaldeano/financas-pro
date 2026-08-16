// MoneyInput.jsx — v0.3.37 Fase 2 (DEC-0038)
//
// Extraído de App.jsx:426 (função local, nunca antes reutilizável fora do
// arquivo). Mesmo comportamento: máscara de dinheiro em tempo real via
// `maskMoneyInput`.

import { maskMoneyInput } from "../../utils/moneyUtils.js";

export function MoneyInput({ value, onChange, style, placeholder = "0,00", ...props }) {
  return (
    <input
      {...props}
      style={style}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={value || ""}
      onChange={e => onChange(maskMoneyInput(e.target.value))}
    />
  );
}

export default MoneyInput;
