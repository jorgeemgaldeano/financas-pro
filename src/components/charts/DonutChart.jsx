// DonutChart.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx: rosca de composição por categoria.
import { C } from "../../theme/tokens.js";
import { fmtBRL } from "../../utils/moneyUtils.js";

export function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let offset = 0; const r = 45, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={14} />
      {segments.map((seg, i) => { const pct = seg.value / total, dash = pct * circ, gap = circ - dash; const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={14} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circ} style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }} />; offset += pct; return el; })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill={C.text} fontSize={11} fontWeight="700">{fmtBRL(total).replace("R$", "")}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={C.soft} fontSize={8}>total</text>
    </svg>
  );
}

export default DonutChart;
