# Retomada — Finanças PRO — Pós-geração v0.3.20

Data: 2026-07-04

## Status

A versão `v0.3.20` foi gerada para validação.

## Contexto

A `v0.3.19` foi aprovada tecnicamente. A evolução seguinte corrige a direção funcional da aba **Projeções**, que estava limitada por termos genéricos como fixos e variáveis.

## Escopo entregue

- Projeções passam a usar dados reais do sistema.
- Adicionado gráfico de fluxo de caixa.
- Criado modo de análise por ano.
- Criado modo de análise por período.
- Adicionada tabela de detalhamento por competência.
- Mantido LocalStorage sem alteração.

## Arquivos principais

- `src/App.jsx`
- `src/services/projectionService.js`
- `src/components/charts/CashFlowChart.jsx`

## Regras preservadas

- Persistência continua em LocalStorage.
- Não houve migração.
- Não houve alteração em faturas, baixas ou lançamentos.
- Simulações continuam sem afetar dados reais.

## Pontos de validação

```txt
[ ] Aplicação abre sem tela branca
[ ] Versão visual mostra v0.3.20
[ ] Aba Projeções abre
[ ] Modo Ano funciona
[ ] Modo Período funciona
[ ] Gráfico exibe evolução do saldo projetado
[ ] Entradas e saídas aparecem no gráfico
[ ] Tabela exibe receitas, despesas, faturas e simulações
[ ] Simulações impactam apenas projeção
[ ] Faturas aparecem no mês de pagamento
[ ] npm run build aprovado
[ ] npm run preview aprovado
```

## Próxima recomendação

Após validação da `v0.3.20`, a próxima versão deve ser de refinamento visual e analítico da Projeções:

```txt
v0.3.21 — Detalhamento expansível das projeções por origem
```

Possíveis melhorias:

- Expandir mês e listar lançamentos considerados.
- Separar realizado, previsto e simulado.
- Filtrar por conta.
- Filtrar por cartão.
- Exibir alertas de saldo negativo.
