# Retomada — Finanças PRO — Pós v0.3.24.2

Data: 2026-07-04

## Status

A versão `v0.3.24.2` foi gerada para corrigir duplicidade de parcelas futuras na importação de cartão de crédito.

## Contexto do defeito

A `v0.3.24` corrigiu duplicidade no extrato bancário. A `v0.3.24.1` ampliou a validação para cartão e Pluxee, mas o cartão ainda duplicava em um cenário específico: importação de uma fatura futura contendo parcelas que já haviam sido criadas anteriormente por uma compra parcelada.

## Correção aplicada

A importação de cartão passou a comparar também a identidade lógica do parcelamento:

```txt
cartão + descrição sem parcela + valor + parcela/totalParcelas
```

Isso permite reconhecer uma parcela futura já existente mesmo quando a competência ou a data exibida no arquivo são diferentes.

## Impacto em LocalStorage

Nenhum.

## Próxima validação

- Reimportar fatura futura com parcelas já lançadas.
- Confirmar duplicatas desmarcadas.
- Confirmar que itens novos continuam selecionados.
- Revalidar Pluxee.
- Revalidar extrato bancário.
