# Retomada — Finanças PRO — Pós v0.3.26.5

Data: 2026-07-04

## Status

Versão `v0.3.26.5` gerada para validação.

## Problema tratado

A importação da fatura subsequente passou a reconhecer parcelas existentes, mas ainda precisava tratar um caso real recorrente: a administradora do cartão pode pular, repetir ou renumerar parcelas. Exemplo: no sistema consta 03/10 para a competência, mas o arquivo importado informa 02/10.

## Correção aplicada

- Tolerância de valor reduzida para R$ 0,05.
- Divergências de parcela passam a ser listadas na prévia da importação.
- Linhas divergentes não são importadas automaticamente.
- A prévia passa a oferecer a ação **Corrigir parcela atual e subsequentes** quando o sistema identifica um grupo corrigível.
- A correção renumera as parcelas futuras do mesmo `parcelaGrupo` a partir da competência divergente.

## Impacto em LocalStorage

Sem alteração estrutural. Ação manual altera apenas lançamentos existentes após confirmação explícita.

## Próxima validação prioritária

1. Primeira carga de fatura com 01/10.
2. Reimportação do mesmo arquivo.
3. Fatura subsequente com 02/10 já criada.
4. Divergência controlada com sistema 03/10 e arquivo 02/10.
5. Correção manual da sequência.
6. Conferência da renumeração das parcelas subsequentes.

## Próxima versão sugerida

Somente após aprovação desta versão: `v0.3.27 — isolamento de fatura de cartão`.
