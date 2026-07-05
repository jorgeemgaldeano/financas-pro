# Manifesto do pacote — Finanças PRO v0.3.24.1

Gerado em: 2026-07-04

## Código

- `src/App.jsx` — versão principal `v0.3.24.1`.
- `App_v0_3_24_1.jsx` — cópia versionada.
- `src/services/projectionService.js` — mantido da versão anterior.
- `src/components/charts/CashFlowChart.jsx` — mantido da versão anterior.
- `src/services/financeRepository.js` — mantido da versão anterior.
- `src/hooks/useLocalStorage.js` — mantido da versão anterior.

## Escopo

Correção pontual da validação de duplicidade em importações:

- cartão de crédito;
- extrato Pluxee/vale;
- preservação do comportamento já aprovado para extrato bancário.

## Fora do escopo

- Alterar fechamento de fatura.
- Alterar pagamento previsto.
- Alterar projeções.
- Criar migração.
- Alterar modelo de recorrência.

## LocalStorage

Sem impacto estrutural.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```

## Checklist mínimo

- Importação bancária continua sem duplicar.
- Importação de cartão não duplica fatura já carregada.
- Importação de cartão não duplica parcelas já geradas em faturas seguintes.
- Importação Pluxee não duplica registros por data, descrição e valor.
