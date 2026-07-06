// transactionNormalizer.js — v0.3.28
//
// Resolve o achado E2 (dual-write PT/EN sem fonte de verdade única).
//
// Contexto real do código (confirmado por auditoria): os campos em português
// (`valor`, `contaId`, `cartaoId`, `competencia`, `valorPago`) são o par
// dominante — usados na grande maioria das leituras do App.jsx. Os campos em
// inglês (`amount`, `accountId`, `cardId`, `competenceMonth`, `paidAmount`)
// são mantidos como espelho, principalmente para compatibilidade de backup e
// para módulos mais novos (`projectionService.js`), que já leem com fallback
// bidirecional (`t.contaId || t.accountId`).
//
// Decisão de campo canônico: PORTUGUÊS. Os campos em inglês continuam sendo
// gravados como alias (não removidos — Regra Geral do projeto: não alterar
// LocalStorage sem migração, não remover funcionalidade), mas passam a ser
// SEMPRE consistentes com o campo canônico a partir desta normalização.
//
// A normalização é aplicada na FRONTEIRA do LocalStorage (ao ler o array de
// transações), não espalhada pelos pontos de leitura. Isso fecha
// estruturalmente o vetor de bug do E2 (ex.: `movimentoContaMes`, que filtra
// só por `contaId` sem fallback): depois de normalizado, `contaId` está
// sempre correto — o fallback deixa de ser necessário para ser seguro.

// Pares [canônico(PT), alias(EN)]
export const DUAL_FIELD_PAIRS = [
  ["valor", "amount"],
  ["contaId", "accountId"],
  ["cartaoId", "cardId"],
  ["competencia", "competenceMonth"],
  ["valorPago", "paidAmount"],
];

// Normaliza UMA transação: garante que o par (canônico, alias) fique
// consistente. Regra de conflito: se os dois lados existem e divergem, o
// campo CANÔNICO (PT) vence.
export function normalizeTransaction(t) {
  if (!t || typeof t !== "object") return t;
  let changed = false;
  const patch = {};
  for (const [ptKey, enKey] of DUAL_FIELD_PAIRS) {
    const hasPt = t[ptKey] !== undefined && t[ptKey] !== null && t[ptKey] !== "";
    const hasEn = t[enKey] !== undefined && t[enKey] !== null && t[enKey] !== "";
    if (hasPt && !hasEn) {
      patch[enKey] = t[ptKey];
      changed = true;
    } else if (!hasPt && hasEn) {
      patch[ptKey] = t[enKey];
      changed = true;
    } else if (hasPt && hasEn && t[ptKey] !== t[enKey]) {
      patch[enKey] = t[ptKey];
      changed = true;
    }
  }
  return changed ? { ...t, ...patch } : t;
}

// Normaliza uma lista completa. Só cria novos objetos quando algo mudou
// (preserva identidade referencial das transações inalteradas — importante
// para useMemo/React.memo).
export function normalizeTransactions(list) {
  if (!Array.isArray(list)) return list;
  let anyChanged = false;
  const next = list.map((t) => {
    const n = normalizeTransaction(t);
    if (n !== t) anyChanged = true;
    return n;
  });
  return anyChanged ? next : list;
}

// Helper para ESCRITA de novos registros: garante os dois lados desde a
// criação (uso recomendado em código novo). Código existente que já escreve
// ambos os campos manualmente não precisa ser tocado — continua funcionando.
export function withDualFields(partial) {
  return normalizeTransaction({ ...partial });
}
