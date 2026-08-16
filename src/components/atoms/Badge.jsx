// Badge.jsx — v0.3.37 Fase 2 (DEC-0038)
// Atom para o "pill" de status hoje repetido em Metas ("⚠ Acima do
// limite"), Cofrinhos ("✅ Concluído"/"⚠ Atrasado") e Lançamentos
// (badge de transferência) com o mesmo miolo de estilo.
import { C } from "../../theme/tokens.js";

export function Badge({ children, color = C.emerald, style, ...props }) {
  return (
    <span
      {...props}
      style={{
        fontSize: 10,
        background: color + "22",
        color,
        padding: "2px 7px",
        borderRadius: 20,
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
