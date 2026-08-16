// Card.jsx — v0.3.37 Fase 2 (DEC-0038)
// Atom equivalente ao helper `card()` hoje repetido dentro de App.jsx e
// ParamsTab (como `card2()`). Mesmo shape visual, agora um componente.
import { C } from "../../theme/tokens.js";

export function Card({ children, style, as: Tag = "div", ...props }) {
  return (
    <Tag
      {...props}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "18px 22px",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

export default Card;
