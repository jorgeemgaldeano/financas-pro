# Pacote v0.3.28 (base) — Consolidação do Modelo de Dados

>>> COMECE POR AQUI: leia `docs/GUIA-DE-ATUALIZACAO-v0_3_28.md` <<<

Pré-requisito: v0.3.27 (isolamento de fatura) já aplicada.

## Conteúdo
- `src/` — TODOS os arquivos da v0.3.27 já aplicada + as mudanças da v0.3.28
  (o App.jsx aqui já inclui hotfix v0.3.26.7 + v0.3.27 + v0.3.28). Copie sobre
  o projeto preservando as pastas.
- `tests/` — 17 testes da v0.3.27 (regressão) + 16 novos testes da v0.3.28.
- `docs/` — guia de atualização, notas técnicas.
- `diffs/` — diff de cada arquivo alterado NESTA versão, contra a v0.3.27.

## O que resolve
- **E2** (dual-write PT/EN): normalizador + fonte de verdade única (PT canônico).
- **E6** (categoria hardcoded): `params.catIdPagamentoFatura`, com fallback
  validado contra a lista real de categorias.
- **E7-conteúdo**: pipeline de migração versionada formal (`migrationPipeline.js`),
  complementar à blindagem de prefixo já feita na v0.3.26.7.
- Unificação de `calcularFaturaCartao` com `computeCardInvoice` (dois cálculos
  equivalentes → um só).

## Arquivos novos
```
src/services/transactionNormalizer.js
src/services/migrationPipeline.js
src/hooks/useTransactionsStorage.js
tests/dataModel.test.js
```

## Arquivos alterados nesta versão
```
src/App.jsx                          (ver diffs/App.jsx.diff)
src/services/cardInvoiceOperations.js (ver diffs/cardInvoiceOperations.js.diff)
```

## Validação
- 16/16 testes novos passando.
- 17/17 testes da v0.3.27 — regressão limpa.
- JSX do App.jsx íntegro (TypeScript compiler API, 0 erros estruturais).
- Todos os módulos (incluindo hooks React) importam sem erro.
