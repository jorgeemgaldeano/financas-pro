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

## [0.3.21] - 2026-07-04

### Adicionado

- Criado detalhamento expansível na aba Projeções por competência.
- Adicionados grupos de detalhes para receitas, despesas, faturas e simulações.
- `projectionService.js` passou a retornar `detalhes` por mês projetado.

### Alterado

- `src/App.jsx` passou a controlar expansão dos meses projetados.
- Versão visual atualizada para `v0.3.21`.

### Corrigido

- Não aplicável. Evolução funcional incremental da análise de Projeções.

### Migração

- Não houve alteração de LocalStorage.
- Não houve alteração de chaves ou estrutura persistida.

### Testes

- Pendente validação local com `npm run dev`, `npm run build` e `npm run preview`.
- Pendente validação manual da expansão dos meses e conferência dos detalhes por origem.


## [0.3.21.1] - 2026-07-04

### Alterado

- Ajustados os campos de período da aba Projeções para formato curto `MM/AA`.
- Detalhamento expansível da projeção limitado a Cartões/Faturas e Simulações.
- Receitas e despesas permanecem nos totais mensais, sem detalhamento item a item.

### Migração

- Não houve alteração de LocalStorage.

### Testes

- Validação sintática via TypeScript `transpileModule` executada sem diagnósticos.
- Pendente validação local com `npm run dev`, `npm run build` e `npm run preview`.

## [0.3.22] - 2026-07-04

### Adicionado

- Filtros avançados na aba **Projeções** por origem, conta, cartão e categoria principal.
- Opções para incluir/excluir simulações e projetar/não projetar recorrências.
- Indicadores analíticos do fluxo de caixa: menor saldo, maior saída, maior queda, meses negativos e maior peso de faturas.
- Projeção conservadora de recorrências baseada em lançamentos existentes com `fixo: true`, sem gravação de novos lançamentos.

### Alterado

- `src/services/projectionService.js` passou a calcular projeções considerando filtros e recorrências analíticas.
- `src/App.jsx` passou a exibir filtros e indicadores na aba Projeções.
- Versão visual atualizada para `v0.3.22`.

### Corrigido

- Não aplicável. Evolução funcional controlada da aba Projeções.

### Removido

- Não aplicável.

### Migração

- Não houve alteração de chaves do LocalStorage.
- Não houve alteração de estrutura persistida.
- Não houve migração.

### Testes

- Validação sintática via TypeScript `transpileModule` executada sem diagnósticos em `src/App.jsx`, `src/services/projectionService.js` e `src/components/charts/CashFlowChart.jsx`.
- Pendente validação local com `npm run dev`, `npm run build` e `npm run preview`.

## [0.3.23] - 2026-07-04

### Corrigido

- Corrigido o comportamento do filtro **Projetar recorrências previstas** na aba **Projeções**.
- O filtro agora remove da projeção os lançamentos recorrentes ainda previstos, inclusive aqueles já materializados no array de transações.

### Alterado

- Texto do filtro ajustado para **Projetar recorrências previstas**.
- Incluída explicação visual sobre o comportamento do filtro.
- Atualizada a versão visual para `v0.3.23`.

### Migração

- Não houve alteração de LocalStorage.
- Não houve migração.

### Testes

- Validação sintática via TypeScript `transpileModule` executada sem diagnósticos em `src/App.jsx`, `src/services/projectionService.js` e `src/components/charts/CashFlowChart.jsx`.
- Pendente validação manual no ambiente local.


## [0.3.24] - 2026-07-04

### Corrigido

- Corrigida validação de duplicidade na importação bancária por data, descrição e valor.
- Corrigida validação de duplicidade na importação de cartão/fatura por data, descrição e valor.
- Validação de duplicidade reexecutada no momento de confirmar a importação.

### Migração

- Não houve alteração de LocalStorage.

### Testes

- Validação sintática executada sem diagnósticos.
- Pendente validação manual com reimportação bancária e de cartão.
# Changelog — Finanças PRO v0.3.24.1

Data: 2026-07-04

## Objetivo

Corrigir a validação de duplicidade que ainda falhava na importação de cartão de crédito e aplicar a mesma regra de duplicidade ao extrato Pluxee.

## Corrigido

- Ajustada a validação de duplicidade da importação de cartão de crédito para considerar múltiplos candidatos de data (`dataCompra` e `data`).
- Mantida a validação por destino, data, descrição normalizada, valor e tipo.
- Aplicada a regra de duplicidade ao modo `vale`/Pluxee usando conta destino, data, descrição, valor e tipo.
- Ajustado botão **Sel. tudo** para não remarcar duplicatas identificadas na prévia.
- A confirmação da importação continua revalidando duplicidade antes de salvar.

## Alterado

- `src/App.jsx` atualizado para `v0.3.24.1`.
- Funções auxiliares de chave de duplicidade passaram a gerar candidatos de comparação para reduzir falso negativo em cartão parcelado/importações com `dataCompra`.

## Regras preservadas

- Não houve alteração de regra de fatura.
- Não houve alteração de baixa, pagamento ou projeção.
- Não houve alteração de cálculo financeiro fora da importação.

## Impacto em LocalStorage

- Sem nova chave.
- Sem alteração de estrutura.
- Sem migração.
- Sem alteração em backup/restauração.
- A versão apenas impede novas duplicidades.

## Testes recomendados

1. Importar extrato bancário já validado anteriormente.
2. Reimportar o mesmo extrato bancário e confirmar duplicatas.
3. Importar fatura de cartão uma vez.
4. Reimportar a mesma fatura e confirmar duplicatas.
5. Importar fatura seguinte contendo parcelas já geradas anteriormente e confirmar que não duplica.
6. Importar extrato Pluxee uma vez.
7. Reimportar o mesmo Pluxee e confirmar duplicatas.
8. Confirmar que o botão **Sel. tudo** não seleciona duplicatas.
9. Rodar `npm run build`.
10. Rodar `npm run preview`.

---

## v0.3.25 — Controle interno de parcelamentos de cartão

- Criado controle lógico de parcelamento 1:N na importação de cartão.
- Parcelas futuras já previstas deixam de ser importadas novamente.
- Divergências de parcelamento passam a ser apontadas no relatório da importação.
- Campos opcionais `parcelaGrupo` e `descricaoBaseParcelamento` são aplicados a novos lançamentos parcelados.
- Sem alteração de chaves do LocalStorage e sem migração obrigatória.

---

## v0.3.26.2 — 2026-07-04

### Corrigido

- Revisada a importação de cartão para tratar compra parcelada como master lógico.
- Corrigida a identificação de parcelamentos por cartão, descrição base, data da compra e valor da parcela com tolerância de R$ 0,10.
- Impedida a expansão de linhas que já pertencem a parcelamento existente.
- Restaurada a criação de parcelas futuras quando o parcelamento ainda não existe no cartão.
- Adicionada distinção entre compras semelhantes no mesmo estabelecimento e data com valores diferentes.

### Mantido

- Fluxo de compra à vista.
- Fluxo bancário.
- Fluxo de vale.
- Estrutura do LocalStorage.

### Dependências

- Nenhuma dependência externa adicionada.

---

## v0.3.26.3 — Correção de falso duplicado entre parcelas futuras

- Corrigida a marcação indevida de parcelas futuras como duplicadas na prévia de importação de cartão.
- Compras parceladas agora usam chave de duplicidade específica por master lógico + parcela/total.
- Compras à vista preservam a regra anterior por cartão + data + descrição + valor.
- Sem alteração em LocalStorage.

## [0.3.26.4] - 2026-07-04

### Corrigido

- Corrigido o reconhecimento de parcelas já existentes ao importar fatura subsequente de cartão de crédito.
- Parcelas futuras criadas na primeira carga agora podem ser reconhecidas por competência, parcela/total, valor aproximado e descrição compatível, mesmo quando o arquivo altera data ou parte da descrição.

### Alterado

- `cardInstallmentService.js` passou a manter índice interno de parcelas existentes e aplicar validação complementar para faturas subsequentes.
- Versão visual atualizada para `v0.3.26.4`.

### Migração

- Não houve alteração de chaves do LocalStorage.
- Não houve alteração estrutural dos dados persistidos.
- Campos existentes continuam compatíveis.

### Testes

- Validar primeira carga de compra parcelada.
- Validar reimportação do mesmo arquivo.
- Validar importação da fatura subsequente com parcelas já criadas.
- Validar que novos lançamentos continuam importáveis.


## [0.3.26.5] - 2026-07-04

### Adicionado

- Ação manual na prévia de importação de cartão para corrigir parcela atual e subsequentes quando houver divergência corrigível.
- Identificação de divergência de parcela quando o sistema possui uma parcela prevista diferente da informada no arquivo.

### Alterado

- Tolerância de comparação de valor de parcela reduzida de R$ 0,10 para R$ 0,05.
- Linhas divergentes permanecem bloqueadas para importação automática até análise manual.

### Corrigido

- Tratamento de casos em que a administradora do cartão pula ou repete parcelas, causando divergência entre parcela prevista e parcela importada.

### Migração

- Não houve alteração de chave do LocalStorage.
- Não houve migração obrigatória.

### Testes

- Pendente validação local com `npm run build` e teste manual do fluxo de divergência/correção.

---

## [0.3.26.6] - 2026-07-04

### Adicionado

- Criado `src/components/finance/CardInstallmentDivergencePanel.jsx` para exibir divergências de parcelamento na importação de cartão.
- Adicionadas ações manuais para divergências: manter como está, alterar somente parcela atual, alterar atual e futuras.

### Alterado

- A correção de divergência deixa de ser executada diretamente pela linha da tabela de importação.
- `src/App.jsx` passa a exibir painel próprio ao final da página de revisão quando há divergências.
- `cardInstallmentService.js` passa a suportar correção somente da competência atual ou da competência atual e futuras.

### Corrigido

- Corrigido comportamento em que a tentativa de correção de divergência podia gerar sequência incorreta ou aparente criação de nova última parcela.

### Migração

- Não houve alteração de chaves do LocalStorage.
- Não houve alteração estrutural de dados.
- Campos opcionais de rastreabilidade podem ser adicionados apenas quando o usuário confirma correção manual.

### Testes

- Pendente validação local com `npm run build` e `npm run dev`.
- Pendente reteste dos cenários de divergência de parcela.

---

## [0.3.26.8] - 2026-07-07

### Corrigido

- Corrigida a importação de fatura de cartão via OFX do Banco do Brasil: o
  tipo do lançamento (receita/despesa) passa a ser determinado pelo campo
  `TRNTYPE` quando presente, em vez de depender só do sinal de `TRNAMT`.
  `TRNTYPE=CREDIT` (pagamento da fatura ou estorno) agora é importado como
  `receita`, reduzindo o total da fatura; `TRNTYPE=PAYMENT` (lançamento que
  compõe a fatura) é importado como `despesa`. Antes, pagamentos de fatura do
  BB podiam ser gravados como despesa, inflando indevidamente o total.
  (`src/services/importService.js`, função `parseOFX`)
- Corrigido `confirmImport` em `src/App.jsx`: ao confirmar a importação de
  cartão, o tipo do lançamento gravado (`tipo: r.tipo || "despesa"`) passa a
  respeitar o tipo já classificado pelo parser, em vez de forçar sempre
  `"despesa"`. Sem esse ajuste, a correção do parser era anulada no momento
  de salvar a transação.

### Verificado (sem alteração de código)

- Investigado relato de que excluir uma pessoa na aba **Pessoas** não
  removia a dívida associada. Revisão de `delPessoa` em `src/App.jsx` e
  teste manual (criar pessoa com dívida aberta, excluir, conferir
  `localStorage`) confirmaram que a exclusão já remove em cascata `dividas`
  e `despPess` pelo mesmo `pessoaId`, na mesma chamada. Nenhum caminho de
  código encontrado que deixe dívida órfã. Sem alteração aplicada.

### Alterado

- Versão visual da aplicação atualizada para `v0.3.26.8`.

### Migração

- Não houve alteração de chaves do LocalStorage.
- Não houve alteração de estrutura persistida.
- Nenhuma migração necessária.

### Testes

- `npm test` (vitest): 32/32 passando.
- Validado manualmente no preview: importação de um OFX sintético de
  cartão com `TRNTYPE PAYMENT` (compra) e `TRNTYPE CREDIT` (pagamento de
  fatura + estorno) — prévia e transações gravadas exibiram corretamente
  despesa/receita e o valor líquido esperado.
- Exclusão de pessoa com dívida aberta testada via UI + inspeção do
  `localStorage` (`fpro_v1_pessoas`, `fpro_v1_dividas`): dívida removida
  junto com a pessoa.

---

## [0.3.26.9] - 2026-07-07

### Corrigido

- Exclusão de **cartão** (`src/App.jsx`, aba Parâmetros › Cartões) agora
  verifica se existem lançamentos, faturas, despesas compartilhadas ou
  simulações vinculados ao cartão antes de excluir. Se houver, a exclusão é
  bloqueada com uma mensagem informando a contagem por tipo. Antes, a
  exclusão não checava nada: os lançamentos do cartão excluído continuavam
  em `trans`, mas somem silenciosamente do total gasto do dashboard (que
  itera sobre `cards`, não sobre `trans`).
- Exclusão de **conta** (aba Parâmetros › Contas) ganhou a mesma checagem
  (lançamentos vinculados, cartões que usam a conta como pagamento de
  fatura) e passou a ter confirmação (`window.confirm`), que **não existia
  antes** — o botão excluía direto no clique. Sem essa correção, excluir
  uma conta usada como pagamento de fatura de um cartão deixava
  `contaPagamentoId` apontando para um id inexistente; como o efeito de
  automigração (`src/App.jsx`, linha ~2087) só repara `contaPagamentoId`
  vazio, o id fantasma não era corrigido, e o próximo fechamento de fatura
  gravava o pagamento previsto numa conta que não existe mais, sumindo de
  qualquer saldo real sem erro visível.
- Exclusão de **categoria** (`delCat`) passou a verificar se há lançamentos
  ou despesas compartilhadas usando a categoria ou qualquer uma de suas
  subcategorias antes de excluir, bloqueando com mensagem se houver. Quando
  a exclusão é permitida, `metas[catId]` e as entradas de
  `params.autoCategoryRules` que apontam para os ids removidos são limpas
  automaticamente. Antes, uma regra de autocategorização apontando para uma
  categoria excluída continuava atribuindo esse `catId` inválido a novas
  importações indefinidamente (`guessCategoryForTransaction` não valida se
  o `catId` da regra ainda existe).

### Adicionado

- `collectCatAndDescendantIds(cats, id)` em `src/App.jsx`: helper de árvore
  de categorias que devolve o id da categoria e de todas as suas
  subcategorias, usado para escopar a checagem de uso e a limpeza de
  `metas`/`autoCategoryRules` ao excluir.
- `cardDependents(cardId)` e `contaDependents(contaId)` em `src/App.jsx`:
  funções de checagem de integridade referencial, passadas como prop para
  `ParamsTab` (que não tinha acesso a `trans`/`faturas`/`despPess`/`sims`).

### Alterado

- Versão visual da aplicação atualizada para `v0.3.26.9`.

### Migração

- Não houve alteração de chaves do LocalStorage.
- Não houve alteração de estrutura persistida.
- Nenhuma migração necessária.

### Testes

- `npm test` (vitest): 32/32 passando (regressão limpa, nenhum teste novo
  adicionado nesta versão).
- Não foram adicionados testes automatizados para `delCat`/`cardDependents`/
  `contaDependents`: são closures internas de `App.jsx` (mesmo padrão já
  existente para `delPessoa`/`delCat` antes desta mudança), e `App.jsx` não
  é importável no ambiente Vitest atual (`environment: "node"`, sem plugin
  React, sem DOM) sem uma mudança de configuração maior, fora do escopo
  desta correção pontual.
- Validado manualmente no preview (fluxo completo via automação de
  navegador):
  - Categoria em uso (10 lançamentos/despesas): exclusão bloqueada com
    mensagem de contagem.
  - Categoria sem uso: excluída normalmente.
  - Regra de autocategorização apontando para categoria sem uso: removida
    automaticamente junto com a categoria (confirmado antes/depois — regra
    visível, depois "Nenhuma regra personalizada cadastrada.").
  - Cartão em uso (7 lançamentos): exclusão bloqueada com mensagem.
  - Conta em uso (8 lançamentos + 2 cartões vinculados): exclusão bloqueada
    com mensagem.
  - Conta sem uso: excluída normalmente.

## [0.3.30.0] - 2026-07-08

### Corrigido

- Aba **Pessoas**: KPIs globais (`totalDividas`, `totalEmAberto`,
  `totalPago`) somavam **todo** o array `dividas`, sem checar se
  `pessoaId` ainda existia em `pessoas`. Uma dívida órfã (pessoa excluída
  fora do fluxo normal, ou dado legado/backup antigo restaurado) inflava o
  "Total de Dívidas" para sempre, mas nunca aparecia em nenhum card de
  pessoa — não havia como o usuário achar e excluir o registro. Agora um
  painel "Dívidas sem pessoa vinculada" aparece na lista sempre que houver
  dívida órfã, com opção de exclusão (reaproveita `delDivida`).
- Importação de fatura de cartão (OFX): créditos (`TRNTYPE=CREDIT`, já
  classificados como `tipo:"receita"` desde a `v0.3.26.8`/`DEC-0027`)
  sempre reduziam a fatura da **competência do lote inteiro** importado
  (`impCompetencia`), mesmo quando o crédito na real pertencia a outra
  fatura (pagamento da fatura anterior, crédito de reparcelamento de
  compra à vista, ou estorno). Agora cada linha de crédito exige
  classificação manual na prévia antes de liberar a importação.

### Adicionado

- `src/utils/dividaUtils.js` — `getOrphanDividas(dividas, pessoas)`.
- `src/services/cardImportService.js` — `classifyImportedCardCreditRows`,
  `isCardCreditRowBlocked`, `resolveCardCreditCompetencia` e as constantes
  `CARD_CREDIT_TYPES` (`pagamento_fatura_anterior`, `parcelamento_avista`,
  `estorno`). Na prévia de importação de cartão, toda linha `tipo:"receita"`
  passa a exigir uma classificação manual (select) e, quando aplicável, uma
  competência de destino (`<input type="month">`) — a linha fica bloqueada
  para seleção enquanto não for classificada.
- `confirmImport` (`src/App.jsx`): créditos classificados como "pagamento
  da fatura anterior" são desconsiderados (não geram lançamento, mas
  entram no relatório da importação em `creditosDesconsiderados`/
  `creditosDesconsideradosDetalhe`, para não sumir silenciosamente).
  Créditos de "reparcelamento de compra à vista" ou "estorno" são gravados
  com `competencia` igual à competência de destino escolhida pelo usuário
  (não mais sempre `impCompetencia`), e a fatura de destino é checada
  contra `isInvoiceClosedForNewEntries` antes de salvar — impede alterar
  silenciosamente uma fatura já fechada (RN012). Novo campo opcional
  `creditoTipo` é persistido no lançamento salvo para rastreabilidade.
- `src/services/aiCategorizationService.js` — scaffold para sugestão de
  categoria por IA nas importações: `isAiCategorizationEnabled(params)` e
  `suggestCategoryWithAI(...)`. Nesta versão **não há chamada real de
  rede** (retorna sempre `{ ok:false, reason:"not_configured" }`) — decisão
  de adiar a integração até a escolha do provedor/chave, para não expor
  API key no código-cliente (app não tem backend). Novo campo opcional
  `params.aiCategorization = { enabled:false }`, com toggle "Sugestão de
  categoria por IA (beta)" em Parâmetros (não altera nenhum comportamento
  real de importação nesta versão).

### Alterado

- Ajuste pós-validação com fatura real do BB (`test-data/importacoes/`,
  pasta local ignorada pelo Git): ao classificar um crédito como "crédito
  de reparcelamento de compra à vista", a competência de destino agora é
  preenchida automaticamente com a competência do próprio lote importado
  (editável pelo usuário) — na prática, o reparcelamento de uma compra à
  vista quase sempre entra na mesma fatura em que a primeira parcela nova
  aparece (confirmado no arquivo real: a compra "Booking.com Hotel" e o
  crédito `#PCV PARC.COMP.VIST` caem na mesma competência). Crédito
  classificado como "estorno" continua sem preenchimento automático (o
  valor pode pertencer a uma competência diferente da do lote).
- Rótulo da classificação `estorno` alterado de "Estorno de compra" para
  "Estorno de juros", após validação com fatura real mostrar que o caso
  observado era devolução de juros de pagamento anterior
  (`DEVOLUCAO JUROS PAGAMENTO TITULO`), não estorno de uma compra.
- Versão visual da aplicação atualizada para `v0.3.30.0`.
- `docs/02-REGRAS-DE-NEGOCIO.md`: nova `RN030` (classificação manual de
  créditos de cartão na importação).
- `docs/04-MODELO-DE-DADOS-E-LOCALSTORAGE.md`: documentados os campos
  opcionais novos (`creditoTipo` em lançamento de cartão,
  `aiCategorization` em `params`).

### Migração

- Nenhuma chave nova de LocalStorage. `creditoTipo` (lançamento de cartão)
  e `aiCategorization` (dentro de `params`) são campos opcionais, com
  fallback seguro para dados antigos que não os possuem — mesmo padrão já
  usado por `importBatchId`/`autoCategoryRules`. Não foi necessária
  entrada em `migrationPipeline.js` (não há transformação de dado antigo,
  só leitura com padrão seguro na ausência do campo).
- `creditoCompetencia` existe só durante a prévia de importação (estado em
  memória) — não é persistido; o lançamento salvo usa esse valor apenas
  para preencher o campo `competencia` já existente.
- A seleção automática de linhas ao carregar o arquivo (e após corrigir
  divergência de parcelamento) também passou a excluir créditos ainda não
  classificados — sem isso, a linha aparecia marcada (checkbox desabilitado
  mas `checked`) antes mesmo de o usuário classificar, o que a validação em
  `confirmImport` já bloqueava, mas de forma confusa na revisão visual.

### Testes

- `npx vitest run`: suíte completa passando (55 testes), incluindo os
  novos arquivos `tests/dividaUtils.test.js`,
  `tests/cardImportCredit.test.js`, `tests/cardInvoiceService.test.js`
  (regressão de `signedCardAmount` com/sem `creditoTipo`) e
  `tests/aiCategorizationService.test.js`.
- `npm run build`: aprovado (mesmo alerta não bloqueante de chunk > 500 kB
  já conhecido, sem regressão).
- Validado manualmente no preview (via automação de navegador, nesta
  sessão):
  - Dívida órfã: injetado registro com `pessoaId` inexistente e total
    10.000 (reproduzindo o sintoma relatado) — painel apareceu, exclusão
    funcionou, KPI voltou a `R$ 0,00`.
  - Importação de OFX de cartão com crédito classificado como "estorno":
    competência de destino diferente da competência do lote foi respeitada
    no lançamento salvo (`competencia` = mês escolhido, não o do lote).
  - Mesmo cenário com competência de destino já fechada: importação
    bloqueada com mensagem informando a fatura fechada (RN012).
  - Crédito classificado como "pagamento da fatura anterior": nenhum
    lançamento criado; apareceu em "Créditos desconsiderados" no relatório
    da importação.
  - Toggle "Sugestão de categoria por IA (beta)" em Parâmetros: liga/
    desliga, persiste após reload, sem nenhum console error e sem alterar
    o resultado de nenhuma importação.
- Validado adicionalmente com **faturas reais** do Banco do Brasil
  (`CC_BBVISA_062026.ofx`, 125 transações, e `CC_BBVISA_072026.ofx`, 60
  transações — fornecidas pelo usuário em `test-data/importacoes/`, pasta
  local ignorada pelo Git): os 3 créditos reais de junho e o 1 de julho
  foram identificados e bloqueados corretamente para classificação manual;
  o script de verificação (`node` + `parseOFX`/`classifyImportedCardCreditRows`
  diretamente) confirmou que, sem a correção desta versão, o crédito de
  pagamento em agência (R$ 12.061,77) reduziria a fatura de junho para um
  total negativo (-R$ 72,66) em vez de afetar a fatura correta; também
  confirmado que o `TRNAMT` de um `TRNTYPE=CREDIT` do BB pode vir com
  qualquer sinal (positivo em junho, negativo em julho para o mesmo tipo de
  lançamento), reforçando por que a classificação usa `TRNTYPE`, não o
  sinal. Testado também via UI real (upload do arquivo no preview): as 3
  linhas de crédito reais foram classificadas (reparcelamento com
  competência auto-preenchida = competência do lote, estorno de juros com
  competência manual, pagamento de fatura anterior descartado) e a
  importação final gravou exatamente o esperado.
- Extratos bancários reais (`extrato_BB1.ofx`, `extratoBB2.ofx`) também
  verificados: BB Rende Fácil continua sendo ignorado corretamente (16 e 2
  ocorrências, respectivamente).

## [0.3.30.1] - 2026-07-08

### Corrigido

- Prévia de importação de fatura de cartão (`src/App.jsx`): a linha de
  crédito (RN030) começa desmarcada até ser classificada — mudança
  correta introduzida na v0.3.30.0, para substituir o comportamento
  anterior confuso (linha marcada e desabilitada). Porém, depois de o
  usuário classificar a linha (escolher o tipo em `creditoTipo` e, quando
  exigido, a competência de destino em `creditoCompetencia`), o checkbox
  passava a ficar habilitado, mas **continuava desmarcado** — nada voltava
  a marcá-lo. A linha era excluída da importação silenciosamente, sem
  nenhum aviso no relatório final (o aviso "Créditos desconsiderados"
  existe só para a classificação `pagamento_fatura_anterior`, que é
  descarte intencional; não havia aviso para crédito apenas deixado
  desmarcado). Corrigido nos dois `onChange` da prévia (`<select>` de
  `creditoTipo` e `<input type="month">` de `creditoCompetencia`): após
  atualizar a classificação, o sistema reavalia `isCardCreditRowBlocked`
  com o valor recém-informado e marca o checkbox automaticamente
  (`setImpTog`) assim que a linha deixa de estar bloqueada.
- Relatado pelo usuário: a fatura de junho/2026 do cartão BBVISA fechava
  em `R$ 13.005,53` no sistema contra `R$ 11.893,21` no banco — os 3
  créditos reais do arquivo (`test-data/importacoes/CC_BBVISA_062026.ofx`,
  pasta local ignorada pelo Git) nunca chegavam a ser importados por causa
  deste bug.

### Alterado

- Versão visual da aplicação atualizada para `v0.3.30.1`.
- `docs/02-REGRAS-DE-NEGOCIO.md`: `RN030` ganhou um critério adicional
  explicitando que classificar a linha deve marcá-la automaticamente para
  importação.
- `docs/05-CHECKLIST-DE-VALIDACAO.md`: novo item na seção de importação
  para checar o auto-marcar da linha de crédito ao ser classificada.

### Migração

- Nenhuma. Mudança de comportamento de UI em memória (estado `impTog`/
  prévia de importação), sem campo novo, sem chave nova, sem alteração em
  dado persistido no LocalStorage.

### Testes

- `npm test` (vitest): 55/55 passando (sem teste automatizado novo para
  este `onChange` — cobertura por validação manual nesta sessão).
- Validado manualmente no preview: undo do lote antigo da BBVISA (sem os
  créditos), reimportação de `CC_BBVISA_062026.ofx` (competência 2026-06),
  classificação dos 3 créditos reais (`pagamento_fatura_anterior`,
  `parcelamento_avista`, `estorno`). Cada linha marcou sozinha ao ser
  classificada. Fatura final de junho/2026 da BBVISA: `R$ 11.989,11`
  (antes desta correção: `R$ 13.005,53`).
- Item aberto, não bloqueia este fechamento: ainda resta diferença de
  aproximadamente `R$ 95,90` frente ao valor real do banco
  (`R$ 11.893,21`), não relacionada a este bug — possivelmente um
  lançamento de IOF/rotativo tratado de forma diferente. Fica registrado
  como investigação futura.

## [0.3.32.1] - 2026-07-08

Patch da classificação de créditos de cartão (feature da v0.3.30), encontrado
durante a validação da v0.3.32 com a fatura real BBVISA de junho/2026.

### Corrigido

- **Créditos de cartão ficavam silenciosamente de fora da importação**,
  deixando o totalizador da fatura alto. Diagnóstico com o arquivo real
  `CC_BBVISA_062026.ofx`: os 3 créditos (pagamento da fatura anterior
  R$ 12.061,77; devolução R$ 9,62; reparcelamento à vista `#PCV` R$ 1.006,80)
  entravam **bloqueados** exigindo classificação manual + competência de
  destino digitada à mão. Como o "Sel. tudo" ignora linhas bloqueadas e não
  havia default de competência, era fácil importar só as despesas e deixar os
  créditos de fora — a fatura fechava em R$ 13.005,53 em vez de R$ 11.989,11.
  O totalizador (`computeCardInvoice`) sempre esteve correto (subtrai
  receitas); o problema era a montante, na classificação. Correções:
  1. **Pré-sugestão do tipo do crédito pelo memo** (`suggestCardCreditType`
     em `cardImportService.js`): `DEVOLUCAO`/`ESTORNO` → estorno;
     `#PCV`/`PARC.COMP.VIST`/`reparcel` → reparcelamento à vista;
     `PGTO`/`PAGTO`/`PGTO CASH` → pagamento da fatura anterior. A ordem trata
     o caso real "DEVOLUCAO JUROS PAGAMENTO TITULO" (contém "PAGAMENTO") como
     estorno. É pré-preenchimento, editável na prévia.
  2. **Default da competência de destino = competência da importação** para
     estorno/reparcelamento (o crédito aparece naquela fatura, então a abate
     por padrão). Com isso o crédito entra desbloqueado e é selecionado.
  3. **Aviso visível na prévia** listando créditos ainda sem classificação e
     a soma, avisando que ficarão de fora — fim da exclusão silenciosa.
  Reproduzido de ponta a ponta: com as correções, a fatura de junho/2026 da
  BBVISA fecha em **R$ 11.989,11** (a diferença de ~R$ 95,90 para o valor do
  banco, R$ 11.893,21, é o item separado já registrado na v0.3.30.1).

### Alterado

- Versão visual da aplicação atualizada para `v0.3.32.1`.

### Migração

- Nenhuma. Sem chave/schema novo; muda só o pré-preenchimento da prévia de
  importação (estado em memória).

### Testes

- `npm test` (Vitest): **82/82** (antes: 76/76; +6 de `suggestCardCreditType`
  e do default de competência em `classifyImportedCardCreditRows`).
  `npm run build` aprovado.

## [0.3.32.0] - 2026-07-08

Reatribuição em massa de lançamentos e consolidação de UX (dialogs + toast
com undo). Desenvolvida na branch `feature/v0.3.32-reatribuicao-lancamentos`
para mergear em `develop` após a aprovação da v0.3.31. Fecha os itens de
reatribuição e de UX do bloco "v0.3.32" de `docs/07-ROADMAP-E-BACKLOG.md`.
Ver `DEC-0033`.

### Adicionado

- **Mover lançamentos antes de excluir cartão/conta** (evolução do bloqueio
  simples de `DEC-0028`): ao excluir um cartão/conta em uso, um diálogo
  oferece mover todos os lançamentos vinculados para outro cartão/conta e
  então excluir. Ao mover entre cartões, a competência de cada lançamento é
  **recalculada pelo ciclo de fechamento do cartão de destino** (RN012, via
  `getCardInvoiceCompetence`). Despesas compartilhadas, simulações, cartões
  vinculados (conta de pagamento) e registros de fatura são repontados na
  mesma operação atômica.
- **Recategorizar categoria por completo**: novo botão `↦` em cada categoria
  move todos os lançamentos e despesas compartilhadas dela (e subcategorias)
  para outra categoria de uma vez. A categoria de origem não é excluída.
  (Trocas pontuais por lançamento já existiam e não foram alteradas.)
- **`src/services/reassignmentService.js`** (novo, puro/atômico): funções
  `moveCardTransactions`, `moveAccountTransactions`, `recategorizeCategory`,
  cada uma devolvendo o snapshot completo (padrão `cardInvoiceOperations`).
  12 casos em `tests/reassignmentService.test.js`.
- **`src/components/ui/ConfirmDialog.jsx`** (novo): modal de confirmação
  reutilizável (aceita `children` para os selects de destino), substituindo
  `window.confirm`/`alert` nativos nos fluxos de exclusão de cartão, conta e
  categoria da aba Parâmetros.
- **`src/components/ui/Toast.jsx`** (novo): `useToasts` + `ToastHost`, toast
  com ação **Desfazer** que restaura o snapshot anterior à ação — dá
  feedback visível e reversível a mover/excluir.

### Alterado

- Versão visual da aplicação atualizada para `v0.3.32.0`.
- Guardrail RN012: a reatribuição de cartão é **bloqueada** (com mensagem
  clara) se houver fatura fechada na origem, ou se a competência recalculada
  cair numa fatura já fechada do destino — nunca se altera fatura fechada
  silenciosamente. A transação de pagamento de fatura (`natureza:"fatura_
  cartao"`, origem "corrente") não é movida como compra.

### Migração

- Nenhuma. Nenhuma chave/prefixo/schema novo. As mutações apenas reatribuem
  campos já existentes (`cartaoId`/`contaId`/`catId`/`competencia` + aliases
  EN) em registros existentes, pela fronteira normal de persistência.

### Testes

- `npm test` (Vitest): **76/76 passando** (antes: 64/64; +12 do serviço de
  reatribuição). `npm run build` aprovado (mantém o alerta conhecido de
  chunk > 500 kB, endereçado no backlog da v0.3.33).
- Validado no preview: fluxo cartão (diálogo → mover 4 lançamentos para
  outro cartão → cartão excluído → toast → **Desfazer restaura cartão e
  lançamentos**), diálogo de recategorização com destinos folha, badge
  `v0.3.32.0`, sem erros de console.

## [0.3.31.0] - 2026-07-08

Versão de qualidade e limpeza técnica. Sem alteração de regra de negócio,
sem campo novo e sem alteração de LocalStorage. Fecha itens do backlog
"v0.3.31 — Qualidade e limpeza técnica" de `docs/07-ROADMAP-E-BACKLOG.md`.

### Adicionado

- **CI (GitHub Actions)**: novo workflow `.github/workflows/ci.yml` roda
  `npm test` (Vitest) e `npm run build` a cada push e pull request em
  `main` e `develop`. Trava regressões antes do merge, cumprindo a etapa
  "CI com GitHub Actions" da pirâmide de testes de `docs/CLAUDE.md`. Item
  pendente desde a sessão de 2026-07-05.
- **Suíte golden master de migração**: novo
  `tests/migrationGoldenMaster.test.js` (6 casos) congela um dataset antigo realista (campos PT/EN mistos,
  conflitantes e já consistentes) e trava a saída exata de
  `migrationPipeline.js`. Garante que qualquer passo de migração futuro que
  altere silenciosamente a forma dos dados de um usuário existente quebre o
  teste e force decisão consciente. Cobre também idempotência, pureza (não
  muta a entrada), preservação de campos fora dos pares dual-write e
  identidade referencial.
- **Helper `isCardCreditDiscardedOnImport`** em
  `src/services/cardImportService.js`: centraliza a regra de que créditos
  classificados como "pagamento da fatura anterior" não viram lançamento.
  Coberto por 3 casos em `tests/cardImportCredit.test.js`.

### Corrigido

- **"Total selecionado" da prévia de importação de cartão**
  (`src/App.jsx`): o total e o contador da prévia somavam créditos
  classificados como "pagamento da fatura anterior", que o `confirmImport`
  descarta — o número previsto na prévia não batia com o que era de fato
  importado. Agora a prévia usa `impSelectedForImport` (memo que exclui os
  créditos descartados no modo cartão), e o `confirmImport` passou a usar o
  mesmo helper `isCardCreditDiscardedOnImport`, eliminando o risco de drift
  entre prévia e importação efetiva. Ajuste cosmético — nenhum dado
  persistido estava incorreto.

### Removido

- **Diretório morto `src/src/`** (7 arquivos rastreados no Git: cópia
  obsoleta de `App.jsx`, `constants/`, `hooks/`, `services/` e `utils/`).
  Confirmado sem nenhum import apontando para ele (`main.jsx` importa
  `./App.jsx`); gerava ruído em buscas/greps. Nenhuma funcionalidade
  afetada.

### Alterado

- Versão visual da aplicação atualizada para `v0.3.31.0`.

### Migração

- Nenhuma. Nenhuma chave, prefixo, schema ou campo persistido foi alterado.

### Testes

- `npm test` (Vitest): **64/64 passando** (antes: 55/55; +6 golden master,
  +3 do helper de crédito). `npm run build` aprovado (mantém o alerta
  conhecido e não bloqueante de chunk > 500 kB, endereçado no backlog da
  v0.3.33).
- Smoke check no preview: app sobe sem erro de console, badge exibe
  `v0.3.31.0`, aba Importar renderiza sem regressão. O fluxo completo do
  fix de "Total selecionado" depende de arquivos OFX reais (locais,
  ignorados pelo Git), então foi travado por teste unitário do helper em
  vez de automação de UI.

### Backlog não incluído nesta versão

- Reatribuição assistida na exclusão (mover lançamentos antes de excluir),
  candidata desde `DEC-0028`: **adiada deliberadamente**. O próprio backlog
  condiciona a implementação a avaliar antes se o bloqueio simples atual
  incomoda o usuário — é feature nova, não limpeza técnica. Fica para
  decisão do usuário.


## [0.3.33.0] - 2026-07-08

Transferências entre contas. Ver `DEC-0034`.

### Adicionado

- **Transferência entre contas** como movimento nulo contábil: uma
  transferência = duas transações ligadas por `transferId`, ambas
  `natureza:"transferencia"` (saída/despesa na origem, entrada/receita no
  destino). Não conta como receita nem despesa; só afeta o saldo das contas.
- `src/services/accountingService.js` — ponto ÚNICO de agregação contábil
  (`isMovimentoContabil`, `isReceitaContabil`, `isDespesaContabil`,
  `somaReceitas`, `somaDespesas`). Centraliza a exclusão de
  `natureza:"transferencia"` das somas de receita/despesa.
- `src/services/transferService.js` — operações PURAS (padrão snapshot
  completo): `createTransfer` (par novo), `linkAsTransfer`/`unlinkTransfer`
  (associar/desassociar lançamentos já existentes), `removeTransfer`
  (excluir o par), `isTransferEligible`, `findTransferCandidates` e
  `detectTransferCandidates` (auto-detecção na importação).
- UI: botão **⇄ Nova Transferência** e modal na aba Lançamentos; ação
  **⇄ Associar** por linha (com seletor da contraparte de mesmo valor/conta
  diferente); badge de transferência na lista; diálogo **⇄ Transferências
  detectadas** após importar extrato bancário/vale.

### Alterado

- ~10 pontos de agregação P&L (Dashboard, gasto por categoria, tendência
  6 meses, `projectionService`) passaram a excluir transferência via
  `accountingService`. Sites de **saldo/fluxo por conta**
  (`movimentoContaMes`, entradas/saídas por conta) foram deliberadamente
  mantidos incluindo as duas pernas (a transferência é caixa real da conta).
- `confirmImport` (bancário/vale) constrói os lançamentos com id antes de
  gravar e roda a auto-detecção de transferências, usando a janela
  `params.duplaEntradaDias`. Importação normal preservada.
- Versão visual atualizada para `v0.3.33.0-dev`.

### Corrigido

- Não aplicável (feature nova; nenhum número existente muda para quem não
  usa transferência — travado por caracterização no `accountingService`).

### Removido

- Não aplicável.

### Migração

- **Nenhuma.** Aditivo por ausência (RN002): os campos novos (`transferId`,
  `transferOrigin`, `transferContraContaId` e `natureza:"transferencia"`) só
  existem em transferências; dados antigos não os têm e seguem como movimento
  contábil normal. Sem chave nova, sem bump de `LS_VERSION`. Backup/restauração
  cobre as pernas (já são `trans`) — validado por caracterização.

### Testes

- `npm test` (Vitest): **119/119 passando** (antes: 91/91; +28:
  `accountingService`, `transferService` — incluindo vínculo, desvínculo e
  auto-detecção — e `transferBackup` do ciclo de restauração). `npm run build`
  aprovado (mantém o alerta conhecido de chunk > 500 kB).
- Verificação no preview (app real): criação manual do par, vínculo de
  existentes e auto-detecção numa importação de extrato bancário — todos com
  exclusão correta do P&L e saldo por conta preservado.
