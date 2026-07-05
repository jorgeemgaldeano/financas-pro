# CHANGELOG — v0.3.25

## Status
Gerada para validação.

## Tema
Controle interno de parcelamentos de cartão na importação de faturas.

## Alterações
- Criado `src/services/cardInstallmentService.js`.
- Adicionado controle lógico de compra parcelada 1:N.
- Importação de cartão passa a identificar parcela já prevista em compra parcelada existente.
- Quando a parcela pertence a parcelamento conhecido, o lançamento fica desmarcado e não é salvo.
- Divergências de número de parcela, total de parcelas ou valor são apontadas no relatório da importação.
- Novos parcelamentos recebem `parcelaGrupo` e `descricaoBaseParcelamento`.
- Banco e Pluxee permanecem com a validação de duplicidade já implantada.

## Regras preservadas
- Sem alteração de chaves do LocalStorage.
- Sem migração obrigatória.
- Sem exclusão automática de duplicidades antigas.
- Sem alteração no fechamento de fatura.
- Sem alteração em pagamento previsto de fatura.

## Risco conhecido
A identificação usa descrição base normalizada, cartão, valor da parcela e total de parcelas. Compras distintas no mesmo cartão, com mesma descrição base, mesmo valor e mesmo total de parcelas podem ser tratadas como mesmo parcelamento. Essa decisão privilegia a prevenção de duplicidade em faturas futuras, conforme ajuste solicitado.
