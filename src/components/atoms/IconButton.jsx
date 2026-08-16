// IconButton.jsx — v0.3.37 Fase 2 (DEC-0038)
// Atom para o padrão "×"/ícone de ação em linha (excluir, fechar,
// remover) hoje repetido ~15× em App.jsx com o mesmo miolo de estilo e só
// o `fontSize` variando por contexto.
import { C } from "../../theme/tokens.js";

export function IconButton({ children, color = C.muted, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: "transparent",
        border: "none",
        color,
        cursor: "pointer",
        fontSize: 14,
        padding: "0 2px",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default IconButton;
