# Retomada — Finanças PRO — Pós-aprovação v0.3.17.4

Data: 2026-07-04

## Status atualizado

A versão `v0.3.17.4` foi aprovada pelo usuário.

```txt
v0.3.17.4 — APROVADA
```

## Correções estabilizadas

- Tela branca da `v0.3.17` corrigida.
- Erro `getSimulationInstallmentValue is not defined` corrigido.
- Erro `safeMoneyAmount is not defined` corrigido.
- Inclusão de simulação validada.
- Tela **Simulações** considerada estável para continuidade da evolução.

## Impacto em LocalStorage

Não houve alteração de chave, estrutura, formato persistido ou migração.

## Impacto em regra de negócio

Não houve alteração de regra financeira.

## Decisão de sequência

Após registrar a aprovação da `v0.3.17.4`, a próxima evolução será a opção B:

```txt
v0.3.18 — Início da camada local de repository/storage
```

## Diretriz para v0.3.18

A `v0.3.18` deve ser uma refatoração técnica conservadora.

Regras obrigatórias:

- Não alterar comportamento funcional.
- Não alterar modelo de LocalStorage.
- Não criar migração.
- Não substituir LocalStorage por API.
- Criar camada intermediária para preparar futura troca de persistência.
- Manter `useLS` compatível com o uso atual do `App.jsx`.

## Escopo inicial aprovado para v0.3.18

- Criar `src/services/financeRepository.js`.
- Atualizar `src/hooks/useLocalStorage.js` para usar o repository local.
- Manter a mesma assinatura de `useLS`, `lsGet` e `lsSave`.
- Atualizar versão visual para `v0.3.18`.

## Checklist de validação da v0.3.18

- [ ] Aplicação abre sem tela branca.
- [ ] Dados antigos carregam normalmente.
- [ ] Novo lançamento persiste após recarregar.
- [ ] Nova simulação persiste após recarregar.
- [ ] Backup continua exportando os dados esperados.
- [ ] Apagar dados financeiros continua funcionando.
- [ ] `npm run build` aprovado.
- [ ] `npm run preview` aprovado.
