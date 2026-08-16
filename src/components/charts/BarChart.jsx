// BarChart.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx: barras simples (últimos N meses de despesa).
import { C } from "../../theme/tokens.js";

export function BarChart({ data, color = C.emerald, height = 80 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: "100%", background: color, borderRadius: 3, height: `${(d.value / max) * (height - 18)}px`, minHeight: d.value > 0 ? 4 : 0, opacity: i === data.length - 1 ? 1 : 0.5 }} />
          <span style={{ fontSize: 9, color: C.soft }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default BarChart;
