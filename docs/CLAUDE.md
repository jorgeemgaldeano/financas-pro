# CLAUDE.md — Finanças PRO

Este arquivo é lido automaticamente pelo Claude Code no início de cada sessão.
Ele resume a governança do projeto. Os documentos numerados na raiz (`00` a
`10+`) são a fonte completa — consulte-os quando precisar de detalhe que não
está aqui, especialmente antes de decisões de arquitetura, modelo de dados ou
produto.

Todo o projeto é conduzido em **português do Brasil**: comentários, commits,
nomes de branch quando fizer sentido, e toda a comunicação com o usuário.

---

## 1. O que é o projeto

Finanças PRO é um aplicativo de gestão financeira pessoal:

- **Stack**: React + Vite, sem backend — persistência 100% em `LocalStorage`
  do navegador.
- **Desenvolvedor**: Jorge, sozinho, atuando como product owner. O Claude
  Code atua como arquiteto de software, dev React sênior, revisor de código,
  UX designer e especialista em finanças pessoais — todos os papéis ao
  mesmo tempo (ver `00-MINDMAP-GOVERNANCA.md`).
- **Versão atual da base de código**: linha `v0.3.28` (consolidação do
  modelo de dados). Backlog planejado até `v0.3.33+` em
  `07-ROADMAP-E-BACKLOG.md`.

### Funcionalidades existentes (não remover sem decisão explícita)
Dashboard, Lançamentos, Cartões, Contas, Categorias hierárquicas, Metas,
Projeções, Simulações, Importação OFX/CSV, Backup e restauração, Parâmetros,
Pessoas, Dívidas, Despesas compartilhadas.

---

## 2. Regras não negociáveis

Estas regras vêm de `00-MINDMAP-GOVERNANCA.md` e de decisões já tomadas
(`08-REGISTRO-DE-DECISOES.md`) depois de bugs reais em produção. Não violar
sem alinhar com o Jorge antes:

1. **Não remover funcionalidade existente.**
2. **Não quebrar comportamento existente** sem justificar e documentar.
3. **Não alterar LocalStorage sem migração** — nunca mude o formato de uma
   chave persistida sem passar pelo `migrationPipeline.js` e sem atualizar
   `04-MODELO-DE-DADOS-E-LOCALSTORAGE.md`.
4. **PT é o campo canônico.** O modelo tem pares PT/EN (`valor`/`amount`,
   etc.) por herança histórica. Em caso de conflito, o valor em português
   vence. A normalização acontece em `transactionNormalizer.js`.
5. **Reutilizar antes de criar** (DEC-0009): antes de qualquer código novo,
   verificar (a) se já existe solução no projeto, (b) se React nativo
   resolve, (c) se há biblioteca compatível já em uso, e só então (d)
   escrever código próprio. Não adicionar Redux/Zustand ou dependências
   pesadas sem justificativa explícita.
6. **Sempre avaliar o impacto antes de codificar** — em especial impacto em
   LocalStorage e em regra de negócio financeira.
7. **Operações de estado devem ser atômicas.** Não fazer múltiplos
   `setState`/gravações separadas quando uma operação lógica única está em
   jogo (motivo da criação de `cardInvoiceOperations.js` — evita commits
   parciais).

---

## 3. Estrutura do projeto

O `App.jsx` já foi grande (chegou a 4.500+ linhas) e está em modularização
incremental e de baixo risco — ver `03-ARQUITETURA-E-MODULARIZACAO.md` para
o plano de fases completo. Estado atual dos módulos já extraídos:

```
src/
  App.jsx                        # ainda concentra bastante lógica; extração incremental em andamento
  main.jsx
  styles.css

  constants/
    storageKeys.js                # LS_VERSION, LS_PREFIX, BACKUP_SCHEMA_VERSION, BACKUP_STORAGE_KEYS

  services/
    financeRepository.js
    cardInvoiceService.js
    cardInvoiceOperations.js      # operações atômicas de fatura (v0.3.27)
    cardImportService.js
    cardInstallmentService.js
    importService.js
    categoryService.js
    projectionService.js
    transactionNormalizer.js      # canonicalização PT/EN (v0.3.28)
    migrationPipeline.js          # pipeline formal de migração (v0.3.28)

  hooks/
    useLocalStorage.js
    useTransactionsStorage.js     # (v0.3.28)

  utils/
    dateUtils.js
    moneyUtils.js

  components/
    CashFlowChart.jsx
    TransactionFiltersPanel.jsx
    CardInstallmentDivergencePanel.jsx
    DateInput.jsx
    RequiredFieldModal.jsx

tests/
    cardInvoiceOperations.test.js  # 17 testes (v0.3.27)
    dataModel.test.js              # 16 testes (v0.3.28)
```

Extrações candidatas para as próximas versões (ver
`03-ARQUITETURA-E-MODULARIZACAO.md`, seção "Pontos candidatos à próxima
extração"): `simulationService.js`, `peopleSharedService.js`,
`backupService.js` dedicado. Só extrair `backupService.js` depois que a
regra atual de backup/restauração estiver validada manualmente.

Ao criar componente novo: nome claro, responsabilidade única, props
explícitas, sem acesso direto a LocalStorage (salvo hook técnico), sem
cálculo financeiro complexo dentro do JSX.

---

## 4. Modelo de dados e LocalStorage

Chaves de LocalStorage (prefixadas por `LS_PREFIX = "fpro_v" + LS_VERSION +
"_"`, hoje `LS_VERSION = 1`):

```
trans, contas, metas, pessoas, dividas, despPess, cards, cats, params,
saldosIniciais, faturas, simulacoes
```

`BACKUP_SCHEMA_VERSION = 2`. Qualquer mudança estrutural em uma dessas
chaves exige:

1. Entrada no `migrationPipeline.js`.
2. Atualização de `04-MODELO-DE-DADOS-E-LOCALSTORAGE.md`.
3. Teste de caracterização cobrindo dado antigo sendo lido pela versão nova.
4. Verificação de que backup/restauração continua compatível com backups
   antigos (preenchimento seguro de campos ausentes).

Bugs reais já causados por descuido aqui (não repetir): bump de versão
destruindo dados silenciosamente, `toISOString()` gerando bug de fuso
horário em inicialização de mês, escrita dupla de campos PT/EN sem fonte
canônica, falha silenciosa de persistência ao estourar quota do
LocalStorage.

---

## 5. Fluxo de trabalho esperado

### Antes de codificar
- Ler o(s) doc(s) numerado(s) relevante(s) ao escopo (`02-REGRAS-DE-NEGOCIO.md`
  para regra financeira, `04-MODELO-DE-DADOS-E-LOCALSTORAGE.md` para
  persistência, `07-ROADMAP-E-BACKLOG.md` para saber se já há decisão
  registrada sobre o item).
- Confirmar branch (`git status`, `git branch`) — o fluxo usa `develop` como
  branch de trabalho e `main` como branch estável, com tags por versão
  (ex.: `v0.3.28-base`). Ver exemplos completos em
  `ROTEIRO-GIT-POS-v0_3_26_6.md` e `GUIA-DE-ATUALIZACAO-v0_3_28.md`.
- Para mudanças que tocam modelo de dados, fatura de cartão, migração ou
  qualquer área já marcada como frágil: propor um plano antes de editar
  (modo de planejamento), não editar direto.

### Durante
- Preferir funções puras e pequenas, baixo acoplamento, nomes claros.
- Usar `useMemo`/`useCallback` quando evitar recomputação ou
  re-renderização desnecessária.
- Escrever teste de caracterização para comportamento existente antes de
  refatorar uma área crítica (padrão já usado em `cardInvoiceOperations.js`
  e `dataModel.test.js`).

### Depois de qualquer alteração
```bash
npx vitest run        # todos os testes devem passar (33 até v0.3.28, crescendo)
npm run build
npm run dev            # checklist manual quando a mudança afeta UI ou fluxo de dados
```
- Atualizar `09-CHANGELOG.md` seguindo o modelo já usado no arquivo
  (Adicionado / Alterado / Corrigido / Removido / Migração / Testes).
- Se a mudança envolveu uma decisão técnica relevante (trade-off, alternativa
  descartada, impacto em LocalStorage ou regra de negócio), registrar em
  `08-REGISTRO-DE-DECISOES.md` no mesmo formato dos `DEC-000X` existentes.
- Se a versão fechar um marco, considerar um guia de atualização dedicado
  (padrão `GUIA-DE-ATUALIZACAO-vX_Y_Z.md`) com passo a passo de branch,
  cópia de arquivos, testes, build, checklist manual e commit/merge.

---

## 6. Comandos do projeto

```bash
npm install
npm run dev        # desenvolvimento local
npm run build       # build de produção
npm run preview     # preview do build
npx vitest run       # suíte de testes (characterization tests)
```

Build já teve alerta não bloqueante de chunk >500kB (área de
importação/PDF) — não é regressão, é um item de backlog para code splitting.

---

## 7. Qualidade, performance e UX (resumo)

- Código legível, funções pequenas, evitar duplicação e código morto.
- Evitar cálculos repetidos e estados duplicados.
- UX: simplicidade, poucos cliques, feedback visual, responsividade,
  filtros e busca, ações rápidas.
- Interface: manter padrão visual atual, cores consistentes, layout limpo,
  evitar poluição visual — não redesenhar sem pedido explícito.

---

## 8. Evoluções futuras conhecidas (contexto, não fazer sem pedido)

Calendário financeiro, fluxo de caixa, orçamentos, patrimônio,
investimentos, importação automática, Open Finance, PWA, sincronização em
nuvem. Ver detalhamento e priorização em `07-ROADMAP-E-BACKLOG.md`.

---

## 9. Retomada de sessão

Ao iniciar uma sessão nova sem contexto recente, procurar o arquivo de
retomada mais recente no padrão `NN-RETOMADA-AAAA-MM-DD-POS-vX_Y_Z.md` (ex.:
`35-RETOMADA-2026-07-05-POS-v0_3_26_6.md`) — ele traz o último status
aprovado, o que entra/não entra no próximo escopo, e checklist inicial. Se
uma sessão fechar um marco importante, criar o próximo arquivo de retomada
seguindo o mesmo padrão antes de encerrar.
