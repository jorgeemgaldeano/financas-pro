# Retomada — Finanças PRO — Pós v0.3.26.6

Data: 2026-07-04

## Status

Versão gerada para corrigir os testes reprovados da v0.3.26.5 relacionados à divergência de parcela.

## Testes aprovados preservados da v0.3.26.5

- Primeira carga.
- Reimportação do mesmo arquivo.
- Fatura subsequente sem divergência.
- Tolerância de valor em R$ 0,05.

## Problema tratado

A v0.3.26.5 detectava divergência entre a parcela do sistema e a parcela informada pelo arquivo, porém a ação de correção não oferecia análise manual suficiente e podia produzir comportamento indesejado.

## Solução aplicada

- Criado `CardInstallmentDivergencePanel.jsx`.
- Removida a correção direta dentro da linha da tabela.
- Adicionado painel no final da revisão da importação.
- O painel mostra as parcelas que podem ser impactadas.
- O usuário escolhe entre manter, alterar somente a atual ou alterar atual e futuras.
- A correção não cria parcela final automaticamente.

## Próxima validação prioritária

1. Simular divergência: sistema com 03/10 na competência e arquivo com 02/10.
2. Confirmar que aparece no painel.
3. Confirmar que nada muda automaticamente.
4. Testar Manter como está.
5. Testar Alterar somente parcela atual.
6. Testar Alterar atual e futuras.
7. Confirmar que nenhuma nova última parcela é criada automaticamente.
