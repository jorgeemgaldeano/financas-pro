# Changelog — Finanças PRO v0.3.24.1

Data: 2026-07-04

## Objetivo

Corrigir a validação de duplicidade que ainda falhava na importação de cartão de crédito e aplicar a mesma regra de duplicidade ao extrato Pluxee.

## Corrigido

- Ajustada a validação de duplicidade da importação de cartão de crédito para considerar múltiplos candidatos de data (`dataCompra` e `data`).
- Mantida a validação por destino, data, descrição normalizada, valor e tipo.
- Aplicada a regra de duplicidade ao modo `vale`/Pluxee usando conta destino, data, descrição, valor e tipo.
- Ajustado botão **Sel. tudo** para não remarcar duplicatas identificadas na prévia.
- A confirmação da importação continua revalidando duplicidade antes de salvar.

## Alterado

- `src/App.jsx` atualizado para `v0.3.24.1`.
- Funções auxiliares de chave de duplicidade passaram a gerar candidatos de comparação para reduzir falso negativo em cartão parcelado/importações com `dataCompra`.

## Regras preservadas

- Não houve alteração de regra de fatura.
- Não houve alteração de baixa, pagamento ou projeção.
- Não houve alteração de cálculo financeiro fora da importação.

## Impacto em LocalStorage

- Sem nova chave.
- Sem alteração de estrutura.
- Sem migração.
- Sem alteração em backup/restauração.
- A versão apenas impede novas duplicidades.

## Testes recomendados

1. Importar extrato bancário já validado anteriormente.
2. Reimportar o mesmo extrato bancário e confirmar duplicatas.
3. Importar fatura de cartão uma vez.
4. Reimportar a mesma fatura e confirmar duplicatas.
5. Importar fatura seguinte contendo parcelas já geradas anteriormente e confirmar que não duplica.
6. Importar extrato Pluxee uma vez.
7. Reimportar o mesmo Pluxee e confirmar duplicatas.
8. Confirmar que o botão **Sel. tudo** não seleciona duplicatas.
9. Rodar `npm run build`.
10. Rodar `npm run preview`.
