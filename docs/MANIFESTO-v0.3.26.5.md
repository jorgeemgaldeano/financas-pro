# MANIFESTO — Finanças PRO v0.3.26.5

## Versão

v0.3.26.5

## Objetivo

Corrigir a importação de cartão para reduzir a tolerância de valor e tratar divergências de numeração de parcelas causadas pela administradora do cartão.

## Escopo

- Redução da margem de comparação de valor para R$ 0,05.
- Identificação de divergência de parcela em parcelamento já existente.
- Bloqueio da importação automática em divergências.
- Ação manual para corrigir parcela atual e subsequentes do mesmo grupo.

## Fora do escopo

- Fechamento de fatura.
- Pagamento previsto da fatura.
- Baixa parcial de fatura.
- Nova estrutura de LocalStorage.
- Criação de entidade persistida separada para master de parcelamento.

## Arquivos principais

- `src/App.jsx`
- `src/services/cardInstallmentService.js`
- `src/services/cardImportService.js`

## Documentação

- `docs/02-REGRAS-DE-NEGOCIO.md`
- `docs/08-REGISTRO-DE-DECISOES.md`
- `docs/09-CHANGELOG.md`
- `docs/10-CRITERIOS-DE-ACEITE.md`
- `README-v0.3.26.5.md`
- `32-RETOMADA-2026-07-04-POS-v0.3.26.5.md`

## Compatibilidade

Compatível com dados existentes. Sem migração obrigatória.
