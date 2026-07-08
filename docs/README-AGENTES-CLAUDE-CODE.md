# README — Agentes do Claude Code — Finanças PRO

Guia de instalação e uso do pacote de subagentes + memória de projeto.

> **Nota de versão:** o Claude Code evolui. Antes de aplicar, confira a sintaxe atual de
> subagentes e de `settings.json` na doc oficial: https://docs.claude.com/en/docs/claude-code/overview
> Os campos usados aqui (`name`, `description`, `tools`, `model` no frontmatter; `permissions`
> em `settings.json`) são os estáveis, mas valem a checagem.

---

## O que vem no pacote

```
CLAUDE.md                              → memória de projeto (lida toda sessão)
36-DECISAO-AGENTES-CLAUDE-CODE.md      → registro da decisão (doc numerada)
.claude/
  settings.json                        → permissões seguras
  agents/
    guardiao-localstorage.md
    normalizador-dados.md
    arquiteto-operacoes-atomicas.md
    engenheiro-testes.md
    especialista-financas.md
    revisor-ux.md
    escriba-documentacao.md
```

---

## Instalação

1. Copie **`CLAUDE.md`** e a pasta **`.claude/`** para a **raiz do repositório** do Finanças PRO
   (mesmo nível do `package.json`).
2. Copie **`36-DECISAO-AGENTES-CLAUDE-CODE.md`** para a pasta de documentação, junto dos
   demais docs numerados.
3. Na raiz do repo, rode `claude` e confirme:
   - `/agents` lista os sete subagentes.
   - `/memory` mostra o `CLAUDE.md` carregado.
4. Versione tudo no Git (os agentes ficam junto do código — todo colaborador os herda).

---

## Como usar

**Delegação automática:** ao pedir algo, o Claude Code escolhe o agente pela `description`.
Ex.: "vou mexer no fechamento de fatura" tende a acionar `especialista-financas` e
`guardiao-localstorage`.

**Invocação explícita:** cite o agente pelo nome, ex.:
- "use o **guardiao-localstorage** para revisar esta mudança em storageKeys"
- "peça ao **engenheiro-testes** para escrever caracterização antes do refactor"
- "**escriba-documentacao**: feche a v0.3.29 no changelog e gere o roteiro Git"

**Fluxo recomendado por release:**
1. `especialista-financas` + `arquiteto-operacoes-atomicas` → análise de impacto.
2. `engenheiro-testes` → caracterização do comportamento atual.
3. Implementação.
4. `guardiao-localstorage` + `normalizador-dados` → revisão de persistência/modelo.
5. `revisor-ux` → se houve UI.
6. `escriba-documentacao` → changelog, decisão, guia e roteiro Git.

---

## Permissões (`settings.json`)

Liberados sem confirmação: `npm run test/lint/build/dev`, `npx playwright test`,
`git status/diff/log`. Bloqueados: `rm -rf`, `git push --force`, leitura de `.env`.
Ajuste conforme seus scripts reais do `package.json`.

---

## Opcional: hooks (não incluídos por segurança)

Se quiser automatizar (ex.: rodar testes após cada edição), configure *hooks* no
`.claude/settings.json` — mas valide a sintaxe atual na doc antes, para não quebrar a config.
Comece sem hooks; adicione depois que o fluxo estiver estável.

---

## Manutenção

- Ao mudar uma invariante do projeto, atualize **`CLAUDE.md`** e o agente correspondente.
- Evite criar agentes com papéis muito parecidos (competem pela delegação).
- Se um agente "não é chamado quando deveria", refine a `description` dele (é o gatilho).
