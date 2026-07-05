# Retomada — Pós v0.3.26.3

## Estado

A v0.3.26.3 corrige o falso positivo de duplicidade entre parcelas futuras geradas automaticamente na primeira importação de uma compra parcelada.

## Próxima validação obrigatória

1. Cartão vazio.
2. Importar fatura com compra parcelada 1/10.
3. Verificar se parcelas 1/10 a 10/10 ficam selecionadas.
4. Confirmar importação.
5. Verificar lançamentos nas competências futuras.
6. Reimportar uma fatura futura contendo uma dessas parcelas.
7. Verificar se a parcela futura já existente é bloqueada como duplicada.

## Observação

Não avançar para isolamento de fatura enquanto a importação de cartão parcelado não estiver aprovada.
