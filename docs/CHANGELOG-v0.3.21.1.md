# Changelog — Finanças PRO v0.3.21.1

Data: 2026-07-04

## Objetivo

Aplicar correção pontual na aba **Projeções** após validação da `v0.3.21`, reduzindo poluição visual e melhorando a usabilidade dos filtros de período.

## Alterado

- Atualizada a versão visual para `v0.3.21.1`.
- Campos de período da aba **Projeções** passaram a usar entrada curta no formato `MM/AA`.
- Campos **Início** e **Fim** foram reduzidos e centralizados para evitar texto corrido e excesso de largura.
- Detalhamento expansível das projeções passou a exibir somente:
  - Cartões / Faturas;
  - Simulações.
- Receitas e despesas continuam compondo os totais mensais, mas deixam de aparecer item a item no detalhamento para reduzir poluição visual.

## Preservado

- Cálculo aprovado na `v0.3.20`.
- Gráfico de fluxo de caixa.
- Totais mensais de receitas, despesas, faturas e simulações.
- Estrutura de `projectionService.js`.
- LocalStorage e backup.

## Migração

- Não houve alteração de chaves do LocalStorage.
- Não houve alteração de estrutura persistida.
- Não houve migração.

## Testes recomendados

1. Executar `npm run dev`.
2. Confirmar versão visual `v0.3.21.1`.
3. Acessar **Projeções**.
4. Selecionar modo **Período**.
5. Confirmar campos no formato `MM/AA`.
6. Alterar mês inicial e final.
7. Expandir competência com faturas.
8. Confirmar que apenas Cartões/Faturas e Simulações aparecem no detalhe.
9. Confirmar que Receitas e Despesas permanecem nos totais, sem detalhamento item a item.
10. Executar `npm run build`.
11. Executar `npm run preview`.
