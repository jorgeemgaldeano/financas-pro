# Manifesto do pacote — Finanças PRO v0.3.22

Gerado em: 2026-07-04

## Código

- `src/App.jsx` — versão principal `v0.3.22`.
- `App_v0_3_22.jsx` — cópia versionada.
- `src/services/projectionService.js` — service de projeções com filtros, indicadores e recorrências projetadas.
- `src/components/charts/CashFlowChart.jsx` — gráfico de fluxo de caixa mantido.
- `src/services/financeRepository.js` — camada local de repository mantida.
- `src/hooks/useLocalStorage.js` — hook de LocalStorage mantido.

## Documentação

- `CHANGELOG-v0.3.22.md`.
- `MANIFESTO-v0.3.22.md`.
- `21-RETOMADA-2026-07-04-POS-v0.3.22.md`.
- `07-ROADMAP-E-BACKLOG.md`.
- `08-REGISTRO-DE-DECISOES.md`.
- `09-CHANGELOG.md`.

## Escopo

A versão consolida em uma entrega:

- filtros avançados em Projeções;
- indicadores analíticos do fluxo de caixa;
- projeção conservadora de recorrências e lançamentos previstos.

## Fora do escopo

- Não cria modelo novo de recorrência.
- Não altera LocalStorage.
- Não cria migração.
- Não altera fechamento ou pagamento de fatura.
- Não muda backup/restauração.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```

## Testes manuais mínimos

- Abrir Projeções.
- Testar modo Ano.
- Testar modo Período.
- Filtrar por origem.
- Filtrar por conta.
- Filtrar por cartão.
- Filtrar por categoria.
- Desmarcar simulações.
- Desmarcar recorrências.
- Validar indicadores.
- Confirmar que dados persistidos não foram alterados.
