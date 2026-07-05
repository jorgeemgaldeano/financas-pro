# MANIFESTO — v0.3.25

## Versão
v0.3.25

## Objetivo
Corrigir definitivamente o cenário de duplicidade em cartão de crédito quando uma fatura futura contém parcelas já criadas por importação anterior.

## Arquivos principais
- `src/App.jsx`
- `src/services/cardInstallmentService.js`
- `src/services/projectionService.js`
- `src/components/charts/CashFlowChart.jsx`
- `src/services/financeRepository.js`
- `src/hooks/useLocalStorage.js`

## Arquivos de documentação
- `CHANGELOG-v0.3.25.md`
- `MANIFESTO-v0.3.25.md`
- `26-RETOMADA-2026-07-04-POS-v0.3.25.md`

## Decisão técnica
O cartão parcelado passa a ser tratado como relacionamento lógico 1:N por meio do campo `parcelaGrupo`, sem criar nova chave de LocalStorage.

## Compatibilidade
Compatível com dados existentes. Campos novos são opcionais e aplicados aos novos lançamentos importados.
