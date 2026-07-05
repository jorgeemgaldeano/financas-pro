# Finanças PRO v0.3.26.3

## Objetivo

Corrigir a prévia e a confirmação da importação de cartão para que parcelas futuras geradas automaticamente a partir de uma compra parcelada nova não sejam marcadas como duplicadas entre si.

## Causa corrigida

Na v0.3.26.2, a regra de duplicidade ainda aplicava, para compras parceladas, uma chave estrita baseada em cartão, data da compra, descrição base e valor. Como todas as parcelas futuras geradas a partir do mesmo master compartilham esses dados, as parcelas 2/N, 3/N e seguintes eram marcadas como duplicadas na prévia.

## Solução

Para compras parceladas, a duplicidade passa a usar apenas a chave específica de parcelamento:

```txt
master lógico + parcela + total de parcelas
```

Para compras à vista, permanece a regra anterior:

```txt
cartão + data + descrição + valor
```

## LocalStorage

Sem nova chave, sem migração e sem alteração estrutural.

## Arquivos alterados

- `src/App.jsx`
- `src/services/cardImportService.js`
- `docs/02-REGRAS-DE-NEGOCIO.md`
- `docs/08-REGISTRO-DE-DECISOES.md`
- `docs/09-CHANGELOG.md`
- `docs/10-CRITERIOS-DE-ACEITE.md`
- `MANIFESTO-v0.3.26.3.md`
- `30-RETOMADA-2026-07-04-POS-v0.3.26.3.md`

## Teste prioritário

1. Usar cartão sem lançamentos.
2. Importar compra parcelada nova 1/10.
3. Confirmar que as parcelas 1/10 até 10/10 aparecem selecionadas na prévia.
4. Confirmar a importação.
5. Validar que todas as competências futuras foram salvas.
