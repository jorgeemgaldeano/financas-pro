# Entrada para o 09-CHANGELOG.md

## [0.3.26.7] — 2026-07-05 — Hotfix de segurança de dados e fuso

### Corrigido
- **E7 — Versionamento de schema não destrutivo.** O repositório passa a migrar
  automaticamente chaves de prefixos de versões anteriores (`fpro_v{n}_`) ao ler,
  eliminando o risco de perda total de dados em futuros incrementos de
  `LS_VERSION`. (`services/financeRepository.js`)
- **E1 — Fuso horário na data/competência corrente.** Novos helpers locais
  `todayIso()` / `todayMonthKey()` substituem `new Date().toISOString()` na
  inicialização do mês, no reset, nas datas-padrão de formulários e nos fallbacks
  de competência/fechamento de fatura. Corrige o app abrir no mês seguinte à
  noite em fusos negativos (UTC-3). (`utils/dateUtils.js`, `App.jsx`,
  `services/cardInvoiceService.js`)
- **E8 — Import faltante.** `moneyToNumber` passa a ser importado em
  `cardInvoiceService.js`, evitando `ReferenceError` latente em simulações com
  valor em texto.
- **E5 — Colisão de IDs.** `uid()` passa a usar `crypto.randomUUID()` com
  fallback. IDs existentes permanecem válidos. (`App.jsx`)

### Adicionado
- **L6 — Aviso de falha de persistência.** Falha ao gravar no LocalStorage
  (ex.: quota excedida) deixa de ser silenciosa: banner de alerta orienta o
  usuário a fazer backup e liberar espaço. (`hooks/useLocalStorage.js`, `App.jsx`)

### Notas
- Sem remoção de funcionalidades. Sem mudança intencional de comportamento.
- `LS_VERSION` mantido em 1. Estrutura do LocalStorage inalterada.
- E2 (dual-write PT/EN) permanece planejado para a v0.3.28.
