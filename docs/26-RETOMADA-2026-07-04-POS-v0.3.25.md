# Retomada — Pós v0.3.25

## Status
Versão v0.3.25 gerada para validação.

## Objetivo da versão
Implementar controle interno de parcelamentos de cartão na importação de faturas.

## Problema tratado
A duplicidade persistia quando o usuário importava uma fatura futura contendo parcelas que já haviam sido criadas automaticamente em importação anterior.

## Solução aplicada
- Criado service `cardInstallmentService.js`.
- Compra parcelada passou a ser identificada por descrição base, cartão, valor da parcela e total de parcelas.
- Parcelas já previstas são desmarcadas e não são gravadas.
- Divergências são apontadas na prévia e no relatório.

## Próxima validação prioritária
1. Importar fatura com compra 01/10.
2. Confirmar geração das parcelas futuras.
3. Importar fatura futura com 02/10.
4. Confirmar que 02/10 é identificada como parcela já prevista.
5. Confirmar que novos lançamentos da fatura futura continuam importáveis.

## Próxima versão sugerida
v0.3.26 — Revisão final de fatura, pagamento previsto e baixa parcial.
