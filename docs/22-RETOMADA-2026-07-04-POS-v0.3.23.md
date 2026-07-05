# Retomada — Finanças PRO — Pós v0.3.23

Data: 2026-07-04

## Status

A versão `v0.3.22` foi aprovada parcialmente. Todos os pontos foram aprovados, exceto o controle **Projetar recorrências**, que não estava funcional.

A versão `v0.3.23` foi gerada para corrigir especificamente esse comportamento e iniciar a revisão conservadora de recorrências na tela de Projeções.

## Correção aplicada

- O filtro passou a remover lançamentos recorrentes previstos já materializados no array de transações.
- Recorrências já realizadas continuam entrando no cálculo.
- O texto da tela foi ajustado para **Projetar recorrências previstas**.

## Impacto em LocalStorage

Não houve alteração de LocalStorage.

## Impacto em regra de negócio

Médio e restrito à interpretação da projeção analítica:

- Com o filtro marcado, recorrências previstas entram na projeção.
- Com o filtro desmarcado, recorrências previstas saem da projeção.
- Valores já realizados permanecem no cálculo.

## Próximo passo

Validar a `v0.3.23` com foco em:

```txt
[ ] Toggle Projetar recorrências previstas altera totais
[ ] Toggle altera gráfico
[ ] Toggle altera indicadores
[ ] Valores realizados continuam no cálculo
[ ] Build aprovado
[ ] Preview aprovado
```
