// ProgressStat.jsx — v0.3.37 Fase 3 (DEC-0038)
// Molecule: cabeçalho (título + Badge de status) + valor/alvo + ProgressBar
// + legenda de %, para o padrão hoje quase duplicado entre a aba Metas e a
// aba Cofrinhos. Não é o card inteiro — cada organism continua livre para
// colocar conteúdo específico (aporte sugerido, lista de movimentos, botão
// de editar limite) acima/abaixo deste bloco.
import { C } from "../../theme/tokens.js";
import { Badge } from "../atoms/Badge.jsx";
import { ProgressBar } from "../atoms/ProgressBar.jsx";

export function ProgressStat({ title, subtitle, badgeLabel, badgeColor, valueLabel, pct, barColor, caption }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {badgeLabel && <Badge color={badgeColor} style={{ padding: "3px 8px" }}>{badgeLabel}</Badge>}
      </div>

      {valueLabel && <div style={{ marginBottom: 6 }}>{valueLabel}</div>}
      <div style={{ marginBottom: 4 }}>
        <ProgressBar pct={pct} color={barColor} />
      </div>
      {caption && <div style={{ fontSize: 11, color: C.soft, marginBottom: 10 }}>{caption}</div>}
    </div>
  );
}

export default ProgressStat;
