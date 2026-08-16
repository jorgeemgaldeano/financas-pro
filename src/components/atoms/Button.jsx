// Button.jsx — v0.3.37 Fase 2 (DEC-0038)
// Atoms equivalentes aos helpers `btn()`/`ghost()` hoje repetidos em
// App.jsx e duplicados em ParamsTab (`btn2()`/`ghost2()`). `Button` cobre
// o botão sólido (`bg` = cor de fundo); `GhostButton` cobre o botão de
// contorno transparente.
import { C } from "../../theme/tokens.js";

export function Button({ children, bg = C.emerald, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: bg,
        border: "none",
        borderRadius: 8,
        color: "#fff",
        padding: "9px 18px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 14,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: "transparent",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        color: C.soft,
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: 12,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default Button;
