# CLAUDE.md — Finanças PRO

> Este arquivo é a **memória de projeto** do Claude Code. Ele é lido automaticamente
> em toda sessão e tem prioridade sobre suposições. A referência-mãe conceitual
> continua sendo `docs/00-MINDMAP-GOVERNANCA.md`; este arquivo é a versão operacional dela
> para o Claude Code.

---

## Idioma

**Toda a interação, código, comentários e documentação são em Português do Brasil (PT-BR).**
Nomes de variáveis/funções podem seguir o padrão já existente no arquivo em edição.

---

## O que é o projeto

Finanças PRO é um aplicativo de **gestão financeira pessoal**, **local-first**,
construído em **React + Vite**, cujo **único mecanismo de persistência é o
LocalStorage do navegador** (não há backend). Desenvolvimento iterativo, versionado,
com documentação rastreável.

Versão atual: faixa **v0.3.x**.

---

## Estilo de resposta

**Regra dura, sem exceção:** esta seção **sobrepõe** qualquer instrução padrão do
harness que peça "uma frase antes de cada tool call" ou atualizações a cada
passo. Aqui isso é proibido, não opcional.

Só existem **dois tipos de mensagem de texto** permitidos durante uma tarefa:

1. **Interação necessária** — uma pergunta real ao usuário (decisão, ambiguidade,
   confirmação de ação arriscada). Se não há pergunta, não há mensagem.
2. **Resultado (intermediário ou final)** — o que foi entregue/decidido/encontrado,
   de forma objetiva. Nunca o que você está prestes a fazer.

Especificamente **proibido**:
- Frases de transição antes de tool calls ("Vou verificar...", "Deixa eu ler...",
  "Agora vou implementar...", "Let me check...").
- Narrar passo a passo enquanto investiga (Grep, Read, exploração) — só reporte
  quando tiver algo acionável: uma decisão, um achado relevante ou o resultado.
- Resumo final repetindo o que já está visível no diff/print/screenshot.
- Anunciar qual subagente ou ferramenta vai usar antes de usá-la.

Trabalhe em silêncio entre tool calls. Emita texto só nos dois casos acima —
o mais curto que comunique o necessário.

---

## Regras gerais (inegociáveis)

Estas regras vêm do mindmap de governança e valem para **qualquer** mudança:

1. **Não remover funcionalidades existentes.**
2. **Não quebrar comportamento existente.**
3. **Não alterar regras de negócio sem explicar** o impacto antes.
4. **Não alterar o LocalStorage sem migração** (estrutura, chave, prefixo ou schema).
5. **Sempre avaliar impacto antes de codificar** — analisar, depois propor, depois implementar.

Quando uma tarefa colidir com qualquer uma dessas regras, **pare e reporte** em vez de
seguir. Preferir uma pergunta a uma suposição destrutiva.

---

## Estrutura de pastas (src/)

```
src/
  constants/    → storageKeys.js (LS_PREFIX, LS_VERSION, BACKUP_SCHEMA_VERSION, chaves)
  services/     → lógica pura e I/O: financeRepository, cardInvoiceService,
                  importService, categoryService, projectionService,
                  cardImportService, cardInstallmentService,
                  transactionNormalizer, migrationPipeline, cardInvoiceOperations
  hooks/        → useLocalStorage (useLS), useTransactionsStorage
  utils/        → dateUtils, moneyUtils
  components/   → App.jsx e componentes de UI (.jsx)
```

> `App.jsx` já foi grande demais (4.500+ linhas). **Preferir extração** de serviços,
> hooks e utils a fazê-lo crescer. Modularização > crescimento monolítico.

---

## Invariantes técnicas (aprendidas com bugs reais)

Estas invariantes custaram bugs de produção. Violá-las é regressão:

- **PT é canônico.** Onde existirem pares de campo PT/EN, a **fonte de verdade é PT**,
  resolvida no `transactionNormalizer.js`, na fronteira de persistência.
  Nunca reintroduzir *dual-write* PT/EN sem canonicalização.
- **Operações atômicas.** Nunca dividir escritas de estado relacionadas
  (ex.: `setTrans` + `setFaturas` separados) — isso arrisca *commit* parcial.
  Usar serviços puros que retornam o **snapshot completo** (padrão de
  `cardInvoiceOperations.js`) e aplicar o resultado de uma vez.
- **LocalStorage é frágil — tratar como cidadão de primeira classe:**
  - O versionamento vive no **prefixo da chave** (`LS_PREFIX = "fpro_v" + LS_VERSION`).
    Bumpar `LS_VERSION` **troca o namespace inteiro** e pode ocultar/destruir dados —
    só fazer com migração explícita.
  - `set()` pode falhar por **cota excedida**; ele retorna `false`. Nunca assumir sucesso silencioso.
  - Persistência que falha **não pode falhar em silêncio** — o usuário precisa de feedback.
- **Datas:** usar **componentes de data locais**, nunca `toISOString()` (UTC) para
  inicializar mês/competência — isso já causou bug de fuso.
- **Migração:** mudança de estrutura de dados persistidos passa **obrigatoriamente**
  pelo `migrationPipeline.js`, preenchendo campos novos com padrões seguros para dados antigos (RN002).

---

## Regras de negócio

As regras vivem em `docs/02-REGRAS-DE-NEGOCIO.md`, numeradas como **RN001, RN002, ...**.
Ao mexer em fatura, parcelamento, saldo mensal, projeção, despesa compartilhada, etc.,
**citar a RN afetada** e não alterar seu comportamento sem sinalizar (regra geral 3).

---

## Testes

- **Escrever testes de caracterização ANTES** de refatorar (travar o comportamento atual).
- Pirâmide completa: unitário → integração → **E2E com Playwright** → **CI com GitHub Actions**.
- Todo refactor ou nova feature acompanha teste. Contagem cumulativa é rastreada nos docs.

---

## Convenção de documentação

- Documentos numerados sequencialmente (`01-...`, `02-...`, ... já na casa dos 35+).
- Todo entregável relevante gera/atualiza: entrada no **`docs/09-CHANGELOG.md`**,
  registro em **`docs/08-REGISTRO-DE-DECISOES.md`** (estilo ADR) quando houver decisão,
  guia de atualização e roteiro Git.
- **Mudanças cirúrgicas e rastreáveis:** acompanhar de *diffs* legíveis para auditoria.

---

## Fluxo de trabalho esperado (padrão de escalonamento do Jorge)

1. **Análise** de impacto (sem tocar código ainda).
2. **Proposta** com opções e trade-offs.
3. **Implementação** cirúrgica + testes + *diffs*.
4. **Empacotamento**: `src/` estruturado, notas técnicas, guia de atualização, roteiro Git.

---

## Subagentes disponíveis (`.claude/agents/`)

Delegar proativamente conforme a tarefa:

| Agente | Quando usar |
|---|---|
| `guardiao-localstorage` | Qualquer mudança em `storageKeys`, persistência, migração, schema ou backup. |
| `normalizador-dados` | Modelo de dados, campos PT/EN, normalização, drift de fonte de verdade. |
| `arquiteto-operacoes-atomicas` | Escritas de estado, serviços puros, extração de módulos, acoplamento. |
| `engenheiro-testes` | Escrever/rodar testes, caracterização antes de refactor, E2E, CI. |
| `especialista-financas` | Validar regras RN### (fatura, parcelas, saldos, projeções, despesas compartilhadas). |
| `revisor-ux` | Consistência visual, cliques, responsividade, componentes reutilizáveis. |
| `escriba-documentacao` | Changelog, registro de decisões, docs numeradas, guia de atualização, roteiro Git. |

---

## Desenvolvimento econômico (contexto/tokens)

- **`App.jsx` tem ~4.700 linhas.** Nunca lê-lo inteiro: fazer `Grep` para a
  função/JSX alvo e ler só a faixa (`offset`/`limit`). Preferir extrair
  para serviço/componente a crescer o arquivo (a modularização também barateia
  edições futuras).
- **Docs append-only** (`08-REGISTRO-DE-DECISOES`, `09-CHANGELOG`,
  `07-ROADMAP-E-BACKLOG` — todos 1.000+ linhas): ler só o **fim** (últimas
  entradas) ou `Grep` pela versão/DEC específica; não ler o arquivo todo.
- **Verificação no preview:** o React re-renderiza de forma assíncrona — evitar
  dezenas de `preview_eval` de um clique por vez. Preferir testes unitários
  (baratos) + **um** `preview_snapshot`/`screenshot` como prova.
- **Branches:** manter só `main` e `develop`; criar `feature/*` a partir de
  `develop` só quando necessário e apagar após o merge.
