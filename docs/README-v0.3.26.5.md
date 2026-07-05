# Finanças PRO — v0.3.26.5

## Objetivo

Consolidar a correção da importação de faturas de cartão para tratar divergências reais de parcelamento, mantendo a primeira carga e a reimportação já corrigidas na v0.3.26.3/v0.3.26.4.

## Alterações principais

- Reduzida a tolerância de comparação de valor de parcela de R$ 0,10 para R$ 0,05.
- Mantida a validação de parcelas futuras já existentes em fatura subsequente.
- Adicionada identificação de divergência de parcela para casos em que o sistema possui uma parcela prevista diferente da parcela informada pela administradora do cartão.
- Adicionada ação manual na prévia da importação: **Corrigir parcela atual e subsequentes**.
- A ação manual renumera as parcelas do mesmo `parcelaGrupo` a partir da competência divergente, preservando o vínculo do parcelamento.

## Arquivos alterados

- `src/App.jsx`
- `src/services/cardInstallmentService.js`
- `src/services/cardImportService.js`
- `docs/02-REGRAS-DE-NEGOCIO.md`
- `docs/08-REGISTRO-DE-DECISOES.md`
- `docs/09-CHANGELOG.md`
- `docs/10-CRITERIOS-DE-ACEITE.md`

## LocalStorage

Sem nova chave, sem migração e sem alteração estrutural.

A correção manual altera lançamentos já existentes somente após confirmação explícita do usuário, atualizando campos já existentes como `parcela`, `totalParcelas` e `descricao`.

## Validação obrigatória

```bash
npm run build
npm run dev
```

## Teste prioritário

1. Importar primeira fatura com compra parcelada 01/10.
2. Confirmar geração das parcelas futuras.
3. Reimportar o mesmo arquivo e confirmar duplicidade.
4. Importar fatura subsequente.
5. Confirmar que parcelas já existentes são reconhecidas.
6. Simular divergência: sistema com 03/10 e arquivo com 02/10 na mesma competência.
7. Confirmar que o sistema lista divergência e exibe o botão de correção.
8. Acionar **Corrigir parcela atual e subsequentes**.
9. Confirmar renumeração da competência atual e futuras.
