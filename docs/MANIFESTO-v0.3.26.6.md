# MANIFESTO — Finanças PRO v0.3.26.6

## Versão

v0.3.26.6

## Objetivo

Corrigir a experiência e a regra de negócio para divergências de parcelamento identificadas na importação de cartão.

## Contexto

Na v0.3.26.5, a divergência era detectada, mas a ação de correção tentava resolver automaticamente a sequência, podendo gerar comportamento incorreto, como aparente criação de nova última parcela ou ausência de alteração esperada.

## Decisão

A divergência de parcela deixa de ser corrigida automaticamente na linha da tabela e passa a ser exibida em painel próprio para análise manual.

O usuário poderá escolher:

1. manter como está;
2. alterar somente a parcela da competência atual;
3. alterar a parcela atual e as subsequentes.

## Arquivos principais

- `src/App.jsx`
- `src/services/cardInstallmentService.js`
- `src/services/cardImportService.js`
- `src/components/finance/CardInstallmentDivergencePanel.jsx`

## Documentação

- `docs/02-REGRAS-DE-NEGOCIO.md`
- `docs/07-ROADMAP-E-BACKLOG.md`
- `docs/08-REGISTRO-DE-DECISOES.md`
- `docs/09-CHANGELOG.md`
- `docs/10-CRITERIOS-DE-ACEITE.md`
- `README-v0.3.26.6.md`
- `33-RETOMADA-2026-07-04-POS-v0.3.26.6.md`

## LocalStorage

Sem nova chave, sem migração e sem alteração estrutural.

## Validação

Executar:

```bash
npm run build
npm run dev
```
