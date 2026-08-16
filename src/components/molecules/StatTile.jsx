// StatTile.jsx — v0.3.37 Fase 3 (DEC-0038)
// Molecule: Card + Label + StatValue + legenda opcional, para o padrão de
// "cartão de estatística" hoje repetido no Dashboard (Saldo Inicial,
// Entradas do Mês, Saldo Final etc.).
import { C } from "../../theme/tokens.js";
import { Card } from "../atoms/Card.jsx";
import { Label } from "../atoms/Label.jsx";
import { StatValue } from "../atoms/StatValue.jsx";

export function StatTile({ label, value, color = C.text, caption, style, children }) {
  return (
    <Card style={style}>
      <Label>{label}</Label>
      <StatValue color={color}>{value}</StatValue>
      {caption && <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>{caption}</div>}
      {children}
    </Card>
  );
}

export default StatTile;
