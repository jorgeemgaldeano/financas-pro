# Finanças PRO v0.3.26.6

## Objetivo

Corrigir o tratamento de divergências de parcelas na importação de cartão de crédito sem alterar automaticamente lançamentos já gravados.

## Correção principal

A divergência de parcelamento passa a ser tratada em painel próprio no final da revisão da importação.

Quando o arquivo importado informa uma parcela diferente da prevista no sistema para a mesma competência, o sistema deve:

1. bloquear a importação automática da linha divergente;
2. listar a divergência em painel de análise manual;
3. mostrar as parcelas que podem ser impactadas;
4. permitir uma das ações:
   - manter como está;
   - alterar somente a parcela da competência atual;
   - alterar a parcela atual e as subsequentes.

## Arquivos alterados

- `src/App.jsx`
- `src/services/cardInstallmentService.js`
- `src/services/cardImportService.js`
- `src/components/finance/CardInstallmentDivergencePanel.jsx`
- `docs/02-REGRAS-DE-NEGOCIO.md`
- `docs/07-ROADMAP-E-BACKLOG.md`
- `docs/08-REGISTRO-DE-DECISOES.md`
- `docs/09-CHANGELOG.md`
- `docs/10-CRITERIOS-DE-ACEITE.md`

## LocalStorage

Sem alteração estrutural.

Apenas quando o usuário confirmar uma ação manual, lançamentos já existentes podem receber ou atualizar campos opcionais:

- `parcela`
- `totalParcelas`
- `descricao`
- `ajusteParcelamentoManual`
- `ajusteParcelamentoManualEm`
- `ajusteParcelamentoManualModo`
- `ajusteParcelamentoManualMotivo`

## Validação obrigatória

```bash
npm run build
npm run dev
```

## Teste prioritário

1. Primeira carga de fatura com parcelamento novo.
2. Reimportação do mesmo arquivo.
3. Importação de fatura subsequente sem divergência.
4. Importação de fatura subsequente com divergência de parcela.
5. Validar painel de divergências.
6. Testar as três ações: manter, alterar somente atual, alterar atual e futuras.
