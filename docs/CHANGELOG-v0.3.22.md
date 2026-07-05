# Changelog — Finanças PRO v0.3.22

Data: 2026-07-04

## Objetivo

Consolidar em uma única versão as evoluções inicialmente previstas para `v0.3.22`, `v0.3.23` e `v0.3.24`:

- filtros avançados em Projeções;
- indicadores analíticos do fluxo de caixa;
- revisão conservadora de recorrências e lançamentos previstos dentro da projeção.

## Adicionado

- Filtros avançados na aba **Projeções**:
  - origem: todas, receitas, despesas, cartões/faturas ou simulações;
  - conta;
  - cartão;
  - categoria principal;
  - incluir/excluir simulações;
  - projetar/não projetar recorrências.
- Indicadores analíticos do fluxo de caixa:
  - menor saldo projetado;
  - maior saída;
  - maior queda;
  - quantidade de meses negativos;
  - maior peso de faturas no mês.
- Projeção conservadora de recorrências baseada em lançamentos existentes com `fixo: true`.

## Alterado

- `src/services/projectionService.js` passou a aceitar filtros e a retornar projeções já filtradas.
- A aba **Projeções** passou a exibir filtros e indicadores antes do gráfico.
- Versão visual atualizada para `v0.3.22`.

## Regra de negócio

- A projeção continua sendo calculada sem criar lançamentos reais.
- Recorrências projetadas são apenas analíticas e não são gravadas no LocalStorage.
- O sistema evita duplicar recorrência quando já existe lançamento equivalente no mês projetado.
- Filtros por categoria não detalham faturas agregadas, pois fatura não possui categoria única.

## Impacto em LocalStorage

- Sem nova chave.
- Sem alteração de estrutura.
- Sem migração.
- Sem alteração em backup/restauração.

## Avaliação de reutilização e bibliotecas

### Reaproveitamento interno

- Reaproveitado `projectionService.js` criado nas versões anteriores.
- Reaproveitado `CashFlowChart.jsx`.
- Reaproveitados dados existentes de lançamentos, contas, cartões, faturas, simulações, categorias e saldos iniciais.

### Recursos React nativos

- Mantido uso de `useMemo` para cálculo derivado.
- Mantido uso de `useState` para filtros da tela.

### Bibliotecas avaliadas

- Nenhuma biblioteca externa foi adicionada.

### Código novo necessário

- Evolução de `projectionService.js`.
- Ajustes na UI de `App.jsx`.

## Testes recomendados

1. Executar `npm run dev`.
2. Confirmar versão visual `v0.3.22`.
3. Validar filtros por origem, conta, cartão e categoria.
4. Testar incluir/excluir simulações.
5. Testar ativar/desativar recorrências projetadas.
6. Confirmar atualização dos indicadores analíticos.
7. Confirmar que o gráfico muda conforme filtros.
8. Confirmar que não houve gravação nova no LocalStorage.
9. Executar `npm run build`.
10. Executar `npm run preview`.
