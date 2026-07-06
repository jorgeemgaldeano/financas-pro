# v0.3.27 (base) — Isolamento da fatura de cartão com operação atômica

Data: 2026-07-05
Base: v0.3.26.7 (hotfix já aplicado)
Tipo: refatoração estrutural sem mudança de comportamento

## Objetivo
Isolar a orquestração de fatura de cartão, que vivia dentro do componente
`App()`, num serviço PURO e testável, eliminando o "commit parcial" que existia
quando `setTrans` e `setFaturas` eram chamados separadamente — cada um com seu
próprio closure e sem garantia de consistência entre eles.

## O padrão de operação atômica
Cada operação de fatura agora é uma função pura que recebe o estado atual
(`{ trans, faturas, cards, contas }`) e devolve o estado COMPLETO resultante
(`{ ok, trans, faturas, meta }`) a partir de um único snapshot. O componente
React aplica os dois `setState` no mesmo ciclo:

```js
const res = closeInvoice({ trans, faturas, cards, contas }, { cardId, monthKey: selMonth, uid });
if (res.ok) { setTrans(res.trans); setFaturas(res.faturas); }
```

Antes: `setTrans(prev => ...)` e depois `setFaturas(prev => ...)`, cada um
recalculando de forma independente. Se a lógica divergisse entre os dois, ou se
algo interrompesse o fluxo, a fatura podia ficar sem pagamento (ou vice-versa).
Agora os dois arrays derivam do MESMO cálculo, aplicados juntos.

As decisões de UI (confirmar atualização, perguntar valor, alertar) ficam no
wrapper React. O serviço sinaliza quando precisa de confirmação via
`reason: "needs_confirm_update"`, e o wrapper reexecuta com
`confirmUpdateExisting: true`.

## Arquivos

### Novos
- `src/services/cardInvoiceOperations.js` — serviço puro:
  `computeCardInvoice`, `closeInvoice`, `reopenInvoice`, `addInvoiceAdjustment`,
  `assertInvoiceOpenForEntry`.
- `tests/cardInvoiceOperations.test.js` — 17 testes de caracterização (Vitest).
- `vitest.config.js` — configuração de teste.

### Alterados
- `src/App.jsx` — `fecharFaturaCartao`, `abrirFaturaCartao` e
  `adicionarAjusteFatura` viraram wrappers finos que delegam ao serviço puro.
  Saldo líquido: **−172 linhas / +67 linhas** no componente.
- `src/services/cardInvoiceService.js` — `isInvoiceClosedForNewEntries` passou a
  aceitar `todayKey` opcional (retrocompatível), tornando a guarda de fatura
  fechada testável e desacoplada do relógio.

## Comportamento preservado (verificado por teste)
- Fechar cria transação de pagamento previsto no mês de vencimento + registro de
  fatura, com todos os campos idênticos à v0.3.26.7 (dual-write valor/amount,
  contaId/accountId, competência, status, finalAmount, closureType etc.).
- Refechar atualiza o pagamento existente preservando baixas parciais (mediante
  confirmação).
- Reabrir marca a fatura como "aberta" e ressincroniza o pagamento.
- Ajuste de acréscimo entra como despesa; redução como receita; ambos entram no
  cálculo da fatura.
- Ajuste em fatura fechada é bloqueado.
- Card sem conta corrente usa o fallback "cc1" (comportamento preservado).

## Fora de escopo (intencional)
- `assertCardInvoicesOpenForEntries` (bloqueio de lançamento em fatura fechada)
  JÁ existia e funciona — não foi alterado. O novo `assertInvoiceOpenForEntry`
  é o equivalente puro, disponível para consolidação futura, mas não substituiu
  o guard inline nesta base para não mudar comportamento.
- `calcularFaturaCartao` permanece no App para a renderização dos cartões
  (o serviço expõe `computeCardInvoice`, que é idêntico; a unificação fica para
  um passo seguinte, opcional).
- Dual-write PT/EN (E2), migrações versionadas e `cat10` hardcoded (E6)
  permanecem planejados para a v0.3.28.

## Validação executada
- 17/17 testes de caracterização passando (via harness Node; arquivo Vitest
  incluído para rodar no seu ambiente com `npx vitest`).
- Integridade estrutural do JSX do `App.jsx` via TypeScript compiler API — 0
  erros.

## Checklist de aceite manual
- [ ] Fechar uma fatura com itens → cria pagamento previsto no mês seguinte.
- [ ] Refechar após uma baixa parcial → confirma e preserva a baixa.
- [ ] Reabrir → status volta para "aberta", pagamento ressincronizado.
- [ ] Ajuste de acréscimo e redução refletem no total da fatura.
- [ ] Tentar ajuste em fatura fechada → bloqueado com aviso.
- [ ] Comparar um mês já fechado antes/depois: valores idênticos.
