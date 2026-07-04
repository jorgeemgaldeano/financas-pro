# Changelog — Finanças PRO v0.3.19

Data: 2026-07-04

## Objetivo

Criar a primeira extração conservadora dos cálculos da tela **Projeções** para um service próprio, reduzindo responsabilidade do `App.jsx` sem alterar comportamento funcional, regras financeiras ou LocalStorage.

## Adicionado

- Criado `src/services/projectionService.js` com a função pura:
  - `buildMonthlyExpenseProjection`.

## Alterado

- `src/App.jsx` passou a importar `buildMonthlyExpenseProjection` de `projectionService.js`.
- O cálculo de `projections` foi substituído por chamada ao novo service.
- Versão visual atualizada para `v0.3.19`.

## Regras preservadas

- A projeção continua baseada na média mensal de despesas fixas e variáveis.
- Despesas fixas continuam sendo identificadas por `fixo === true` e `tipo === "despesa"`.
- Despesas variáveis continuam sendo identificadas por `fixo !== true` e `tipo === "despesa"`.
- A quantidade de meses projetados continua usando `params.mesesProjecao`.
- A projeção continua iniciando no mês subsequente ao mês atual da execução.

## Impacto em LocalStorage

- Sem alteração de chaves.
- Sem alteração de formato persistido.
- Sem migração.
- Sem alteração em backup/restauração.

## Avaliação de reutilização e bibliotecas

### Reaproveitamento interno

- Reaproveitado o cálculo já existente em `App.jsx`.
- Mantidos `MONTHS`, `TODAY` e `params.mesesProjecao` como origem dos parâmetros.

### Recursos React nativos

- Mantido `useMemo` no `App.jsx` para cálculo derivado.

### Bibliotecas avaliadas

- Nenhuma biblioteca externa foi adicionada.

### Código novo necessário

- `src/services/projectionService.js`.

### Justificativa

A extração reduz o acoplamento da tela com o monólito e prepara a evolução gradual de Projeções sem alterar a regra financeira.

## Testes recomendados

1. Executar `npm run dev`.
2. Confirmar abertura sem tela branca.
3. Confirmar versão visual `v0.3.19`.
4. Abrir aba **Projeções**.
5. Comparar valores da projeção com a versão `v0.3.18`.
6. Alterar `mesesProjecao` em Parâmetros e validar a quantidade de cards.
7. Criar despesa fixa e validar impacto na média fixa.
8. Criar despesa variável e validar impacto na média variável.
9. Recarregar a página e confirmar dados preservados.
10. Executar `npm run build`.
11. Executar `npm run preview`.
