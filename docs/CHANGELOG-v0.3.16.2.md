# Changelog — Finanças PRO v0.3.16.2 — Correção pós-validação + edição em cartões

Data: 2026-07-03

## Objetivo

Corrigir a exibição do valor do pagamento previsto de fatura na aba **Lançamentos** e adicionar ações controladas para editar valor ou excluir lançamentos diretamente na aba **Cartões**.

## Corrigido

- Corrigida a exibição do valor de lançamentos previstos na aba **Lançamentos**.
- O pagamento previsto de fatura continua sem impactar saldo realizado até a baixa, mas agora a coluna **Valor** exibe o valor previsto da fatura em vez de `R$ 0,00`.
- Preservada a regra de que `valorRealizado` permanece zerado para lançamentos previstos nos cálculos de saldo.

## Adicionado

- Adicionada ação **Editar valor** na lista de lançamentos da fatura dentro da aba **Cartões**.
- Adicionada ação **Excluir** na lista de lançamentos da fatura dentro da aba **Cartões**.
- Para lançamentos parcelados, a edição ou exclusão permite escolher o escopo:
  - somente o lançamento do mês;
  - todos os lançamentos da compra parcelada;
  - este lançamento e os futuros.

## Regras preservadas

- Fatura fechada continua protegida contra alteração direta.
- Edição ou exclusão de lançamento de cartão é bloqueada quando qualquer lançamento afetado pertence a fatura fechada.
- Para alterar lançamento de fatura fechada, o usuário deve reabrir a fatura, alterar o lançamento e fechar novamente para atualizar o pagamento previsto.
- Despesas de cartão continuam compondo a fatura e não debitam diretamente a conta corrente.
- Pagamento de fatura continua sendo lançamento previsto na conta associada ao cartão.

## Impacto em LocalStorage

- Não houve criação de nova chave.
- Não houve migração obrigatória.
- Não houve alteração incompatível de estrutura.
- Foram alterados apenas valores de campos já existentes em lançamentos quando o usuário usa a nova ação de edição.
- A exclusão remove lançamentos selecionados conforme escopo confirmado pelo usuário.

## CTs e fluxos afetados

- Retestar fechamento de fatura e conferência do pagamento previsto em **Lançamentos** no mês de vencimento.
- Retestar edição de lançamento simples de cartão.
- Retestar exclusão de lançamento simples de cartão.
- Retestar edição de lançamento parcelado nos três escopos.
- Retestar exclusão de lançamento parcelado nos três escopos.
- Retestar bloqueio de edição/exclusão quando a fatura estiver fechada.

## Testes recomendados

1. Criar despesa no cartão.
2. Fechar a fatura.
3. Ir para o mês subsequente, conforme vencimento da fatura.
4. Abrir **Lançamentos** e confirmar que o pagamento previsto aparece com o valor da fatura.
5. Reabrir a fatura.
6. Editar valor de um lançamento simples na aba **Cartões**.
7. Fechar novamente a fatura e confirmar atualização do pagamento previsto.
8. Criar compra parcelada e testar edição somente do mês.
9. Testar edição de todas as parcelas.
10. Testar edição da parcela atual e futuras.
11. Testar exclusão nos mesmos três escopos.
12. Confirmar que fatura fechada bloqueia edição e exclusão.
13. Executar `npm run dev`, `npm run build` e `npm run preview`.
