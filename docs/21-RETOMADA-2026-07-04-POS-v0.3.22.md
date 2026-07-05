# Retomada — Finanças PRO — Pós-v0.3.22

Data: 2026-07-04

## Status

Versão gerada para validação:

```txt
v0.3.22 — Filtros avançados, indicadores analíticos e recorrências projetadas em Projeções
```

## Escopo entregue

- Filtros avançados em Projeções:
  - origem;
  - conta;
  - cartão;
  - categoria principal;
  - incluir/excluir simulações;
  - projetar/não projetar recorrências.
- Indicadores analíticos:
  - menor saldo;
  - maior saída;
  - maior queda;
  - meses negativos;
  - maior peso de faturas.
- Projeção analítica de recorrências com base em lançamentos `fixo: true`.

## LocalStorage

Sem alteração.

## Regra de negócio

Houve evolução funcional na interpretação da projeção:

- recorrências podem ser projetadas para meses futuros apenas para análise;
- projeções não criam lançamentos reais;
- filtros alteram a visão calculada, não os dados gravados.

## Pontos de atenção para validação

- Conferir se recorrências não são duplicadas quando já existe lançamento no mês.
- Conferir se desmarcar recorrências reduz os valores projetados quando houver lançamento fixo.
- Conferir se desmarcar simulações remove impacto das simulações.
- Conferir se filtros por categoria não geram expectativa incorreta sobre faturas agregadas.

## Próxima versão sugerida

```txt
v0.3.23 — Revisão de geração efetiva de recorrências e lançamentos previstos
```

Somente após validar a projeção analítica, avaliar se vale criar um modelo formal de recorrências com migração controlada.
