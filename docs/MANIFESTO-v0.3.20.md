# Manifesto do pacote — Finanças PRO v0.3.20

Gerado em: 2026-07-04

## Código

- `src/App.jsx` — versão principal `v0.3.20` para substituir no projeto.
- `App_v0_3_20.jsx` — cópia versionada da mesma versão.
- `src/services/projectionService.js` — service de projeções reais e fluxo de caixa.
- `src/components/charts/CashFlowChart.jsx` — gráfico SVG nativo de fluxo de caixa.
- `src/services/financeRepository.js` — mantido da `v0.3.18`.
- `src/hooks/useLocalStorage.js` — mantido da `v0.3.18`.

## Documentação atualizada

- `09-CHANGELOG.md`
- `07-ROADMAP-E-BACKLOG.md`
- `08-REGISTRO-DE-DECISOES.md`
- `CHANGELOG-v0.3.20.md`
- `17-RETOMADA-2026-07-04-POS-v0.3.19.md`
- `18-RETOMADA-2026-07-04-POS-v0.3.20.md`

## Escopo da v0.3.20

- Registrar `v0.3.19` como aprovada tecnicamente.
- Transformar Projeções em visão baseada em dados reais.
- Adicionar gráfico de fluxo de caixa.
- Permitir análise por ano ou período.
- Manter LocalStorage inalterado.

## Fora de escopo

- Não cria backend.
- Não altera estrutura do LocalStorage.
- Não altera regras de fechamento de fatura.
- Não altera regras de baixa de pagamento.
- Não adiciona biblioteca externa.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```

## Testes manuais mínimos

- Abrir aplicação sem tela branca.
- Confirmar versão visual `v0.3.20`.
- Acessar Projeções.
- Validar gráfico de fluxo de caixa no modo Ano.
- Validar gráfico de fluxo de caixa no modo Período.
- Conferir dados de receitas, despesas, faturas e simulações.
- Confirmar dados preservados após recarregar.
