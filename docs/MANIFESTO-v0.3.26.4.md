# MANIFESTO — Finanças PRO v0.3.26.4

## Versão

v0.3.26.4

## Objetivo

Corrigir o reconhecimento de parcelas já existentes ao importar faturas subsequentes de cartão de crédito.

## Contexto

A v0.3.26.3 corrigiu a primeira carga e a reimportação do mesmo arquivo. Porém, faturas subsequentes ainda podiam ser tratadas como novo parcelamento quando o emissor alterava a data ou parte da descrição da parcela.

## Decisão técnica

Manter a regra principal do master lógico por cartão, descrição base, data da compra e valor com tolerância de R$ 0,10, mas adicionar validação complementar por competência, parcela, total de parcelas, valor aproximado e descrição compatível.

## Código

- `src/App.jsx`
- `src/services/cardInstallmentService.js`
- `src/services/cardImportService.js`

## Documentação

- `README-v0.3.26.4.md`
- `MANIFESTO-v0.3.26.4.md`
- `30-RETOMADA-2026-07-04-POS-v0.3.26.3.md`
- `31-RETOMADA-2026-07-04-POS-v0.3.26.4.md`
- `docs/02-REGRAS-DE-NEGOCIO.md`
- `docs/08-REGISTRO-DE-DECISOES.md`
- `docs/09-CHANGELOG.md`
- `docs/10-CRITERIOS-DE-ACEITE.md`

## LocalStorage

Sem impacto estrutural. Nenhuma migração necessária.

## Fora de escopo

- Fechamento de fatura.
- Pagamento previsto.
- Baixa parcial.
- Mudanças visuais.
- Alteração de parser CSV/OFX/QFX além da validação de cartão.

## Validação obrigatória

```bash
npm run build
npm run dev
```
