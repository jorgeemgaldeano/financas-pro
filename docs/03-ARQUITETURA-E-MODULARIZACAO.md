# Arquitetura e Modularização — Finanças PRO

## Objetivo

Definir a direção arquitetural para transformar gradualmente o aplicativo em uma estrutura modular, segura e fácil de manter.

## Situação atual esperada

O aplicativo pode estar concentrado em um arquivo principal `App.jsx`, contendo:

- Estados principais.
- Persistência em LocalStorage.
- Cálculos financeiros.
- Renderização das telas.
- Componentes internos.
- Funções utilitárias.
- Dados iniciais.
- Regras de negócio.

Essa situação é aceitável para o início, mas deve ser evoluída com cuidado.

## Princípios de modularização

1. Extrair primeiro o que tem menor risco.
2. Manter o comportamento visual e funcional.
3. Não alterar estrutura de dados junto com movimentação de arquivos, salvo necessidade documentada.
4. Criar arquivos pequenos e com responsabilidade clara.
5. Centralizar regras financeiras em `utils` ou `services`.
6. Centralizar persistência em `services/storageService.js`.
7. Centralizar dados iniciais em `data`.
8. Evitar prop drilling excessivo.
9. Introduzir Context API apenas quando o ganho for claro.
10. Não adicionar Redux/Zustand sem justificativa.

## Fases sugeridas

### Fase 1 — Preparação da estrutura

Criar estrutura mínima sem alterar comportamento:

```txt
src/
  App.jsx
  main.jsx
  constants/
  data/
  utils/
  services/
  hooks/
  components/
  pages/
```

Arquivos iniciais possíveis:

- `constants/storageKeys.js`
- `constants/financeTypes.js`
- `utils/moneyUtils.js`
- `utils/dateUtils.js`
- `services/storageService.js`
- `hooks/useLocalStorage.js`

### Fase 2 — Extração de constantes e dados iniciais

Mover dados estáticos e constantes:

- Cores.
- Chaves do LocalStorage.
- Tipos financeiros.
- Categorias iniciais.
- Contas iniciais.
- Cartões iniciais.
- Parâmetros iniciais.

Baixo risco, pois não altera regra.

### Fase 3 — Extração de utilitários

Mover funções puras:

- Formatação monetária.
- Formatação de data.
- Conversão de mês.
- Agrupamentos.
- Soma de valores.
- Cálculos simples.

Critério: função não deve depender diretamente de estado React.

### Fase 4 — Extração da persistência

Criar camada de armazenamento:

- `getStorageData`
- `setStorageData`
- `removeStorageData`
- `exportBackup`
- `importBackup`
- `runMigrations`

Essa fase exige atenção ao LocalStorage.

### Fase 5 — Extração de componentes visuais

Extrair componentes sem regra complexa:

- Botões.
- Cards.
- Modais.
- Inputs.
- Tabelas.
- Badges.
- Layout.
- Sidebar.
- Header.

### Fase 6 — Extração de páginas

Separar telas principais:

- Dashboard.
- Lançamentos.
- Contas.
- Cartões.
- Metas.
- Pessoas.
- Projeções.
- Simulações.
- Importação.
- Parâmetros.

Cada página deve receber dados e callbacks, ou consumir contexto se já existir.

### Fase 7 — Centralização das regras financeiras

Criar utilitários ou services para:

- Cálculo de saldo.
- Cálculo de fatura.
- Fechamento de fatura.
- Baixa de pagamento.
- Geração de lançamentos previstos.
- Recorrências.
- Parcelamentos.
- Ajustes de cartão.
- Projeções.

### Fase 8 — Context API ou hook principal

Criar, se necessário:

- `FinanceContext.jsx`
- `useFinanceData.js`

Objetivo:

- Reduzir complexidade do `App.jsx`.
- Centralizar estado financeiro.
- Facilitar consumo pelas páginas.

## Estrutura alvo detalhada

```txt
src/
  App.jsx
  main.jsx

  constants/
    colors.js
    storageKeys.js
    financeTypes.js
    invoiceStatus.js
    transactionStatus.js

  data/
    initialAccounts.js
    initialCards.js
    initialCategories.js
    initialParams.js
    initialPeople.js

  services/
    storageService.js
    migrationService.js
    backupService.js
    importService.js
    invoiceService.js
    recurringService.js

  utils/
    dateUtils.js
    moneyUtils.js
    arrayUtils.js
    financeCalculations.js
    cardInvoiceUtils.js
    validationUtils.js

  hooks/
    useLocalStorage.js
    useFinanceData.js
    useMonthSelection.js
    useModal.js

  context/
    FinanceContext.jsx

  components/
    layout/
      AppLayout.jsx
      Sidebar.jsx
      Header.jsx

    ui/
      Button.jsx
      Card.jsx
      Modal.jsx
      Input.jsx
      Select.jsx
      Badge.jsx
      EmptyState.jsx
      ConfirmDialog.jsx

    finance/
      TransactionForm.jsx
      TransactionTable.jsx
      AccountCard.jsx
      CardInvoicePanel.jsx
      CategorySelector.jsx
      MonthSelector.jsx
      PaymentStatusBadge.jsx

    charts/
      CategoryChart.jsx
      MonthlyEvolutionChart.jsx

  pages/
    DashboardPage.jsx
    TransactionsPage.jsx
    AccountsPage.jsx
    CardsPage.jsx
    GoalsPage.jsx
    PeoplePage.jsx
    ProjectionsPage.jsx
    SimulationsPage.jsx
    ImportPage.jsx
    ParametersPage.jsx
```

## Regras para criação de componentes

Cada componente deve ter:

- Nome claro.
- Responsabilidade única.
- Props explícitas.
- Baixo acoplamento.
- Sem acesso direto ao LocalStorage, salvo componentes técnicos específicos.
- Sem cálculos financeiros complexos dentro do JSX.

## Regras para services

Services podem conter regra de negócio e operações mais complexas.

Exemplos:

- `invoiceService.js`: fechar fatura, calcular fatura, gerar pagamento previsto.
- `recurringService.js`: gerar lançamentos recorrentes.
- `backupService.js`: exportar e importar backup.
- `migrationService.js`: migrar estrutura de dados.
- `importService.js`: processar CSV/OFX/QFX.

## Regras para utils

Utils devem conter funções puras e reutilizáveis.

Exemplos:

- `formatCurrency`
- `parseCurrency`
- `getMonthKey`
- `sumBy`
- `groupBy`
- `calculateAccountBalance`
- `calculateInvoiceTotal`

## Critério para considerar uma etapa concluída

Uma etapa de modularização só deve ser considerada concluída se:

- A aplicação compila.
- A aplicação abre localmente.
- As abas principais continuam acessíveis.
- Dados salvos anteriormente continuam carregando.
- Cadastro e edição básicos continuam funcionando.
- Cálculos principais não mudaram sem justificativa.
- Backup e restauração continuam funcionando.

## Atualização arquitetural — Pontos candidatos à próxima extração

Após as evoluções recentes, o `App.jsx` passou a concentrar novas regras relevantes. Para reduzir risco técnico, as próximas extrações recomendadas são:

### `services/importService.js`

Responsável por:

- Parse de OFX/QFX/CSV/TXT.
- Regras de desprezo, como BB Rende Fácil.
- Detecção de duplicidade.
- Geração de relatório de importação.
- Controle de `importBatchId`.
- Desfazer lote importado.

### `services/categoryService.js`

Responsável por:

- Autocategorização por regras personalizadas.
- Autocategorização por histórico.
- Regras padrão de palavras-chave.
- Normalização de descrição.
- Fallback para categoria "Outros".

### `services/cardInvoiceService.js`

Responsável por:

- Cálculo da competência da fatura.
- Verificação de fatura aberta ou fechada.
- Geração de parcelas em competências futuras.
- Cálculo de impacto real e simulado por competência.

### `services/simulationService.js`

Responsável por:

- Persistência das simulações.
- Recálculo da simulação com situação atualizada.
- Cálculo de impacto por parcela e competência.
- Exclusão manual de simulações.

### `services/peopleSharedService.js`

Responsável por:

- Consolidação mensal por pessoa.
- Cálculo de valores a pagar, a receber, pendentes e saldo líquido.
- Gestão de despesas compartilhadas por competência.

A extração deve ser incremental e feita somente após validação funcional da versão atual.


## Atualização arquitetural — Pós-revisão de backup/restauração

A versão `App_backup_restauracao_revisado.jsx` manteve a lógica de backup/restauração dentro do `App.jsx` por segurança incremental.

### Decisão temporária

Não criar `services/backupService.js` nesta etapa, pois o objetivo era corrigir a cobertura do backup sem misturar modularização com ajuste de persistência.

### Próxima extração recomendada

Após validação local da versão revisada, a próxima extração de baixo risco continua sendo:

1. `services/importService.js`
2. `services/categoryService.js`
3. `services/cardInvoiceService.js`
4. `services/simulationService.js`
5. `services/peopleSharedService.js`
6. `services/backupService.js`

A extração de `backupService.js` deve ocorrer somente depois que a regra atual de backup/restauração estiver validada manualmente.

### Critério para extrair `backupService.js`

- Backup exporta simulações.
- Backup preserva metadados de importação.
- Restauração de backup válido funciona.
- Restauração de backup inválido não apaga dados.
- Build local aprovado após a versão revisada.
