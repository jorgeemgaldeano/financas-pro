# Finanças PRO — v0.3.16

## Objetivo

Estabilizar regras de cartão/fatura antes da evolução da tela Projeções.

## Alterações

- Atualizada a versão visual para `v0.3.16`.
- Criada compatibilidade centralizada para conta de pagamento do cartão usando `contaPagamentoId` e `accountId`.
- Migração conservadora em memória/LocalStorage para cartões antigos que possuam apenas um dos campos de conta associada.
- Cadastro e edição de cartão passam a manter `contaPagamentoId` e `accountId` sincronizados.
- Fechamento de fatura passa a gravar `paidAmount`, `pendingAmount`, `paymentTransactionId`, `accountId` e `contaPagamentoId` na fatura.
- Pagamento previsto da fatura passa a gravar `accountId` e `pendingAmount`.
- Baixa total/parcial de pagamento de fatura passa a sincronizar o status da fatura:
  - `fechada` quando não há pagamento;
  - `parcialmente_paga` quando há pagamento parcial;
  - `paga` quando o valor pago cobre a fatura.

## LocalStorage

- Não houve criação de novas chaves.
- Não houve alteração incompatível de estrutura.
- Campos novos/opcionais são adicionados de forma compatível aos objetos já existentes.
- Cartões antigos com `contaPagamentoId` ou `accountId` continuam compatíveis.

## Regras preservadas

- Despesa de cartão continua sem debitar conta corrente diretamente.
- Pagamento de fatura continua sendo lançamento previsto na conta associada ao cartão.
- Baixa total/parcial continua aplicada no lançamento previsto.
- Ajustes de fatura continuam impactando o cálculo da fatura.
