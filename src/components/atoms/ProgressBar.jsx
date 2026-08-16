// ProgressBar.jsx — v0.3.37 Fase 2 (DEC-0038)
// Atom para a barra de progresso hoje duplicada quase igual entre a aba
// Metas e a aba Cofrinhos (track cinza + preenchimento colorido por %).
import { C } from "../../theme/tokens.js";

export function ProgressBar({ pct = 0, color = C.emerald, style, trackStyle }) {
  const clamped = Math.min(100, Math.max(0, pct * 100));
  return (
    <div
      style={{
        background: C.border,
        borderRadius: 4,
        height: 8,
        overflow: "hidden",
        ...trackStyle,
      }}
    >
      <div
        style={{
          height: 8,
          borderRadius: 4,
          width: `${clamped}%`,
          background: color,
          transition: "width .3s",
          ...style,
        }}
      />
    </div>
  );
}

export default ProgressBar;
