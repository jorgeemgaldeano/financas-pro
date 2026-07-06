# Hotfix v0.3.26.7 — Correções cirúrgicas de segurança de dados e fuso

Data: 2026-07-05
Base: v0.3.26.6 (aprovada)
Tipo: hotfix (sem nova funcionalidade, sem mudança de comportamento intencional)

Este pacote corrige cinco achados da análise técnica (doc 36), todos de
alto risco de dados ou latentes, sem tocar em regras de negócio nem alterar a
estrutura do LocalStorage. Nenhuma funcionalidade foi removida.

## Arquivos alterados

```
src/App.jsx
src/utils/dateUtils.js
src/services/cardInvoiceService.js
src/services/financeRepository.js
src/hooks/useLocalStorage.js
```

`src/utils/moneyUtils.js` e `src/constants/storageKeys.js` vão no pacote apenas
como referência de contexto — **não foram alterados**.

## Correções

### E7 — Blindagem do versionamento de schema (o mais crítico)
`LS_PREFIX = "fpro_v" + LS_VERSION + "_"`. O número da versão está embutido no
prefixo das chaves. Antes, subir `LS_VERSION` de 1 para 2 mudaria todas as
chaves de `fpro_v1_*` para `fpro_v2_*` e **órfãva 100% dos dados do usuário
silenciosamente** (leitura vazia no novo prefixo → fallback para dados iniciais).

Correção em `financeRepository.js`: ao ler uma chave inexistente no prefixo
atual, o repositório procura a mesma chave lógica em prefixos de versões
anteriores (`fpro_v0_`, etc.), migra o valor para o prefixo atual (migração
preguiçosa) e o devolve. A partir de agora, qualquer incremento futuro de
`LS_VERSION` é **não destrutivo**. `LS_VERSION` permanece 1 neste hotfix.

### E1 — Deslocamento de fuso na data/competência "de hoje"
`new Date().toISOString()` converte para UTC. Em São Paulo (UTC-3), à noite o
ISO já aponta para o dia/mês seguinte. Como a competência é o eixo dos cálculos,
o app podia abrir no mês errado e datas-padrão de formulários nasciam no dia
seguinte.

- `dateUtils.js`: novos helpers `todayIso()` e `todayMonthKey()` derivados de
  componentes **locais** (getFullYear/getMonth/getDate), nunca UTC.
- `App.jsx`: `selMonth` inicial e o reset ("voltar ao mês atual") usam
  `todayMonthKey()`. Datas-padrão de novos lançamentos/amortizações/despesas
  usam `todayIso()`.
- `cardInvoiceService.js`: fallback de `getCardInvoiceCompetence` e o `todayKey`
  default de `getInvoiceClosureStatusForMonth` usam os helpers locais.

Observação: pontos que usam `new Date(ano, mês, dia).toISOString()` (meia-noite
**local**) são seguros em fuso negativo e foram mantidos.

### E8 — Import faltante em cardInvoiceService.js
`safeMoneyAmount` chamava `moneyToNumber(...)` sem importá-lo — `ReferenceError`
latente se um valor em texto chegasse a `getSimulationInstallmentValue`.
Adicionado `import { moneyToNumber } from "../utils/moneyUtils.js"`.

### E5 — Geração de IDs robusta
`uid()` gerava apenas 7 caracteres com `Math.random()`, com risco de colisão
acumulado ao longo de anos de importações em lote (IDs são chaves de vínculo:
`invoiceId`, `parcelaGrupo`, `paymentTransactionId`). Agora usa
`crypto.randomUUID()` com fallback. **IDs já existentes permanecem válidos.**

### L6 — Falha de gravação deixa de ser silenciosa
Uma falha ao gravar no LocalStorage (ex.: `QuotaExceededError`) era engolida: o
estado React atualizava, a UI refletia a mudança, mas nada era persistido — e o
dado sumia no reload. Agora `useLocalStorage.js` propaga a falha via
`onPersistError` (e evento `fpro:persist-error`), e o `App.jsx` exibe um banner
fixo alertando o usuário a fazer backup e liberar espaço.

## Fora deste hotfix (intencional)
- **E2 (dual-write PT/EN)** volta para a v0.3.28 (consolidação do modelo), como
  risco latente — o importador usa `contaId` (PT), coerente com o cálculo de
  saldo, então não há bug ativo hoje.
- Nome do arquivo de backup ainda usa data UTC (cosmético, sem impacto em dados).

## Como aplicar
Copie os arquivos de `src/` deste pacote sobre os correspondentes do projeto,
preservando a estrutura de pastas. Em seguida:

```bash
npm run build
```

## Validação executada
- `dateUtils` (helpers locais): formato e coerência com data local — OK.
- `financeRepository` (migração de prefixo legado): lê de `fpro_v0_` e promove
  para `fpro_v1_` — OK.
- `cardInvoiceService` (E8): importa e executa sem `ReferenceError` — OK.
- `App.jsx`: integridade estrutural do JSX via TypeScript compiler API
  (`ts.createSourceFile` / `ScriptKind.JSX`) — 0 erros.

## Checklist de aceite manual (recomendado)
- [ ] Abrir o app à noite (após 21h) e confirmar que o mês corrente está correto.
- [ ] Criar um novo lançamento e confirmar que a data-padrão é hoje.
- [ ] Fechar e reabrir uma fatura — comportamento idêntico à v0.3.26.6.
- [ ] Importar cartão com parcelamento — comportamento idêntico à v0.3.26.6.
- [ ] Verificar que o badge de versão mostra v0.3.26.7.
