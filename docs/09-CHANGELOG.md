# Changelog — Finanças PRO

Use este arquivo para registrar alterações relevantes do aplicativo.

## Modelo

```md
## [0.3.11] - 2026-06-29

### Adicionado

- Criado `src/utils/moneyUtils.js` para centralizar `fmtBRL`, `moneyToNumber` e `maskMoneyInput`.
- Criado `src/utils/dateUtils.js` para centralizar utilitários de data, mês e competência.
- Criado `src/constants/storageKeys.js` para centralizar `LS_VERSION`, `LS_PREFIX`, `BACKUP_SCHEMA_VERSION` e `BACKUP_STORAGE_KEYS`.
- Criado `src/hooks/useLocalStorage.js` para centralizar `lsGet`, `lsSave` e `useLS`.

### Alterado

- `src/App.jsx` passou a importar utilitários e constantes extraídos, reduzindo responsabilidades do arquivo principal.
- `src/components/ui/DateInput.jsx` passou a reaproveitar funções de conversão e máscara de data de `dateUtils.js`.
- Versão visual da aplicação atualizada para `v0.3.11`.

### Corrigido

- Não aplicável. Refatoração técnica sem alteração funcional intencional.

### Removido

- Não aplicável. Nenhuma funcionalidade foi removida.

### Migração

- Não houve alteração de chaves do LocalStorage.
- Não houve alteração de estrutura persistida.
- Não houve alteração no formato interno de datas ou valores.

### Testes

- Validação sintática via TypeScript `transpileModule` executada sem diagnósticos nos arquivos alterados.
- Pendente validação local com `npm run dev`, `npm run build` e `npm run preview`.
- Pendente checklist manual de regressão de valores, datas, backup/restauração e persistência após recarregar.


## [versão] - AAAA-MM-DD

### Adicionado

- Item novo.

### Alterado

- Item alterado.

### Corrigido

- Correção realizada.

### Removido

- Item removido.

### Migração

- Informar alteração de LocalStorage, se houver.

### Testes

- Informar testes executados.
```

---


## [0.3.6] - 2026-06-29

### Adicionado

- Criado componente reutilizável `src/components/ui/RequiredFieldModal.jsx` para centralizar o modal de campo obrigatório e os helpers `requiredFieldInfo` e `highlightIfRequired`.

### Alterado

- `App.jsx` passou a importar o modal e os helpers de validação obrigatória do novo componente reutilizável.
- Atualizada a identificação visual da aplicação para `v0.3.6`.
- Registrado que os testes manuais pendentes do passo 3 foram validados pelo usuário.

### Corrigido

- Não aplicável. Refatoração técnica sem alteração funcional intencional.

### Removido

- Não aplicável.

### Migração

- Não houve alteração de chave do LocalStorage.
- Não houve alteração de estrutura de dados persistidos.
- Não houve alteração de regra financeira.

### Testes

- Passo 3 validado pelo usuário: filtros, recategorização protegida, backup/restauração com metas por categoria e histórico de despesas compartilhadas.
- Validação sintática executada via TypeScript `transpileModule` nos arquivos `src/App.jsx` e `src/components/ui/RequiredFieldModal.jsx` sem diagnósticos.
- Pendente validação local da v0.3.6 após refatoração: `npm run dev`, `npm run build` e `npm run preview`.


## [0.3.7] - 2026-06-29

### Adicionado

- Criado componente reutilizável `DateInput` em `src/components/ui/DateInput.jsx` para entrada de datas no padrão brasileiro `dd/mm/aaaa`.
- Criadas funções auxiliares `isoToBrazilianDate`, `brazilianDateToIso` e `maskBrazilianDate` para conversão segura entre exibição brasileira e valor interno ISO.

### Alterado

- Campos de data visíveis ao usuário deixam de usar `input type="date"` e passam a exibir/aceitar datas no padrão `dd/mm/aaaa`.
- Mantida a persistência interna das datas no formato `YYYY-MM-DD`, preservando cálculos, filtros, importações, backup e LocalStorage.
- A identificação visual da aplicação foi atualizada para `v0.3.7`.

### Corrigido

- Padronizada a experiência de digitação de datas, evitando variação de formato conforme navegador/sistema operacional.

### Removido

- Não aplicável.

### Migração

- Não houve alteração de chave do LocalStorage.
- Não houve alteração incompatível nos dados persistidos.
- Datas continuam salvas internamente como `YYYY-MM-DD`; a mudança é apenas de entrada/exibição nos campos editáveis.

### Testes

- Validação sintática via TypeScript `transpileModule` executada sem diagnósticos em `src/App.jsx`, `src/components/ui/RequiredFieldModal.jsx` e `src/components/ui/DateInput.jsx`.
- Pendente validação local com `npm run dev`, `npm run build` e `npm run preview`.
- Pendente teste manual de cadastro/edição/filtros usando datas no padrão `dd/mm/aaaa`.


## [0.3.3] - 2026-06-29

### Adicionado

- Importação de extratos de vales Pluxee em PDF/TXT na aba **Importar**.
- Leitura de cargas de benefício como receitas e compras no vale como despesas.
- Campo **Ano do extrato Pluxee**, pois o PDF informa dia e mês dos lançamentos, mas não informa o ano em cada item.
- Rastreabilidade dos lançamentos importados de vale com `importTipo: "vale"`, `fornecedorVale: "pluxee"`, `carteiraVale` e `hora`.

### Alterado

- A aba **Importar** passou a oferecer o tipo **Extrato de vale** separado de cartão e extrato bancário.
- O controle de lotes importados passou a identificar lotes de vale como **Vale**.
- A versão visual da aplicação foi atualizada para `v0.3.3`.

### Corrigido

- Não aplicável.

### Removido

- Não aplicável.

### Migração

- Não houve alteração de chaves do LocalStorage.
- Foram adicionados campos opcionais apenas em lançamentos importados de vale.
- Dados antigos continuam compatíveis.

### Dependência

- Adicionar `pdfjs-dist` ao projeto para permitir leitura de texto de PDF no navegador.

### Testes

- Validação sintática do `App.jsx` executada via TypeScript `transpileModule` sem diagnósticos.
- Pendente validação local com `npm install pdfjs-dist`, `npm run dev`, importação do PDF Pluxee, `npm run build` e `npm run preview`.


## [0.3.4] - 2026-06-29

### Adicionado

- Melhoria de UX nos campos de número de parcelas em lançamentos, despesas compartilhadas e simulações.

### Alterado

- Campos de parcelas não são mais preenchidos automaticamente com valor padrão visual.
- O usuário pode limpar completamente o campo de parcelas antes de digitar o número correto.
- A validação passa a bloquear gravação quando o parcelamento estiver ativo e o número de parcelas estiver vazio ou inválido.
- A identificação visual da aplicação foi atualizada para `v0.3.4`.

### Corrigido

- Corrigido comportamento que forçava `1` ou `2` no campo de parcelas, dificultando a digitação correta pelo usuário.

### Removido

- Não aplicável.

### Migração

- Não houve alteração de chave do LocalStorage.
- Não houve alteração incompatível de dados existentes.

### Testes

- Validação sintática do `App.jsx` executada via TypeScript `transpileModule` sem diagnósticos.
- Pendente validação local com `npm run dev`, `npm run build` e `npm run preview`.


## [0.3.5] - 2026-06-29

### Corrigido

- Corrigida a classificação dos movimentos importados de extratos Pluxee de vales.
- A regra passa a considerar como crédito/receita somente movimentos com descrição `DISPONIBILIZACAO DE VALOR`.
- Todos os demais movimentos do extrato Pluxee passam a ser tratados como débito/despesa.

### Alterado

- Atualizada a orientação da tela de importação de vales para explicitar a regra de crédito/débito validada.
- Atualizada a versão visual da aplicação para `v0.3.5`.

### Migração

- Não houve alteração de chave do LocalStorage.
- Não houve alteração incompatível de dados persistidos.
- Mantidos campos opcionais já previstos para importação de vales: `importTipo`, `fornecedorVale`, `carteiraVale` e `hora`.

### Testes

- Aprovado pelo usuário: acessar aba Importar, selecionar Extrato de vale/Pluxee, informar ano, selecionar conta de vale, importar PDF, conferir prévia, salvar importação, verificar lançamentos na conta de vale, reimportar o PDF para testar duplicidade e desfazer lote importado.
- Reprovado antes da correção: classificação de cargas/compras.
- Correção aplicada: somente `DISPONIBILIZACAO DE VALOR` como receita; demais movimentos como despesa.
- Validação sintática via TypeScript `transpileModule` executada sem diagnósticos.
- Validação local da versão `v0.3.5` concluída conforme informado pelo usuário em 2026-06-29:
  - `npm install`: aprovado.
  - `npm run dev`: aprovado.
  - `npm run build`: aprovado com alerta não bloqueante de chunk acima de 500 kB após minificação.
  - `npm run preview`: aprovado.
- Observação técnica: o alerta de chunk acima de 500 kB não bloqueia a versão; deve ser tratado futuramente com modularização incremental e possível code splitting, especialmente na área de importação/PDF.

## [0.3.2] - 2026-06-29

### Adicionado

- Filtros na aba **Lançamentos** por data inicial, data final, categoria principal, origem, tipo e status.
- Edição protegida de categoria por botão **Editar/OK**, evitando trocas acidentais.
- Recategorização direta nas abas **Lançamentos**, **Cartões** e **Contas**.

### Alterado

- Ordenação do detalhamento acumulado de despesas compartilhadas para ordem crescente por mês de referência.
- Atualização da identificação visual da aplicação para `v0.3.2`.

### Corrigido

- Corrigida restauração dos limites/metas por categoria após importação de backup, preservando `metas` como objeto.
- Corrigida a interpretação da ordenação mensal das despesas compartilhadas para exibir o mês de referência em ordem ascendente.

### Removido

- Não aplicável.

### Migração

- Não houve alteração de chave do LocalStorage.
- A estrutura `metas` permanece como objeto e deve ser restaurada como objeto.
- Não houve alteração incompatível de dados existentes.

### Testes

- Validação sintática do `App.jsx` executada via TypeScript `transpileModule` sem diagnósticos.
- Validação local da versão `App_ajustes_v0_3_2.jsx` com `npm run dev` concluída conforme informado pelo usuário em 2026-06-29.
- Validação de build da versão `App_ajustes_v0_3_2.jsx` com `npm run build` concluída conforme informado pelo usuário em 2026-06-29.
- Validação de preview da versão `App_ajustes_v0_3_2.jsx` com `npm run preview` concluída após ajuste local, conforme informado pelo usuário em 2026-06-29.
- Pendente teste manual funcional de filtros, recategorização, backup/restauração com metas por categoria e histórico de despesas compartilhadas.

## [0.3.1] - 2026-06-29

### Adicionado

- Identificação visual da versão do aplicativo na interface.
- Modal de validação para campos obrigatórios com mensagem padronizada: `Para prosseguir, preencha o campo <nomecampo>`.
- Destaque visual no campo obrigatório não preenchido.
- Accordion nas telas de **Contas** e **Cartões** para abrir e fechar o detalhamento.
- Botão **Ver Histórico** em despesas compartilhadas.
- Modal de histórico para despesas compartilhadas baixadas.

### Alterado

- A tela de **Lançamentos** passou a permitir edição da categorização após a gravação.
- O detalhamento de despesas compartilhadas passou a exibir competência no formato `mm/aaaa`.

### Corrigido

- Melhorada a experiência de validação ao impedir gravação sem campos obrigatórios.
- Reduzida a poluição visual nas telas de **Contas** e **Cartões** quando houver múltiplos registros.

### Removido

- Não aplicável.

### Migração

- Não houve alteração de chave do LocalStorage.
- Foram adicionados campos opcionais em despesas compartilhadas: `historico` e `historicoEm`.
- Registros antigos sem esses campos continuam compatíveis e são tratados como ativos.

### Testes

- Validação sintática do `App.jsx` executada via TypeScript `transpileModule`.
- Pendente validação local completa no projeto React + Vite.



## [0.1.0] - 2026-06-27

### Adicionado

- Criação do kit de instruções do projeto.
- Definição das regras de evolução incremental.
- Definição inicial de regras de cartão, fatura, ajuste e pagamento previsto.
- Definição de checklist de validação.
- Definição de roadmap e backlog.

### Alterado

- Não aplicável.

### Corrigido

- Não aplicável.

### Removido

- Não aplicável.

### Migração

- Não aplicável.

### Testes

- Não aplicável.

## [0.2.0] - 2026-06-27

### Adicionado

- Relatório de importação com itens importados, duplicados e ignorados.
- Identificador de lote importado (`importBatchId`).
- Opção para desfazer lote importado.
- Regras editáveis de autocategorização.
- Detalhamento mensal acumulado por pessoa para despesas compartilhadas.
- Botão **Nova Conta** na aba Contas.
- Exportação TXT de despesas de cartão de crédito.
- Campo opcional de competência da fatura em lançamentos de cartão.
- Persistência de simulações.
- Opção para refazer simulação com situação atualizada.

### Alterado

- Importação bancária passou a ignorar BB Rende Fácil/Rende Fácil.
- Autocategorização passou a considerar regras personalizadas, histórico e regras padrão ampliadas.
- Lançamentos de cartão passaram a considerar competência de fatura, não apenas mês da compra.
- Simulações passaram a exibir impacto por competência da fatura e número real de parcelas informado.

### Corrigido

- Corrigida ausência de ações na seção Parâmetros > Autocategorização.
- Corrigida inconsistência de simulação que agrupava impacto pelo mês da data/parcela em vez da competência da fatura.

### Removido

- Não aplicável.

### Migração

- Não houve alteração incompatível.
- Foram adicionados campos opcionais em lançamentos importados e lançamentos de cartão.
- Foi adicionada chave nova para simulações, tratada como lista vazia quando inexistente.

### Testes

- Validação de sintaxe JSX com `esbuild` nas versões geradas.
- Testes manuais recomendados registrados no checklist de validação.


## [0.2.1] - 2026-06-27

### Adicionado

- Envelope de backup com identificação do aplicativo, versão do schema, data de exportação e snapshot bruto das chaves conhecidas do LocalStorage.
- Lista explícita de chaves `fpro_v1_*` consideradas no backup.
- Compatibilidade de restauração para simulações salvas como `simulacoes`, `sims` ou `simulations`.
- Fallback seguro para `params.autoCategoryRules` como lista vazia quando ausente.

### Alterado

- Exportação de backup passou a reforçar a inclusão de simulações persistidas.
- Exportação de backup passou a preservar melhor os metadados de importação já existentes nos lançamentos, como `importBatchId`, `importSource` e `importedAt`.
- Restauração de backup passou a validar a estrutura antes de substituir dados locais.

### Corrigido

- Reduzido risco de backup incompleto após a introdução das simulações persistidas.
- Reduzido risco de restauração insegura de arquivo JSON incompatível ou inválido.

### Removido

- Não aplicável.

### Migração

- Não houve alteração incompatível no LocalStorage.
- Não houve alteração de nome de chave persistida.
- Backups antigos devem continuar aceitos com preenchimento seguro de campos ausentes.

### Testes

- Validação sintática da versão `App_backup_restauracao_revisado.jsx` via TypeScript `transpileModule`.
- Pendente validação local no projeto completo com `npm run dev`, `npm run build` e `npm run preview`.
- Pendente teste manual de exportação/restauração com simulações e lote importado.

## [0.3.0] - 2026-06-29

### Adicionado

- Diretriz de reutilização antes de criação técnica.
- Critério obrigatório de avaliação: solução existente no projeto, React nativo, biblioteca compatível e somente depois código próprio.
- Novo arquivo `11-DIRETRIZ-REUTILIZACAO-E-BIBLIOTECAS.md`.
- Checklist específico para validação de reutilização, bibliotecas e novas dependências.
- Prompts padrão para desenvolvimento com avaliação prévia de reaproveitamento e bibliotecas.
- Registro de decisão técnica `DEC-0009`.

### Alterado

- Arquivos de contexto, arquitetura, regras de negócio, modelo de dados, roadmap e checklist passaram a refletir a nova diretriz.
- Backlog passou a incluir mapeamento de componentes, funções e padrões reutilizáveis antes de novas refatorações.

### Corrigido

- Não aplicável.

### Removido

- Não aplicável.

### Migração

- Não houve alteração de LocalStorage.
- Não houve alteração de formato de dados persistidos.

### Testes

- Revisão documental dos arquivos Markdown do projeto.
- Pendente validação prática da diretriz na próxima alteração de código.

## v0.3.12 — Correção da limpeza de dados financeiros

### Corrigido

- Corrigida a rotina **Apagar dados financeiros**, que não estava concluindo a limpeza de lançamentos, contas e cartões após a refatoração da v0.3.11.
- O `App.jsx` voltou a importar explicitamente `lsSave` do hook `useLocalStorage.js`.
- O `App.jsx` passou a importar explicitamente `LS_VERSION` de `storageKeys.js`, evitando referência indefinida na exportação de backup.

### Causa provável

Após a extração de `useLocalStorage.js`, a função `handleReset` continuou chamando `lsSave`, mas o `App.jsx` importava apenas `useLS`. Ao acionar o botão de limpeza, a execução era interrompida por referência indefinida antes de atualizar os estados e o LocalStorage.

### Impacto em regra de negócio

Sem alteração de regra financeira. A correção apenas restabelece o comportamento esperado da limpeza.

### Impacto em LocalStorage

Sem alteração estrutural. A rotina continua removendo chaves `fpro_` e regravando o estado zerado/preservado conforme regra atual.

### Validação técnica

Validação sintática via TypeScript `transpileModule` executada sem diagnósticos.

## v0.3.13 — Refatoração de filtros e autocategorização

Data: 2026-06-29

### Adicionado

- Criado `src/components/finance/TransactionFiltersPanel.jsx`.
- Criada função `filterTransactions` para centralizar a regra de filtragem da aba Lançamentos.
- Criado `src/services/categoryService.js`.
- Movidas para `categoryService.js` as regras de autocategorização, stopwords, normalização de texto, pontuação por palavra-chave, categorização por histórico e resolução de categoria.

### Alterado

- `src/App.jsx` passou a importar o painel de filtros e o serviço de autocategorização.
- A versão visual foi atualizada para `v0.3.13`.

### Impacto em regra de negócio

- Sem alteração intencional de regra financeira.
- A ordem de autocategorização foi preservada: regra personalizada, histórico, regras padrão e fallback.
- A filtragem da aba Lançamentos foi preservada.

### Impacto em LocalStorage

- Sem alteração de chaves.
- Sem alteração de formato persistido.
- Sem migração necessária.

### Validação técnica

- Validação sintática via TypeScript `transpileModule` executada sem diagnósticos nos arquivos alterados.

## Encerramento de fim do dia — 2026-06-29

### Situação

- `v0.3.12` aprovada pelo usuário.
- `v0.3.13` gerada para validação na próxima retomada.

### Próxima validação

Validar filtros de lançamentos e autocategorização após extração.


---

## [Planejamento técnico] - 2026-07-02

### Adicionado

- Registrada decisão de preparar a arquitetura para futura publicação no Vercel e futura migração para SQL.
- Definida recomendação de extrair `cardInvoiceService.js` antes de avançar para Projeções e backend.
- Definida diretriz de criar camada de repository/storage antes de substituir LocalStorage por API.

### Alterado

- Roadmap passa a considerar Vercel Preview após validação de cartão/fatura e build aprovado.
- SQL passa a ser tratado como etapa futura após estabilização funcional e UAT inicial.

### Migração

- Nenhuma migração realizada.
- LocalStorage permanece como persistência oficial.

### Testes

- Não aplicável. Planejamento técnico sem alteração de código executável.

## [0.3.17] - 2026-07-04 — Validação interrompida

### Situação

- A versão `v0.3.17` permanece em validação e não deve ser considerada aprovada.
- Foi registrada regressão com tela branca durante execução local.
- O console indicou erro `ReferenceError: getSimulationInstallmentValue is not defined` em `expandSim`.
- Após tentativa de correção, o usuário informou que o erro continua.

### Decisão

- Não avançar para `v0.3.18` antes de corrigir e validar a `v0.3.17`.
- Na próxima retomada, priorizar diagnóstico de divergência entre arquivos/pacote/local e corrigir apenas o erro bloqueante.

### Migração

- Não houve alteração de LocalStorage nesta anotação.

### Testes

- Pendente revalidação com `npm run dev`, `npm run build` e `npm run preview`.



## [0.3.19] - 2026-07-04

### Adicionado

- Criado `src/services/projectionService.js` para centralizar o cálculo de projeções mensais.
- Criada função `buildMonthlyExpenseProjection` para calcular despesas fixas, variáveis e total projetado.

### Alterado

- `src/App.jsx` passou a importar `buildMonthlyExpenseProjection`.
- Cálculo `projections` foi mantido em `useMemo`, mas delegando a regra pura ao service.
- Versão visual atualizada para `v0.3.19`.

### Corrigido

- Não aplicável. Refatoração técnica sem alteração funcional intencional.

### Removido

- Não aplicável. Nenhuma funcionalidade foi removida.

### Migração

- Não houve alteração de chaves do LocalStorage.
- Não houve alteração de estrutura persistida.
- Não houve migração.

### Testes

- Pendente validação local com `npm run dev`, `npm run build` e `npm run preview`.
- Pendente validação manual da aba **Projeções** comparando comportamento com `v0.3.18`.


## [0.3.20] - 2026-07-04

### Adicionado

- Criado gráfico de fluxo de caixa na aba Projeções.
- Criado componente `src/components/charts/CashFlowChart.jsx`.
- Ampliado `src/services/projectionService.js` com projeção real por competência.
- Adicionados filtros de projeção por ano e por período.

### Alterado

- Aba Projeções deixa de exibir visão genérica de fixos/variáveis e passa a usar dados reais: receitas, despesas, faturas e simulações.
- Versão visual atualizada para `v0.3.20`.

### Corrigido

- Corrigida baixa utilidade analítica da aba Projeções.

### Migração

- Não houve alteração de chaves do LocalStorage.
- Não houve alteração de estrutura persistida.
- Não houve migração.

### Testes

- Pendente validação local com `npm run dev`, `npm run build` e `npm run preview`.
- Pendente validação manual da aba Projeções em modo Ano e Período.
