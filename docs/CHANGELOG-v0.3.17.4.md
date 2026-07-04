# Changelog — Finanças PRO v0.3.17.4

Data: 2026-07-04

## Objetivo

Registrar a correção definitiva da regressão da `v0.3.17` que gerava tela branca na abertura da aplicação e na inclusão de novas simulações.

## Corrigido

- Corrigida tela branca causada por `getSimulationInstallmentValue is not defined`.
- Corrigida tela branca ao adicionar simulação causada por `safeMoneyAmount is not defined`.
- Reorganizada a regra auxiliar de cálculo de simulações para garantir funções declaradas antes do uso.
- Blindada a criação de nova simulação para calcular valor e parcelas antes de atualizar o estado persistido.

## Alterado

- Versão visual intermediária atualizada para `v0.3.17.4` durante validação.
- Tela **Simulações** passou a usar helpers explícitos:
  - `safeMoneyAmount`;
  - `normalizeSimulationInstallments`;
  - `getSimulationInstallmentValue`.

## Regras preservadas

- Simulação com `modoParc === "total"` divide o valor informado pelo número de parcelas.
- Simulação com valor por parcela mantém o valor informado como valor de cada parcela.
- Competência manual da fatura continua prevalecendo quando informada.
- Quando a competência não é informada, o sistema continua calculando pela regra do cartão.
- Simulação não gera lançamento real.

## Impacto em LocalStorage

- Não houve alteração de chave.
- Não houve alteração de estrutura persistida.
- Não houve migração.
- A simulação continua sendo persistida na chave existente `simulacoes`.

## Validação

A versão `v0.3.17.4` foi considerada aprovada pelo usuário em 2026-07-04.

Validações informadas:

- Aplicação sem tela branca após correção.
- Inclusão de nova simulação aprovada.
- Erros `getSimulationInstallmentValue is not defined` e `safeMoneyAmount is not defined` eliminados.

## Status

```txt
v0.3.17.4 — APROVADA
```
