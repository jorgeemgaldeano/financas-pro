# Manifesto do pacote — Finanças PRO v0.3.24

Gerado em: 2026-07-04

## Código

- `src/App.jsx` — versão principal `v0.3.24`.
- `App_v0_3_24.jsx` — cópia versionada.
- `src/services/projectionService.js` — mantido da versão anterior.
- `src/components/charts/CashFlowChart.jsx` — mantido da versão anterior.
- `src/services/financeRepository.js` — mantido da versão anterior.
- `src/hooks/useLocalStorage.js` — mantido da versão anterior.

## Escopo

Correção de integridade na importação para evitar duplicidades em extrato bancário e fatura/cartão de crédito.

## Fora de escopo

- Não altera modelo de LocalStorage.
- Não cria migração.
- Não altera regras de fechamento de fatura.
- Não altera parser de OFX/CSV/TXT.
- Não altera cálculo das projeções.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```

## Testes manuais mínimos

- Importar extrato bancário repetido.
- Importar fatura/cartão repetida.
- Confirmar duplicatas desmarcadas por padrão.
- Confirmar que registros novos continuam selecionáveis.
- Conferir relatório de importação.
