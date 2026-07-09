import { THEME } from "../../constants/theme.js";

export function CashFlowChart({ data = [], height = 220, colors = {} }) {
  const safeData = Array.isArray(data) ? data : [];
  const width = Math.max(640, safeData.length * 74);
  const padding = { top: 18, right: 28, bottom: 46, left: 78 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const saldoColor = colors.saldo || THEME.gold;
  const entradaColor = colors.entradas || THEME.emerald;
  const saidaColor = colors.saidas || THEME.coral;
  const textColor = colors.text || THEME.text;
  const softColor = colors.soft || THEME.soft;
  const gridColor = colors.grid || THEME.border;

  if (!safeData.length) {
    return <div style={{ height, display:"flex", alignItems:"center", justifyContent:"center", color:softColor, fontSize:13 }}>Sem dados para exibir.</div>;
  }

  const values = safeData.flatMap(item => [item.saldoProjetado || 0, item.entradas || 0, item.saidas || 0]);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(1, ...values);
  const range = maxValue - minValue || 1;
  const xFor = index => padding.left + (safeData.length === 1 ? innerWidth / 2 : (index / (safeData.length - 1)) * innerWidth);
  const yFor = value => padding.top + innerHeight - (((value || 0) - minValue) / range) * innerHeight;
  const linePath = key => safeData.map((item, index) => `${index === 0 ? "M" : "L"}${xFor(index)},${yFor(item[key] || 0)}`).join(" ");
  const zeroY = yFor(0);
  const moneyShort = value => {
    const abs = Math.abs(Number(value) || 0);
    if (abs >= 1000000) return `${value < 0 ? "-" : ""}R$ ${(abs / 1000000).toFixed(1)} mi`;
    if (abs >= 1000) return `${value < 0 ? "-" : ""}R$ ${(abs / 1000).toFixed(1)} mil`;
    return `${value < 0 ? "-" : ""}R$ ${abs.toFixed(0)}`;
  };
  const ticks = [maxValue, minValue + range / 2, minValue];

  return (
    <div style={{ overflowX:"auto", width:"100%" }}>
      <svg width={width} height={height} role="img" aria-label="Gráfico de fluxo de caixa projetado">
        <rect x="0" y="0" width={width} height={height} rx="10" fill="transparent" />
        {ticks.map((tick, index) => {
          const y = yFor(tick);
          return (
            <g key={index}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={gridColor} strokeDasharray="4 5" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fill={softColor} fontSize="10">{moneyShort(tick)}</text>
            </g>
          );
        })}
        <line x1={padding.left} y1={zeroY} x2={width - padding.right} y2={zeroY} stroke={gridColor} strokeWidth="1.2" />

        {safeData.map((item, index) => {
          const x = xFor(index);
          const barWidth = Math.min(22, Math.max(10, innerWidth / Math.max(1, safeData.length * 3.5)));
          const entradasY = yFor(item.entradas || 0);
          const saidasY = yFor(item.saidas || 0);
          return (
            <g key={item.monthKey || index}>
              <rect x={x - barWidth - 2} y={Math.min(entradasY, zeroY)} width={barWidth} height={Math.abs(zeroY - entradasY)} rx="3" fill={entradaColor} opacity="0.65" />
              <rect x={x + 2} y={Math.min(saidasY, zeroY)} width={barWidth} height={Math.abs(zeroY - saidasY)} rx="3" fill={saidaColor} opacity="0.55" />
              <text x={x} y={height - 18} textAnchor="middle" fill={softColor} fontSize="10">{item.label}</text>
            </g>
          );
        })}

        <path d={linePath("saldoProjetado")} fill="none" stroke={saldoColor} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {safeData.map((item, index) => (
          <circle key={`${item.monthKey || index}-saldo`} cx={xFor(index)} cy={yFor(item.saldoProjetado || 0)} r="4" fill={saldoColor} stroke={textColor} strokeWidth="1" />
        ))}

        <g transform={`translate(${padding.left}, 12)`}>
          <circle cx="0" cy="0" r="4" fill={saldoColor} /><text x="9" y="4" fill={softColor} fontSize="11">Saldo projetado</text>
          <rect x="118" y="-5" width="8" height="10" rx="2" fill={entradaColor} opacity="0.65" /><text x="132" y="4" fill={softColor} fontSize="11">Entradas</text>
          <rect x="200" y="-5" width="8" height="10" rx="2" fill={saidaColor} opacity="0.55" /><text x="214" y="4" fill={softColor} fontSize="11">Saídas</text>
        </g>
      </svg>
    </div>
  );
}
