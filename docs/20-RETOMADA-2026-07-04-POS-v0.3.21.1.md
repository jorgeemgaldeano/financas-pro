# Retomada — Finanças PRO — Pós-v0.3.21.1

Data: 2026-07-04

## Status

A versão `v0.3.21.1` foi gerada como correção pontual da aba **Projeções**.

## Correções aplicadas

- Campos de período alterados para formato curto `MM/AA`.
- Detalhamento expansível limitado a Cartões/Faturas e Simulações.
- Receitas e despesas continuam nos totais, mas não aparecem item a item no detalhamento.

## Impacto em LocalStorage

Nenhum.

## Impacto em regra de negócio

Baixo. A regra de cálculo da `v0.3.20` e `v0.3.21` foi preservada. A alteração é de usabilidade e redução de poluição visual.

## Próxima validação

- Conferir versão visual `v0.3.21.1`.
- Testar modo Período em Projeções.
- Expandir meses com faturas e simulações.
- Confirmar ausência de detalhamento item a item de receitas e despesas.
- Executar `npm run build` e `npm run preview`.
