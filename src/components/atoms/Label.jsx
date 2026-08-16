// Label.jsx — v0.3.37 Fase 2 (DEC-0038)
// Atom equivalente ao objeto de estilo `lbl` hoje repetido em App.jsx/
// ParamsTab (`lbl2`). `labelStyle` fica exportado à parte para os pontos
// que ainda precisam de `style={labelStyle}` bruto durante a migração
// gradual (Fase 4); `Label` é a versão já em componente.
import { C } from "../../theme/tokens.js";

export const labelStyle = {
  fontSize: 11,
  color: C.soft,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 4,
};

export function Label({ children, style, ...props }) {
  return (
    <div {...props} style={{ ...labelStyle, ...style }}>
      {children}
    </div>
  );
}

export default Label;
