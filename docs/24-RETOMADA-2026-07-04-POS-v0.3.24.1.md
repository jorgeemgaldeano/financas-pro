# Retomada — Finanças PRO — Pós v0.3.24.1

Data: 2026-07-04

## Status

Versão gerada:

```txt
v0.3.24.1 — Correção complementar de duplicidade em importações
```

## Contexto

A `v0.3.24` corrigiu a duplicidade no extrato bancário, mas o usuário validou que a importação de cartão de crédito ainda duplicava registros. Também foi solicitado aplicar a regra ao extrato Pluxee.

## Correção aplicada

- A chave de duplicidade passou a gerar candidatos com `dataCompra` e `data`.
- Isso reduz falso negativo em cartão quando a importação/parcelamento salva datas em campos diferentes.
- A mesma base de validação cobre Pluxee/vale usando conta destino, data, descrição, valor e tipo.
- O botão **Sel. tudo** não remarca duplicatas identificadas.

## Regras preservadas

- Sem alteração de LocalStorage.
- Sem migração.
- Sem alteração de fatura/pagamento/projeção.

## Próxima validação

1. Reimportar mesma fatura de cartão.
2. Importar fatura seguinte com parcelas já geradas.
3. Reimportar Pluxee.
4. Confirmar duplicatas desmarcadas.
5. Confirmar que registros novos continuam selecionáveis.
