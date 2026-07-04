# Changelog — Finanças PRO v0.3.20

Data: 2026-07-04

## Objetivo

Substituir a visão genérica de Projeções por uma projeção real baseada nos dados existentes do sistema e adicionar um gráfico de fluxo de caixa para análise de evolução em período ou ano.

## Contexto

A `v0.3.19` foi aprovada tecnicamente por extrair o cálculo anterior para `projectionService.js`, mas a regra funcional ainda era limitada por trabalhar com agrupamentos genéricos de fixos e variáveis.

## Adicionado

- Criado `src/components/charts/CashFlowChart.jsx` com gráfico SVG nativo, sem dependência externa.
- Ampliado `src/services/projectionService.js` com `buildRealCashFlowProjection`.
- Adicionados filtros na aba **Projeções**:
  - modo **Ano**;
  - modo **Período**;
  - seleção de ano;
  - seleção de mês inicial e mês final.
- Adicionados indicadores consolidados:
  - saldo inicial;
  - entradas;
  - saídas;
  - saldo final projetado.
- Adicionada tabela de detalhamento por competência.

## Alterado

- A aba **Projeções** deixa de exibir apenas fixos/variáveis e passa a exibir projeção por dados reais.
- O cálculo passa a considerar:
  - receitas existentes;
  - despesas existentes;
  - pagamentos previstos de fatura;
  - faturas ainda não fechadas, projetadas para o mês de vencimento;
  - simulações, projetadas para o mês subsequente à competência da fatura.
- Versão visual atualizada para `v0.3.20`.

## Corrigido

- Corrigida a baixa utilidade analítica da tela de Projeções, que não permitia avaliar fluxo de caixa real.

## Removido

- Não houve remoção de funcionalidade.
- A nomenclatura funcional de projeção baseada em `fixo` e `variável` deixou de ser exibida na tela, mas a compatibilidade técnica da função antiga foi mantida no service como apoio temporário.

## Migração

- Não houve alteração de chaves do LocalStorage.
- Não houve alteração no formato persistido.
- Não houve migração.
- Todos os cálculos usam dados já existentes.

## Impacto em regra de negócio

- Alteração funcional relevante na interpretação da aba Projeções.
- A projeção agora representa fluxo de caixa projetado e não média histórica genérica.
- Não altera regras de lançamentos, faturas, simulações ou saldos; apenas consolida esses dados em nova visão analítica.

## Avaliação de reutilização e bibliotecas

### Reaproveitamento interno

- Reaproveitado `projectionService.js` criado na `v0.3.19`.
- Reaproveitados dados já existentes: `trans`, `cards`, `faturas`, `simulacoes`, `contas` e saldos iniciais.
- Reaproveitadas funções de fatura já existentes no `App.jsx` e em `cardInvoiceService.js`.

### Recursos React nativos

- Mantido uso de `useMemo` para cálculo derivado.
- Mantido uso de `useState` para filtros da aba Projeções.
- Gráfico criado com SVG nativo em componente React.

### Bibliotecas avaliadas

- Nenhuma biblioteca externa foi adicionada.
- Bibliotecas de gráfico foram descartadas nesta etapa para evitar dependência desnecessária.

### Código novo necessário

- `src/components/charts/CashFlowChart.jsx`.
- Ampliação de `src/services/projectionService.js`.

### Justificativa

O gráfico de fluxo de caixa é essencial para análise temporal, mas pode ser entregue com SVG nativo sem adicionar biblioteca nesta etapa.

## Testes recomendados

1. Executar `npm run dev`.
2. Confirmar abertura sem tela branca.
3. Confirmar versão visual `v0.3.20`.
4. Acessar aba **Projeções**.
5. Validar modo **Ano**.
6. Validar modo **Período**.
7. Conferir se o gráfico muda ao trocar filtros.
8. Conferir se tabela e gráfico exibem os mesmos meses.
9. Validar inclusão de faturas no mês de pagamento.
10. Validar impacto de simulações no fluxo projetado.
11. Executar `npm run build`.
12. Executar `npm run preview`.
