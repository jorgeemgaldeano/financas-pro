# 36 — Decisão: Subagentes do Claude Code — Finanças PRO

> Registra a introdução de subagentes especializados e do arquivo de memória
> `CLAUDE.md` para direcionar o Claude Code, mapeando os papéis e regras do
> `00-MINDMAP-GOVERNANCA.md` para agentes operacionais. Estilo ADR.

---

## Contexto

O projeto passou a ser conduzido no **Claude Code**. Até então, os múltiplos papéis
(arquiteto, dev React sênior, product owner, UX, revisor, especialista em finanças) e as
regras gerais viviam apenas na documentação e eram carregados manualmente a cada sessão.

O Claude Code permite **subagentes**: assistentes especializados com system prompt próprio,
ferramentas restritas e **contexto isolado**, que podem ser delegados automaticamente
conforme a tarefa. Isso reduz ruído de contexto e aplica as regras de forma consistente.

## Decisão

Adotar:

1. **`CLAUDE.md`** na raiz — memória de projeto lida em toda sessão; versão operacional do
   mindmap de governança (idioma, regras inegociáveis, estrutura de pastas, invariantes
   técnicas, convenções de teste e documentação, fluxo de trabalho).
2. **Sete subagentes** em `.claude/agents/`:
   - `guardiao-localstorage` — risco de perda de dados e migração (o mais crítico).
   - `normalizador-dados` — PT canônico, sem drift/dual-write.
   - `arquiteto-operacoes-atomicas` — atomicidade de estado e modularização.
   - `engenheiro-testes` — caracterização antes de refactor, pirâmide + CI.
   - `especialista-financas` — regras RN###.
   - `revisor-ux` — consistência visual e cliques.
   - `escriba-documentacao` — changelog, decisões, docs numeradas, roteiro Git.
3. **`.claude/settings.json`** — permissões seguras (testes/lint/build liberados;
   `rm -rf`, `push --force` e leitura de `.env` negados).

Os agentes de revisão são **somente leitura** (`Read, Grep, Glob`); apenas
`engenheiro-testes` e `escriba-documentacao` podem escrever, por natureza da função.

## Justificativa

- Cada agente carrega só o contexto do seu domínio → menos ruído, mais precisão.
- As invariantes que já custaram bugs (prefixo de chave, cota silenciosa, dual-write PT/EN,
  fuso em datas, commit parcial) viram **checklists automáticos** em vez de memória frágil.
- A delegação por `description` aproxima o fluxo do padrão de escalonamento já usado:
  análise → proposta → implementação → empacotamento.

## Consequências

- **Positivas:** consistência das regras, menor risco de regressão em persistência,
  documentação sempre atualizada, revisão especializada barata.
- **Custos:** manter os prompts dos agentes sincronizados com a evolução do projeto;
  evitar sobreposição de papéis que gere indecisão de delegação.
- **Não altera** código de aplicação nem dados — mudança puramente de tooling/governança.

## Itens em aberto

- Avaliar agente opcional `otimizador-react` (hoje coberto pelo arquiteto).
- Avaliar *hooks* do Claude Code para rodar testes automaticamente após edições.
- Sincronizar este registro também no `08-REGISTRO-DE-DECISOES.md`.
