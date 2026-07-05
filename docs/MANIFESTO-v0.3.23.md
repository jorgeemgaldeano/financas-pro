# Manifesto do pacote — Finanças PRO v0.3.23

Gerado em: 2026-07-04

## Código

- `src/App.jsx` — versão principal `v0.3.23` para substituir no projeto.
- `App_v0_3_23.jsx` — cópia versionada da mesma versão.
- `src/services/projectionService.js` — service de projeções com correção do filtro de recorrências.
- `src/components/charts/CashFlowChart.jsx` — mantido da versão anterior.
- `src/services/financeRepository.js` — mantido da versão anterior.
- `src/hooks/useLocalStorage.js` — mantido da versão anterior.

## Documentação

- `CHANGELOG-v0.3.23.md`
- `MANIFESTO-v0.3.23.md`
- `22-RETOMADA-2026-07-04-POS-v0.3.23.md`
- `09-CHANGELOG.md`
- `07-ROADMAP-E-BACKLOG.md`
- `08-REGISTRO-DE-DECISOES.md`

## Escopo

- Correção do filtro **Projetar recorrências previstas** na aba Projeções.
- Revisão conservadora da regra de projeção de recorrências.
- Preservação dos cálculos aprovados da `v0.3.22` nos demais pontos.

## Fora do escopo

- Criar modelo formal de recorrência.
- Criar migração de LocalStorage.
- Gerar lançamentos recorrentes reais automaticamente.
- Alterar fechamento ou pagamento de fatura.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```

## Testes manuais mínimos

- Abrir Projeções.
- Marcar/desmarcar **Projetar recorrências previstas**.
- Confirmar alteração em totais e gráfico quando houver recorrências previstas.
- Confirmar que dados realizados continuam sendo considerados.
- Confirmar ausência de tela branca.
