# Manifesto do pacote — Finanças PRO v0.3.21

Gerado em: 2026-07-04

## Código

- `src/App.jsx` — versão principal `v0.3.21`.
- `App_v0_3_21.jsx` — cópia versionada da mesma versão.
- `src/services/projectionService.js` — service de projeções com detalhamento por origem.
- `src/components/charts/CashFlowChart.jsx` — gráfico de fluxo de caixa mantido da `v0.3.20`.
- `src/services/financeRepository.js` — repository local mantido da `v0.3.18`.
- `src/hooks/useLocalStorage.js` — hook de LocalStorage mantido.

## Documentação

- `CHANGELOG-v0.3.21.md`.
- `MANIFESTO-v0.3.21.md`.
- `19-RETOMADA-2026-07-04-POS-v0.3.21.md`.
- `09-CHANGELOG.md` atualizado.
- `07-ROADMAP-E-BACKLOG.md` atualizado.
- `08-REGISTRO-DE-DECISOES.md` atualizado.

## Escopo

- Detalhamento expansível das projeções por competência.
- Auditoria visual dos itens que compõem receitas, despesas, faturas e simulações.
- Sem alteração de LocalStorage.
- Sem migração.
- Sem dependência nova.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```

## Testes manuais mínimos

- Abrir aplicação sem tela branca.
- Confirmar versão visual `v0.3.21`.
- Abrir aba Projeções.
- Expandir/ocultar meses na tabela.
- Conferir detalhes de receitas.
- Conferir detalhes de despesas.
- Conferir detalhes de faturas.
- Conferir detalhes de simulações.
- Confirmar que os totais mensais permanecem coerentes.
