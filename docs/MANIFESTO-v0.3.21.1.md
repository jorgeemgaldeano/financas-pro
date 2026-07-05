# Manifesto do pacote — Finanças PRO v0.3.21.1

Gerado em: 2026-07-04

## Código

- `src/App.jsx` — versão principal `v0.3.21.1` para substituir no projeto.
- `App_v0_3_21_1.jsx` — cópia versionada da mesma versão.
- `src/services/projectionService.js` — mantido da `v0.3.21`.
- `src/components/charts/CashFlowChart.jsx` — mantido da `v0.3.21`.
- `src/services/financeRepository.js` — mantido da `v0.3.18`.
- `src/hooks/useLocalStorage.js` — mantido compatível.

## Documentação

- `CHANGELOG-v0.3.21.1.md`
- `MANIFESTO-v0.3.21.1.md`
- `20-RETOMADA-2026-07-04-POS-v0.3.21.1.md`

## Escopo

Correção pontual da aba **Projeções**:

- Filtros de período exibidos em `MM/AA`.
- Remoção do detalhamento item a item de receitas e despesas.
- Manutenção do detalhamento de Cartões/Faturas e Simulações.

## Fora do escopo

- Alterar cálculo da projeção.
- Alterar LocalStorage.
- Alterar regra de fatura.
- Alterar backup/restauração.
- Adicionar biblioteca externa.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```
