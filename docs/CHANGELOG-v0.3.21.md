# Changelog — Finanças PRO v0.3.21

Data: 2026-07-04

## Objetivo

Evoluir a aba **Projeções** com detalhamento expansível por competência, permitindo auditar quais registros compõem receitas, despesas, faturas e simulações em cada mês projetado.

## Adicionado

- Detalhamento expansível na tabela de Projeções por competência.
- Grupos de detalhamento por origem:
  - Receitas;
  - Despesas;
  - Faturas;
  - Simulações.
- Contagem de itens por grupo.
- Exibição de descrição, data, status, origem, categoria e valor de cada item quando disponível.
- Estrutura `detalhes` em cada mês retornado por `buildRealCashFlowProjection`.

## Alterado

- `src/services/projectionService.js` passou a retornar os itens detalhados que compõem cada total mensal.
- `src/App.jsx` passou a controlar meses expandidos na aba Projeções.
- A versão visual foi atualizada para `v0.3.21`.

## Regras preservadas

- A regra de cálculo da `v0.3.20` foi preservada.
- Receitas continuam compondo entradas.
- Despesas de conta continuam compondo saídas.
- Despesas de cartão não são duplicadas como saída de caixa.
- Faturas e pagamentos de fatura continuam compondo saídas projetadas.
- Simulações continuam impactando apenas a projeção, sem virar lançamento real.

## Impacto em LocalStorage

- Sem alteração de chaves.
- Sem alteração de formato persistido.
- Sem migração.
- Sem exclusão ou transformação de dados salvos.

## Avaliação de reutilização e bibliotecas

### Reaproveitamento interno

- Reaproveitado `projectionService.js` criado nas versões anteriores.
- Reaproveitado `CashFlowChart.jsx` da `v0.3.20`.
- Reaproveitadas funções de formatação e categoria já existentes no `App.jsx`.

### Recursos React nativos

- Usado `useState` para controle de expansão dos meses.
- Mantido `useMemo` para cálculo de projeções.
- Usado `Fragment` do React para renderização segura de múltiplas linhas por mês.

### Bibliotecas avaliadas

- Nenhuma biblioteca externa foi adicionada.

### Código novo necessário

- Ampliação do retorno de `projectionService.js`.
- Ajuste de UI em `src/App.jsx` para expandir/ocultar detalhes.

### Justificativa

A `v0.3.20` trouxe o fluxo de caixa real, mas ainda faltava rastreabilidade visual dos números. A `v0.3.21` torna a projeção auditável sem alterar a persistência nem os cálculos financeiros aprovados.

## Testes recomendados

1. Executar `npm run dev`.
2. Confirmar abertura sem tela branca.
3. Confirmar versão visual `v0.3.21`.
4. Abrir aba Projeções.
5. Expandir um mês com receitas/despesas.
6. Expandir um mês com fatura.
7. Expandir um mês com simulação.
8. Confirmar que os totais permanecem iguais aos da `v0.3.20`.
9. Executar `npm run build`.
10. Executar `npm run preview`.
