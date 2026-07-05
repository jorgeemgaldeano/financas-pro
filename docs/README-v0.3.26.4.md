# Finanças PRO v0.3.26.4

## Objetivo

Corrigir a importação de fatura subsequente de cartão quando as parcelas futuras já foram criadas na primeira carga, mas o arquivo da nova fatura altera a data ou a descrição apresentada pelo emissor.

## Defeito corrigido

Na v0.3.26.3, a primeira carga voltou a gerar corretamente a parcela atual e as futuras. A reimportação do mesmo arquivo também foi bloqueada corretamente. Porém, ao importar a fatura do mês seguinte, o sistema ainda tratava parcelas já existentes como novo parcelamento quando o arquivo trazia pequenas variações, por exemplo:

- descrição com ou sem prefixo `#PCV`;
- descrição com localidade diferente, como `SAO PAUBR` versus `PAULO`;
- data da linha diferente da data preservada na primeira carga.

## Solução

A validação mantém a regra principal:

```txt
cartão + descrição base + data da compra + valor da parcela com tolerância de R$ 0,10
```

E adiciona uma regra complementar conservadora para faturas subsequentes:

```txt
cartão + competência + número da parcela + total de parcelas + valor aproximado + descrição compatível
```

Assim, uma parcela 2/10 já existente em 2026-07 é reconhecida mesmo que o arquivo da fatura seguinte apresente uma data diferente ou uma descrição com pequenas variações.

## Arquivos alterados

- `src/App.jsx`
- `src/services/cardInstallmentService.js`
- `src/services/cardImportService.js`
- `docs/02-REGRAS-DE-NEGOCIO.md`
- `docs/08-REGISTRO-DE-DECISOES.md`
- `docs/09-CHANGELOG.md`
- `docs/10-CRITERIOS-DE-ACEITE.md`

## LocalStorage

Sem alteração estrutural.

- Sem nova chave.
- Sem migração.
- Sem remoção de dados.
- Sem sobrescrita automática.

## Validação obrigatória

```bash
npm run build
npm run dev
```

## Teste prioritário

1. Limpar dados ou usar cartão sem lançamentos.
2. Importar fatura com compra parcelada 01/10.
3. Confirmar criação da parcela atual e futuras.
4. Reimportar o mesmo arquivo e confirmar bloqueio de duplicidade.
5. Importar fatura subsequente com 02/10.
6. Confirmar que 02/10 é marcada como já existente, não como novo parcelamento.
7. Confirmar que novos lançamentos da fatura subsequente continuam selecionados.
