# Modelo de Dados e LocalStorage — Finanças PRO

## Objetivo

Registrar diretrizes para evolução da estrutura de dados persistida no navegador.

## Princípios

1. Todo dado salvo deve ter estrutura previsível.
2. Toda alteração incompatível deve ter migração.
3. Campos novos devem ter valor padrão.
4. Campos antigos não devem quebrar a aplicação.
5. Dados financeiros devem ser rastreáveis.
6. Evitar perda de dados em atualizações.

## Versionamento sugerido

Criar uma versão global de armazenamento:

```js
const STORAGE_VERSION = 2;
```

Exemplo de estrutura consolidada futura:

```js
{
  version: 2,
  createdAt: "2026-06-27T00:00:00.000Z",
  updatedAt: "2026-06-27T00:00:00.000Z",
  accounts: [],
  cards: [],
  transactions: [],
  categories: [],
  people: [],
  goals: [],
  params: {},
  invoices: [],
  imports: [],
  backups: []
}
```

Caso a aplicação atual use múltiplas chaves, a migração deve respeitar esse formato até haver decisão formal de consolidar.

## Entidades sugeridas

### Conta

```js
{
  id: "acc_001",
  name: "Conta Principal",
  type: "corrente",
  bank: "Banco",
  active: true,
  initialBalances: {
    "2026-06": 1000
  },
  createdAt: "2026-06-27T00:00:00.000Z",
  updatedAt: "2026-06-27T00:00:00.000Z"
}
```

### Cartão

```js
{
  id: "card_001",
  name: "Cartão Principal",
  institution: "Banco",
  limit: 5000,
  closingDay: 20,
  dueDay: 10,
  accountId: "acc_001",
  active: true,
  createdAt: "2026-06-27T00:00:00.000Z",
  updatedAt: "2026-06-27T00:00:00.000Z"
}
```

Campo obrigatório importante:

- `accountId`: conta corrente associada ao cartão.

### Lançamento

```js
{
  id: "txn_001",
  type: "despesa",
  origin: "conta",
  description: "Mercado",
  amount: 150.75,
  date: "2026-06-27",
  competenceMonth: "2026-06",
  accountId: "acc_001",
  cardId: null,
  categoryId: "cat_001",
  subcategoryId: "sub_001",
  personId: null,
  status: "pago",
  paidAmount: 150.75,
  pendingAmount: 0,
  recurringId: null,
  installmentGroupId: null,
  notes: "",
  createdAt: "2026-06-27T00:00:00.000Z",
  updatedAt: "2026-06-27T00:00:00.000Z"
}
```

### Lançamento de cartão

```js
{
  id: "txn_002",
  type: "despesa",
  origin: "cartao",
  description: "Compra parcelada",
  amount: 300,
  date: "2026-06-27",
  competenceMonth: "2026-07",
  accountId: null,
  cardId: "card_001",
  categoryId: "cat_001",
  status: "previsto",
  installmentGroupId: "inst_001",
  installmentNumber: 1,
  installmentTotal: 3,
  createdAt: "2026-06-27T00:00:00.000Z",
  updatedAt: "2026-06-27T00:00:00.000Z"
}
```

Observação:

- Despesa de cartão deve possuir `cardId`.
- Não precisa possuir `accountId`, pois a conta é definida no cadastro do cartão.

### Ajuste de cartão

```js
{
  id: "adj_001",
  type: "ajuste_cartao",
  origin: "cartao",
  description: "Ajuste manual da fatura",
  amount: -25.50,
  date: "2026-06-27",
  competenceMonth: "2026-07",
  cardId: "card_001",
  invoiceId: "inv_001",
  reason: "Correção manual",
  createdAt: "2026-06-27T00:00:00.000Z",
  updatedAt: "2026-06-27T00:00:00.000Z"
}
```

### Fatura

```js
{
  id: "inv_001",
  cardId: "card_001",
  accountId: "acc_001",
  competenceMonth: "2026-07",
  dueMonth: "2026-08",
  status: "fechada",
  expensesTotal: 1200,
  adjustmentsTotal: -25.50,
  finalAmount: 1174.50,
  paidAmount: 0,
  pendingAmount: 1174.50,
  paymentTransactionId: "txn_999",
  closedAt: "2026-07-25T00:00:00.000Z",
  createdAt: "2026-06-27T00:00:00.000Z",
  updatedAt: "2026-06-27T00:00:00.000Z"
}
```

### Pagamento previsto de fatura

```js
{
  id: "txn_999",
  type: "pagamento_fatura",
  origin: "conta",
  description: "Pagamento fatura Cartão Principal - 2026-07",
  amount: 1174.50,
  date: "2026-08-10",
  competenceMonth: "2026-08",
  accountId: "acc_001",
  cardId: "card_001",
  invoiceId: "inv_001",
  status: "previsto",
  paidAmount: 0,
  pendingAmount: 1174.50,
  createdAt: "2026-07-25T00:00:00.000Z",
  updatedAt: "2026-07-25T00:00:00.000Z"
}
```

## Status sugeridos

### TransactionStatus

```js
export const TransactionStatus = {
  PREVISTO: "previsto",
  PARCIAL: "parcial",
  PAGO: "pago",
  CANCELADO: "cancelado"
};
```

### InvoiceStatus

```js
export const InvoiceStatus = {
  ABERTA: "aberta",
  FECHADA: "fechada",
  PARCIALMENTE_PAGA: "parcialmente_paga",
  PAGA: "paga",
  CANCELADA: "cancelada"
};
```

## Migrações

Toda migração deve seguir o padrão:

```js
function migrateV1ToV2(data) {
  return {
    ...data,
    version: 2,
    cards: data.cards.map(card => ({
      ...card,
      accountId: card.accountId ?? null
    }))
  };
}
```

## Cuidados com dinheiro

Evitar cálculos financeiros usando floats sem cuidado.

Recomendações:

- Centralizar soma em função utilitária.
- Arredondar em duas casas quando exibir.
- Para cálculos críticos, considerar trabalhar em centavos.
- Não espalhar `toFixed` em regras de negócio.
- Usar `toFixed` apenas em apresentação, quando possível.

## Cuidados com datas

Usar formato interno padronizado:

- Data: `YYYY-MM-DD`
- Mês de competência: `YYYY-MM`
- Timestamp: ISO string

Evitar depender de `new Date("YYYY-MM-DD")` sem cuidado com timezone.

## Atualização 2026-06-27 — Campos e chaves adicionados recentemente

### Regras de autocategorização em parâmetros

As regras personalizadas de autocategorização podem ser salvas dentro de `params`:

```js
{
  autoCategoryRules: [
    {
      id: "rule_001",
      type: "despesa",
      categoryId: "cat_001",
      keywords: ["mercado", "supermercado", "atacadao"],
      createdAt: "2026-06-27T00:00:00.000Z"
    }
  ]
}
```

Campo opcional. Dados antigos sem `autoCategoryRules` devem considerar lista vazia.

### Lote de importação

Lançamentos criados por importação podem possuir:

```js
{
  importBatchId: "imp_20260627_001",
  importSource: "bank_ofx",
  importedAt: "2026-06-27T00:00:00.000Z"
}
```

Esses campos permitem relatório e desfazer lote importado.

### Competência da fatura do cartão

Lançamentos de cartão podem possuir campos explícitos de competência:

```js
{
  competencia: "2026-08",
  faturaCompetencia: "2026-08"
}
```

Critérios:

- `faturaCompetencia` representa a fatura impactada.
- Em compras parceladas, representa a competência da parcela correspondente.
- Em dados antigos, quando ausente, o sistema deve usar fallback por `competencia` ou data.

### Classificação de crédito de cartão (v0.3.30.0)

Lançamentos de cartão com `tipo:"receita"` (créditos de OFX, ex.:
`TRNTYPE=CREDIT`) podem possuir:

```js
{
  creditoTipo: "estorno" // ou "parcelamento_avista" | "pagamento_fatura_anterior"
}
```

Critérios:

- Campo opcional. Ausente em dados antigos e em lançamentos que não são
  crédito de cartão (despesas comuns) — sem impacto em `signedCardAmount`
  nem em nenhum cálculo de fatura existente.
- Existe só para rastreabilidade (auditoria de por que aquele crédito
  entrou na fatura daquela competência). A competência final do
  lançamento já usa o campo `competencia` normal — não há campo adicional
  persistido para a competência de destino.
- Créditos classificados como `pagamento_fatura_anterior` na prévia de
  importação **não** geram lançamento (descartados antes de salvar); só
  `parcelamento_avista` e `estorno` chegam a ser persistidos com esse
  campo.

### Sugestão de categoria por IA (v0.3.30.0)

Novo campo opcional dentro de `params`:

```js
{
  aiCategorization: { enabled: false }
}
```

Critérios:

- Campo opcional. Dados antigos sem o campo devem ser tratados como
  `{ enabled: false }` (mesmo padrão de `autoCategoryRules`).
- Nesta versão, mesmo com `enabled:true`, nenhuma chamada real de IA é
  feita — o campo só controla a exibição de um toggle informativo em
  Parâmetros. A integração real (chamada de API, chave, provedor) fica
  para uma versão futura, quando o provedor for definido.

### Simulações

As simulações podem ser persistidas em chave própria:

```js
{
  id: "sim_001",
  description: "Compra simulada",
  cardId: "card_001",
  amount: 1200,
  installments: 6,
  purchaseDate: "2026-06-27",
  firstInvoiceCompetence: "2026-07",
  createdAt: "2026-06-27T00:00:00.000Z",
  recalculatedAt: "2026-06-27T00:00:00.000Z"
}
```

Chave sugerida/identificada:

```js
fpro_v1_simulacoes
```

A ausência da chave deve ser tratada como lista vazia.

### Relatório de importação

O relatório pode ser mantido apenas em memória após a importação ou persistido futuramente em estrutura própria. Caso seja persistido, recomenda-se:

```js
{
  id: "imp_20260627_001",
  createdAt: "2026-06-27T00:00:00.000Z",
  source: "bank_ofx",
  importedCount: 10,
  duplicatedCount: 2,
  ignoredCount: 1,
  ignoredItems: [],
  duplicatedItems: []
}
```

### Exportação TXT de despesas de cartão

A exportação TXT não altera LocalStorage. É uma operação derivada dos lançamentos existentes.


## Atualização 2026-06-27 — Backup revisado

A versão `App_backup_restauracao_revisado.jsx` reforça a estratégia de backup/restauração sem alterar de forma incompatível o LocalStorage.

### Estratégia adotada

- Manter as chaves atuais do LocalStorage.
- Não consolidar todos os dados em uma única chave nesta etapa.
- Exportar um envelope de backup com metadados.
- Exportar também snapshot bruto das chaves conhecidas do LocalStorage.
- Tratar campos ausentes com valores padrão seguros.

### Envelope de backup

Estrutura esperada:

```js
{
  app: "Finanças PRO",
  backupSchemaVersion: 1,
  exportedAt: "2026-06-27T00:00:00.000Z",
  data: {
    contas: [],
    cartoes: [],
    transacoes: [],
    categorias: [],
    pessoas: [],
    metas: [],
    params: {},
    simulacoes: [],
    importReports: []
  },
  rawLocalStorage: {
    "fpro_v1_transacoes": "[...]",
    "fpro_v1_simulacoes": "[...]"
  }
}
```

### Simulações

A restauração deve aceitar variações antigas ou intermediárias:

```js
backup.data.simulacoes
backup.data.sims
backup.data.simulations
```

Caso nenhuma exista, o sistema deve usar lista vazia.

### Metadados de importação

Os metadados de importação continuam sendo preservados principalmente dentro dos lançamentos importados:

```js
{
  importBatchId: "imp_20260627_001",
  importSource: "bank_ofx",
  importedAt: "2026-06-27T00:00:00.000Z"
}
```

A restauração não deve remover esses campos.

### Compatibilidade

- Backup antigo sem simulações deve continuar funcionando.
- Backup antigo sem regras de autocategorização deve carregar `autoCategoryRules` como lista vazia.
- Backup inválido não deve substituir dados atuais.
- Nenhuma chave atual deve ser removida automaticamente durante a restauração sem validação prévia.
