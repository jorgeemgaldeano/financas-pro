# Retomada — Finanças PRO — Pós v0.3.26.6

Data prevista de retomada: 2026-07-05

## Último status

A versão `v0.3.26.6` foi aprovada.

## Estado funcional aprovado

A importação de cartão de crédito com parcelamentos está estabilizada para:

- primeira carga;
- reimportação do mesmo arquivo;
- fatura subsequente;
- tolerância de valor de R$ 0,05;
- divergência de parcelas com painel de análise manual;
- correção somente da parcela atual ou atual e futuras, conforme decisão do usuário.

## Antes de iniciar nova evolução

Executar ou confirmar os comandos Git:

```bash
git status
git add .
git commit -m "feat: aprova v0.3.26.6 com painel de divergencias de parcelamento"
git tag v0.3.26.6
git push origin develop
git push origin v0.3.26.6
git checkout main
git pull origin main
git merge develop
npm run build
git push origin main
git checkout develop
```

## Próxima versão sugerida

`v0.3.27 — Isolamento da fatura de cartão`

## Escopo recomendado para v0.3.27

### Incluir

- revisar e isolar cálculo de fatura;
- consolidar fatura aberta/fechada;
- bloquear lançamento em fatura fechada;
- permitir reabertura controlada;
- atualizar lançamento previsto ao fechar/refechar fatura.

### Não incluir

- nova alteração na importação de cartão, salvo regressão;
- mudança estrutural de LocalStorage sem migração;
- mudança visual ampla;
- preparação para backend.

## Checklist inicial da próxima rodada

- [ ] Confirmar branch atual.
- [ ] Confirmar que `main` possui v0.3.26.6.
- [ ] Confirmar que `develop` está pronta para v0.3.27.
- [ ] Rodar `npm run build` antes da primeira alteração.
- [ ] Iniciar análise de `cardInvoiceService.js` e pontos de fatura no `App.jsx`.
