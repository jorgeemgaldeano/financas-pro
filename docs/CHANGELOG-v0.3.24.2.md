# Changelog — Finanças PRO v0.3.24.2

Data: 2026-07-04

## Objetivo

Corrigir a duplicidade específica de cartão de crédito quando uma fatura futura é importada e contém parcelas que já haviam sido geradas por uma compra parcelada importada anteriormente.

## Corrigido

- A validação de duplicidade de cartão passou a identificar parcelas futuras já existentes.
- A chave de duplicidade de cartão agora considera também a identidade lógica do parcelamento:
  - cartão;
  - descrição normalizada sem marcador de parcela;
  - valor da parcela;
  - número da parcela;
  - total de parcelas.
- A detecção continua usando data/dataCompra, descrição, valor e tipo para duplicidades simples.
- A importação Pluxee mantém a validação por conta, data, descrição, valor e tipo.
- O botão **Sel. tudo** continua preservando duplicatas desmarcadas.

## Alterado

- `src/App.jsx` recebeu helpers específicos para normalização de descrição parcelada e identificação de parcela por texto.
- Versão visual atualizada para `v0.3.24.2`.

## Regras preservadas

- Extrato bancário mantém a validação aprovada.
- Pluxee usa a regra de duplicidade por conta/data/descrição/valor/tipo.
- Cartão usa regra adicional para parcelamentos já lançados.

## Impacto em LocalStorage

- Sem alteração de chaves.
- Sem alteração de estrutura.
- Sem migração.
- Sem alteração no backup.
- Não remove duplicidades antigas já gravadas; apenas impede novas duplicidades.

## Testes recomendados

1. Importar uma fatura de cartão com compra parcelada.
2. Salvar a importação.
3. Importar uma fatura futura que contenha uma parcela já criada anteriormente.
4. Confirmar que a parcela aparece como duplicada e desmarcada.
5. Confirmar que registros novos da fatura futura continuam selecionados.
6. Revalidar extrato bancário.
7. Revalidar Pluxee.
8. Executar `npm run build`.
9. Executar `npm run preview`.
