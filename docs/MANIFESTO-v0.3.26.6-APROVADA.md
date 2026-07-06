# MANIFESTO — Finanças PRO v0.3.26.6 — APROVADA

Data: 2026-07-04

## Versão

`v0.3.26.6`

## Status

Aprovada pelo usuário.

## Escopo aprovado

- Importação de cartão com compra parcelada nova.
- Reimportação do mesmo arquivo sem duplicidade.
- Fatura subsequente reconhecendo parcelas já existentes.
- Tolerância de valor de R$ 0,05.
- Painel de divergência de parcelas.
- Correção manual controlada de parcela atual ou atual e futuras.

## Arquivos de código

- `src/App.jsx`
- `src/services/cardImportService.js`
- `src/services/cardInstallmentService.js`
- `src/components/finance/CardInstallmentDivergencePanel.jsx`

## Documentação

- `docs/02-REGRAS-DE-NEGOCIO.md`
- `docs/07-ROADMAP-E-BACKLOG.md`
- `docs/08-REGISTRO-DE-DECISOES.md`
- `docs/09-CHANGELOG.md`
- `docs/10-CRITERIOS-DE-ACEITE.md`
- `34-ENCERRAMENTO-2026-07-04-v0.3.26.6-APROVADA.md`
- `35-RETOMADA-2026-07-05-POS-v0.3.26.6.md`
- `ROTEIRO-GIT-POS-v0.3.26.6.md`

## LocalStorage

Sem alteração estrutural.

## Próxima etapa

Promover para `main` e iniciar v0.3.27 em `develop`.
