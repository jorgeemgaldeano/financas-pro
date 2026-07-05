# Changelog — Finanças PRO v0.3.24

Data: 2026-07-04

## Objetivo

Corrigir a validação de duplicidade nas importações de extrato bancário e fatura/cartão de crédito.

## Corrigido

- A importação bancária passa a validar duplicidade por destino, data, descrição normalizada, valor e tipo.
- A importação de cartão/fatura passa a validar duplicidade por cartão, data, descrição normalizada, valor e tipo.
- A validação ocorre na prévia da importação e é reexecutada no momento de salvar, evitando duplicidade caso o estado tenha sido alterado entre a leitura do arquivo e a confirmação.
- Linhas duplicadas são desmarcadas por padrão e entram no relatório como duplicadas.

## Alterado

- `src/App.jsx` recebeu helpers locais conservadores para chave estrita de duplicidade de importação.
- A versão visual foi atualizada para `v0.3.24`.

## Regras preservadas

- Não houve alteração no parser de arquivos.
- Não houve alteração na regra de fatura fechada.
- Não houve alteração na regra de categorização.
- Não houve alteração na importação de vales além da proteção conservadora de duplicidade por chave estrita quando aplicável.

## Impacto em LocalStorage

- Sem nova chave.
- Sem alteração de estrutura.
- Sem migração.
- Sem alteração de backup.
- Nenhum dado existente é apagado ou transformado automaticamente.

## Testes recomendados

1. Importar extrato bancário uma vez e salvar.
2. Importar o mesmo extrato novamente.
3. Confirmar que os registros iguais aparecem como duplicados/desmarcados.
4. Importar fatura/cartão uma vez e salvar.
5. Importar a mesma fatura/cartão novamente.
6. Confirmar que registros iguais por data, descrição e valor não são carregados.
7. Importar uma próxima fatura com lançamentos realmente novos.
8. Confirmar que apenas registros novos são selecionados.
9. Executar `npm run build`.
10. Executar `npm run preview`.
