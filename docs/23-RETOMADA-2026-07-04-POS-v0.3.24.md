# Retomada — Finanças PRO — Pós v0.3.24

Data: 2026-07-04

## Status

Versão gerada: `v0.3.24`.

## Problema corrigido

Foi identificado que as importações de extrato bancário e de fatura/cartão de crédito permitiam duplicidades quando já existia lançamento com mesma data, descrição e valor.

## Correção aplicada

A importação passa a validar duplicidade por:

- destino da importação;
- data;
- descrição normalizada;
- valor arredondado;
- tipo.

A validação ocorre na prévia e novamente na confirmação da importação.

## Impacto em LocalStorage

Sem alteração de estrutura, chaves ou migração.

## Próxima validação

- Reimportar o mesmo extrato bancário.
- Reimportar a mesma fatura de cartão.
- Importar uma fatura posterior com registros novos.
- Confirmar que duplicatas não entram e registros novos entram.
