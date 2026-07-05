# Manifesto do pacote — Finanças PRO v0.3.24.2

Gerado em: 2026-07-04

## Código

- `src/App.jsx` — versão principal `v0.3.24.2` para substituir no projeto.
- `App_v0_3_24_2.jsx` — cópia versionada da mesma versão.
- `src/services/projectionService.js` — mantido da versão anterior.
- `src/components/charts/CashFlowChart.jsx` — mantido da versão anterior.
- `src/services/financeRepository.js` — mantido da versão anterior.
- `src/hooks/useLocalStorage.js` — mantido da versão anterior.

## Documentação

- `CHANGELOG-v0.3.24.2.md`.
- `MANIFESTO-v0.3.24.2.md`.
- `25-RETOMADA-2026-07-04-POS-v0.3.24.2.md`.
- `07-ROADMAP-E-BACKLOG.md`.
- `08-REGISTRO-DE-DECISOES.md`.
- `09-CHANGELOG.md`.

## Escopo

- Correção complementar da importação de cartão de crédito para identificar parcelas futuras já existentes.
- Manutenção da validação de duplicidade de extrato bancário.
- Manutenção da validação de duplicidade de Pluxee.
- Sem alteração de LocalStorage.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```
