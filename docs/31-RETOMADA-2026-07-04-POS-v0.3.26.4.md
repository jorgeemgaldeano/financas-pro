# Retomada — Finanças PRO — Pós v0.3.26.4

Data: 2026-07-04

## Status

Versão gerada: `v0.3.26.4`.

## Problema corrigido

A primeira carga de cartão voltou a funcionar na v0.3.26.3 e a reimportação do mesmo arquivo também foi validada. Porém, ao importar a fatura subsequente, parcelas já criadas na competência futura eram tratadas como novo parcelamento.

## Causa provável

A validação ainda dependia demais da chave principal do master:

```txt
cartão + descrição base + data da compra + valor aproximado
```

Na prática, o arquivo da fatura subsequente pode alterar a data ou a descrição, por exemplo removendo prefixos como `#PCV` ou mudando a localidade exibida. Com isso, a chave principal não encontrava o lançamento futuro já salvo.

## Correção aplicada

Foi adicionada validação complementar para fatura subsequente:

```txt
cartão + competência + parcela + total de parcelas + valor aproximado + descrição compatível
```

Se uma parcela 2/10 de R$ 116,24 já existe na competência 2026-07, a importação da competência 2026-07 deve reconhecê-la como já existente mesmo se a data e parte da descrição vierem diferentes.

## Impacto em LocalStorage

Nenhum.

## Próxima validação prioritária

1. Usar os dados criados na primeira carga validada.
2. Importar a fatura subsequente.
3. Confirmar que parcelas 2/10, 3/10 etc. já existentes aparecem desmarcadas como duplicadas/existentes.
4. Confirmar que novos lançamentos da fatura subsequente permanecem selecionados.
5. Confirmar que a confirmação da importação não grava duplicidade.

## Próxima recomendação

Só avançar para v0.3.27, isolamento da fatura, após validar a importação de fatura subsequente com parcelas já previstas.
