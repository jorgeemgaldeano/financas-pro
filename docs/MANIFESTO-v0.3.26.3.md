# Manifesto v0.3.26.3 — Correção de falso duplicado entre parcelas futuras

## Contexto

A v0.3.26.2 passou a identificar corretamente o master lógico do parcelamento, mas a prévia ainda desmarcava automaticamente as parcelas futuras geradas na primeira carga.

## Defeito observado

Em cartão sem histórico, ao importar uma compra parcelada nova, o sistema gerava visualmente as parcelas futuras, mas deixava apenas a primeira selecionada. As demais eram tratadas como duplicadas porque compartilhavam data da compra, descrição base e valor.

## Decisão

Compras parceladas não devem usar a chave estrita de compra à vista para duplicidade entre linhas da prévia.

## Regra corrigida

- Compra à vista: duplicidade por cartão, data, descrição e valor.
- Compra parcelada: duplicidade por master lógico, número da parcela e total de parcelas.

## Impacto LocalStorage

Nenhum impacto estrutural.

## Escopo

Corrigir somente importação de cartão e seleção das parcelas futuras na prévia.
