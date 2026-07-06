# Pacote de Atualização — Finanças PRO
## Hotfix v0.3.26.7 + Base v0.3.27 (isolamento de fatura)

>>> COMECE POR AQUI: leia `docs/GUIA-DE-ATUALIZACAO.md` <<<

## Conteúdo
- `src/` — arquivos para copiar sobre o projeto (preservando as pastas).
- `tests/` — testes Vitest da nova base de fatura.
- `vitest.config.js` — configuração de teste.
- `docs/` — guia de atualização, notas técnicas e textos de documentação.
- `diffs/` — diff de cada arquivo alterado (rastreabilidade).

## O que muda

### Hotfix v0.3.26.7 (segurança de dados e fuso)
- E7: versionamento de schema não destrutivo (migração de prefixo legado).
- E1: fuso na data/competência "de hoje" (helpers locais).
- E8: import faltante em cardInvoiceService.
- E5: uid() com crypto.randomUUID().
- L6: aviso de falha de persistência (não mais silenciosa).

### Base v0.3.27 (isolamento de fatura)
- Novo `services/cardInvoiceOperations.js`: fechar/reabrir/ajustar fatura como
  funções PURAS, com operação atômica (estado completo num único snapshot).
- `App.jsx`: os 3 handlers de fatura viraram wrappers finos (−172/+67 linhas).
- 17 testes de caracterização congelando o comportamento aprovado.
- `isInvoiceClosedForNewEntries` ganhou `todayKey` opcional (testável).

## Arquivos alterados/novos
Hotfix: App.jsx, utils/dateUtils.js, services/cardInvoiceService.js,
services/financeRepository.js, hooks/useLocalStorage.js.
v0.3.27: services/cardInvoiceOperations.js (novo), services/cardInvoiceService.js,
App.jsx, tests/cardInvoiceOperations.test.js (novo), vitest.config.js (novo).

Referência (não alterados): utils/moneyUtils.js, constants/storageKeys.js.

## Validação
- 17/17 testes de caracterização passando.
- JSX do App.jsx íntegro (TypeScript compiler API, 0 erros estruturais).
- Comportamento de fatura preservado campo a campo vs v0.3.26.6.
