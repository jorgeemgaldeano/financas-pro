# Retomada — Finanças PRO — Pós-geração v0.3.19

Data: 2026-07-04

## Status

A versão `v0.3.19` foi gerada para validação.

```txt
v0.3.19 — Em validação
```

## Objetivo da versão

Extrair de forma conservadora o cálculo da tela **Projeções** para `src/services/projectionService.js`, mantendo comportamento funcional equivalente ao da `v0.3.18`.

## Arquivos alterados/criados

Criado:

```txt
src/services/projectionService.js
```

Alterado:

```txt
src/App.jsx
```

Documentação gerada/atualizada:

```txt
CHANGELOG-v0.3.19.md
MANIFESTO-v0.3.19.md
09-CHANGELOG.md
07-ROADMAP-E-BACKLOG.md
08-REGISTRO-DE-DECISOES.md
```

## Impacto em regra de negócio

Não há alteração intencional de regra financeira.

A regra preservada é a mesma da versão anterior:

- calcular média mensal de despesas fixas;
- calcular média mensal de despesas variáveis;
- projetar os próximos meses com base em `params.mesesProjecao`;
- exibir `fixo`, `variavel` e `value`.

## Impacto em LocalStorage

Nenhum.

Não houve alteração de chave, estrutura, formato persistido ou migração.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```

## Checklist de validação

- [ ] Aplicação abre sem tela branca.
- [ ] Versão visual aparece como `v0.3.19`.
- [ ] Aba **Projeções** abre.
- [ ] Projeção mantém valores equivalentes à `v0.3.18`.
- [ ] Alteração de `mesesProjecao` em Parâmetros reflete na tela.
- [ ] Despesa fixa impacta média fixa.
- [ ] Despesa variável impacta média variável.
- [ ] Recarregar página preserva dados.
- [ ] Backup continua funcionando.
