# v0.3.28 (base) — Consolidação do Modelo de Dados

Data: 2026-07-05
Base: v0.3.27 (isolamento de fatura já aplicado)
Tipo: refatoração estrutural sem mudança de comportamento visível ao usuário

## Objetivo
Fechar estruturalmente o achado **E2** (dual-write PT/EN sem fonte de verdade
única) e o **E6** (categoria de fatura hardcoded), e formalizar o pipeline de
migrações versionadas anunciado desde a v0.3.26.7 (E7).

## Auditoria que embasou as decisões
Antes de codificar, foi feita uma auditoria de uso real dos campos duplicados
no `App.jsx` e nos serviços (`projectionService.js`, `importService.js`,
`cardImportService.js`, `cardInstallmentService.js`):

- Os campos em **português** (`valor`, `contaId`, `cartaoId`, `competencia`,
  `valorPago`) são o par dominante — usados na grande maioria das leituras.
- Os campos em **inglês** já são tratados como alias em vários pontos mais
  recentes (`projectionService.js` já lê com fallback bidirecional:
  `t.contaId || t.accountId`), mas **não em todos** — `movimentoContaMes`
  (cálculo de saldo de conta) filtra só por `contaId`, sem fallback. Esse era
  o vetor de bug ativo do E2.

**Decisão de campo canônico: português.** Os campos em inglês continuam
existindo e sendo gravados (Regra Geral: não remover, não alterar
LocalStorage sem migração) — mas agora são garantidos consistentes com o
canônico por normalização na fronteira, em vez de depender de cada ponto de
leitura lembrar de fazer o fallback corretamente.

## Arquivos novos

### `src/services/transactionNormalizer.js`
Normalizador puro. `normalizeTransaction(t)` garante que cada par
(`valor`/`amount`, `contaId`/`accountId` etc.) fique consistente; em conflito,
o canônico (PT) vence. Preserva identidade referencial de objetos já
consistentes (não invalida `useMemo` sem necessidade).

### `src/services/migrationPipeline.js`
Pipeline de migrações versionadas para o conteúdo de `trans`. Formaliza como
uma lista de passos nomeados (`{ version, description, run }`), em vez de
`useEffect`s soltos. O primeiro passo (`version: 1`) é justamente a
normalização dual-write. Passos futuros (v0.3.29+) entram na mesma lista, sem
tocar no restante do pipeline.

> Nota: isto é uma migração de **conteúdo** dentro de uma chave já lida —
> complementar e independente da blindagem de **prefixo** de chave (E7),
> resolvida em `financeRepository.js` na v0.3.26.7. São duas camadas de
> proteção diferentes.

### `src/hooks/useTransactionsStorage.js`
Substituto pontual de `useLS("trans", ...)`. Aplica a migração/normalização na
leitura, antes do primeiro render útil. Padrão usado: ajuste de estado durante
a renderização (documentado pelo React para casos de dados derivados) —
idempotente, dispara nova renderização só quando algo precisa de correção.

## Arquivos alterados

- **`App.jsx`**:
  - `trans`/`setTrans` agora vem de `useTransactionsStorage` (era `useLS`
    direto).
  - `calcularFaturaCartao` passou a delegar para `computeCardInvoice` do
    serviço puro (elimina o cálculo duplicado apontado no doc 36).
  - `INIT_PARAMS` ganhou `catIdPagamentoFatura: "cat10"`.
  - `fecharFaturaCartao` e `adicionarAjusteFatura` passam a resolver e
    injetar `catId` via `resolveInvoiceCategoryId(cats, params.catIdPagamentoFatura)`.

- **`services/cardInvoiceOperations.js`**:
  - `closeInvoice` aceita `opts.catId` (default `"cat10"`, mesmo
    comportamento de antes se nada for passado).
  - Novo helper puro `resolveInvoiceCategoryId(cats, configuredCatId)` — valida
    a categoria configurada contra a lista real; cai para `"cat10"` se a
    categoria configurada não existir (foi excluída).

## Comportamento preservado (verificado por teste)
- Sem configuração explícita, tudo se comporta como na v0.3.27 (`cat10`).
- Transações já consistentes no LocalStorage não são regravadas (nenhuma
  reescrita desnecessária, nenhum "churn" de dados).
- `computeCardInvoice` produz exatamente o mesmo resultado que o antigo
  `calcularFaturaCartao` (já validado na suíte da v0.3.27, que continua
  passando integralmente).

## Fora de escopo (intencional, para v0.3.29+)
- Integridade referencial em exclusões (E3/L5).
- ConfirmDialog / toast com undo (substituição de alert/confirm/prompt).
- Complexidade quadrática do cálculo de saldo (E4).

## Validação executada
- 16 novos testes de caracterização (normalizador, pipeline, resolução de
  categoria) — todos passando.
- 17 testes da suíte da v0.3.27 — regressão limpa, todos passando.
- Integridade estrutural do JSX do `App.jsx` (TypeScript compiler API) — 0 erros.
- Todos os módulos (incluindo o novo hook React) importam sem erro.

## Checklist de aceite manual
- [ ] Fechar/reabrir/ajustar fatura — comportamento idêntico à v0.3.27.
- [ ] Em Parâmetros, não deve haver campo visível ainda para
      `catIdPagamentoFatura` nesta base (é interno; a UI de configuração é
      uma melhoria de produto separada, se desejada depois).
- [ ] Abrir o app com dados antigos (de antes da v0.3.26) e confirmar que o
      saldo das contas continua correto (teste do E2 no mundo real).
- [ ] Excluir a categoria configurada em `catIdPagamentoFatura` (se algum dia
      for exposta na UI) e confirmar que novos pagamentos caem em "Outros"
      em vez de nascerem órfãos.
