# Roadmap e Backlog — Finanças PRO

## Objetivo

Organizar a evolução do aplicativo em etapas seguras.

## Roadmap macro

### Etapa 1 — Estabilização local

Objetivo: garantir que a aplicação rode de forma previsível localmente.

Itens:

- [x] Confirmar estrutura React + Vite na versão base validada pelo usuário.
- [x] Confirmar scripts `npm install`, `npm run dev`, `npm run build` na validação local da versão base.
- [ ] Criar README de execução local.
- [x] Confirmar funcionamento local da versão base, conforme validação informada pelo usuário.
- [x] Confirmar execução local da versão base, conforme validação informada pelo usuário.
- [x] Validar build da versão base, conforme validação informada pelo usuário.
- [ ] Validar build da versão `App_backup_restauracao_revisado.jsx`.

### Etapa 2 — Proteção da persistência

Objetivo: evitar perda de dados.

Itens:

- [x] Mapear chaves atuais do LocalStorage para backup conservador.
- [ ] Criar `storageKeys.js`.
- [ ] Criar `storageService.js`.
- [ ] Criar versionamento de dados.
- [ ] Criar `migrationService.js`.
- [x] Criar roteiro de teste manual de backup/restauração.
- [ ] Executar teste manual de backup/restauração na versão revisada.

### Etapa 2.5 — Reutilização e avaliação de bibliotecas

Objetivo: estabelecer disciplina técnica antes de ampliar a modularização.

Itens:

- [x] Criar diretriz de reutilização antes de criação técnica.
- [x] Definir ordem de decisão: projeto existente, React nativo, biblioteca compatível, código próprio.
- [x] Atualizar checklist para validar reaproveitamento e novas dependências.
- [x] Atualizar prompts padrão para exigir avaliação prévia.
- [ ] Mapear componentes e funções repetidas no `App.jsx`.
- [ ] Criar inventário de componentes reaproveitáveis existentes.
- [ ] Criar inventário de funções utilitárias candidatas a extração.
- [ ] Definir primeira biblioteca candidata somente após necessidade concreta.
- [ ] Atualizar `package.json` apenas quando houver decisão técnica aprovada.

### Etapa 3 — Modularização de baixo risco

Objetivo: reduzir tamanho do `App.jsx` sem alterar comportamento.

Itens:

- [ ] Extrair constantes.
- [ ] Extrair dados iniciais.
- [ ] Extrair formatadores monetários.
- [ ] Extrair utilitários de data.
- [ ] Extrair hook de LocalStorage.
- [ ] Extrair componentes visuais simples.

### Etapa 4 — Organização das telas

Objetivo: separar as páginas principais.

Itens:

- [ ] Criar `pages/DashboardPage.jsx`.
- [ ] Criar `pages/TransactionsPage.jsx`.
- [ ] Criar `pages/AccountsPage.jsx`.
- [ ] Criar `pages/CardsPage.jsx`.
- [ ] Criar `pages/ProjectionsPage.jsx`.
- [ ] Criar `pages/SimulationsPage.jsx`.
- [ ] Criar `pages/ImportPage.jsx`.
- [ ] Criar `pages/ParametersPage.jsx`.

### Etapa 5 — Regras de cartão e fatura

Objetivo: consolidar cartão, fatura, ajustes e pagamentos.

Itens:

- [ ] Exigir conta associada no cadastro de cartão.
- [ ] Migrar cartões antigos sem `accountId`.
- [ ] Criar ou revisar fatura mensal.
- [ ] Criar ajuste manual de cartão.
- [ ] Fechar fatura.
- [ ] Gerar pagamento previsto no mês subsequente.
- [ ] Permitir baixa total.
- [ ] Permitir baixa parcial.
- [ ] Controlar saldo pendente.
- [ ] Evitar duplicidade no saldo da conta.

### Etapa 6 — Lançamentos previstos e recorrências

Objetivo: melhorar previsibilidade financeira.

Itens:

- [ ] Criar modelo de recorrência.
- [ ] Gerar receitas previstas.
- [ ] Gerar despesas previstas.
- [ ] Gerar pagamento previsto de fatura.
- [ ] Baixar lançamento previsto.
- [ ] Baixar parcialmente.
- [ ] Evitar duplicidade mensal.
- [ ] Exibir status claramente.

### Etapa 7 — Projeções e relatórios

Objetivo: tornar os cálculos mais confiáveis.

Itens:

- [ ] Centralizar cálculo de saldo.
- [ ] Centralizar cálculo de fatura.
- [ ] Revisar dashboard.
- [ ] Revisar projeções mensais.
- [ ] Separar previsto x realizado.
- [ ] Criar filtros por conta, cartão e categoria.
- [ ] Criar alertas de vencimento.

### Etapa 8 — Importação

Objetivo: melhorar entrada de dados externos.

Itens:

- [ ] Revisar parser CSV.
- [ ] Revisar parser OFX/QFX.
- [ ] Criar tela de prévia.
- [ ] Permitir classificação antes de salvar.
- [ ] Evitar duplicidade.
- [ ] Registrar origem da importação.
- [ ] Permitir desfazer lote importado, se possível.

### Etapa 9 — Qualidade e segurança

Objetivo: aumentar confiabilidade.

Itens:

- [ ] Criar testes unitários para funções financeiras.
- [ ] Criar testes de migração.
- [ ] Criar testes de backup/restauração.
- [ ] Criar validações de formulário.
- [ ] Criar tratamento global de erro.
- [ ] Criar aviso de backup antes de operações destrutivas.

### Etapa 10 — Preparação futura para backend

Objetivo: deixar o app preparado para evolução futura, sem exigir backend agora.

Itens:

- [ ] Isolar camada de dados.
- [ ] Criar interfaces de repositório.
- [ ] Evitar acesso direto ao LocalStorage em componentes.
- [ ] Separar regra de negócio da UI.
- [ ] Documentar modelo de dados.
- [ ] Avaliar sincronização futura.

## Backlog funcional

### Alta prioridade

- [ ] Cartão vinculado à conta.
- [ ] Ajuste manual de fatura.
- [ ] Fechamento de fatura.
- [ ] Pagamento previsto da fatura.
- [ ] Baixa total/parcial.
- [ ] Saldos iniciais mensais.
- [ ] Migração de LocalStorage.
- [ ] Checklist de validação pós-ajuste.

### Média prioridade

- [ ] Recorrências avançadas.
- [ ] Controle de parcelas.
- [ ] Melhorias de importação.
- [ ] Melhorias de backup.
- [ ] Relatórios por categoria.
- [ ] Relatórios por pessoa.
- [ ] Relatórios por cartão.
- [ ] Filtros avançados.

### Baixa prioridade

- [ ] Temas visuais.
- [ ] Animações.
- [ ] Exportação PDF.
- [ ] Exportação Excel.
- [ ] Login local.
- [ ] Sincronização em nuvem.
- [ ] Multiusuário.

## Backlog técnico

- [ ] Reduzir tamanho do `App.jsx`.
- [ ] Criar camada de storage.
- [ ] Criar camada de migração.
- [ ] Criar utilitários financeiros.
- [ ] Criar componentes reutilizáveis.
- [ ] Criar páginas separadas.
- [ ] Criar contexto financeiro.
- [ ] Criar testes.
- [ ] Melhorar tratamento de erro.
- [ ] Melhorar tipagem com JSDoc ou TypeScript futuramente.

## Critério de priorização

Priorizar o que:

1. Evita perda de dados.
2. Corrige cálculo financeiro.
3. Preserva consistência de fatura e conta.
4. Reduz risco técnico.
5. Facilita próximas evoluções.
6. Melhora a experiência do usuário.

## Atualização de backlog — Pós-evoluções de 2026-06-27

### Concluído nesta rodada

- [x] Ignorar BB Rende Fácil na importação bancária.
- [x] Criar relatório de importação.
- [x] Criar controle de lote importado.
- [x] Permitir desfazer lote importado.
- [x] Criar regras editáveis de autocategorização.
- [x] Melhorar autocategorização automática.
- [x] Exibir detalhamento mensal por pessoa para despesas compartilhadas.
- [x] Adicionar botão Nova Conta na aba Contas.
- [x] Manter cadastro de contas em Parâmetros.
- [x] Exportar despesas de cartão em TXT.
- [x] Permitir informar competência da fatura no lançamento do cartão.
- [x] Calcular competência de cartão conforme fechamento.
- [x] Persistir simulações.
- [x] Refazer simulações com situação atualizada.
- [x] Ajustar simulações para impacto por competência da fatura.

### Alta prioridade — Próximas etapas recomendadas

- [x] Validar versão base em projeto completo com `npm install`, `npm run dev` e `npm run build`, conforme informado pelo usuário.
- [ ] Validar versão `App_backup_restauracao_revisado.jsx` em projeto completo com `npm run dev`, `npm run build` e `npm run preview`.
- [x] Incluir `simulacoes` e possíveis metadados de importação no backup/restauração.
- [ ] Criar confirmação visual mais forte antes de desfazer lote importado.
- [ ] Criar histórico persistido de relatórios de importação.
- [ ] Criar filtro de lotes importados por data, origem e conta/cartão.
- [ ] Criar tela consolidada de faturas por competência.
- [ ] Criar validação para impedir competência manual muito distante sem aviso.

### Média prioridade

- [ ] Extrair `importService.js`.
- [ ] Extrair `categoryService.js`.
- [ ] Extrair `cardInvoiceService.js`.
- [ ] Extrair `simulationService.js`.
- [ ] Extrair `peopleSharedService.js`.
- [ ] Criar exportação CSV além de TXT.
- [ ] Criar relatório por pessoa em formato exportável.
- [ ] Permitir baixa parcial em despesas compartilhadas.

### Baixa prioridade

- [ ] Melhorias visuais na tela de relatórios de importação.
- [ ] Gráficos de evolução por pessoa.
- [ ] Gráficos de impacto de simulações.
- [ ] Exportação PDF de faturas e simulações.


### Atualização de backlog — Encerramento após revisão de backup/restauração

### Concluído nesta etapa

- [x] Receber versão base `App.jsx` validada pelo usuário.
- [x] Gerar versão `App_backup_restauracao_revisado.jsx`.
- [x] Reforçar exportação de backup com envelope e snapshot bruto das chaves conhecidas do LocalStorage.
- [x] Incluir simulações no backup/restauração com compatibilidade para `simulacoes`, `sims` e `simulations`.
- [x] Preservar metadados de importação já existentes nos lançamentos importados.
- [x] Adicionar validação antes da restauração para evitar sobrescrita com JSON inválido.
- [x] Validar sintaxe da versão revisada via TypeScript `transpileModule`.

### Alta prioridade — Ao retomar

- [ ] Substituir localmente `src/App.jsx` por `App_backup_restauracao_revisado.jsx`.
- [ ] Executar `npm run dev`.
- [ ] Executar `npm run build`.
- [ ] Executar `npm run preview`.
- [ ] Testar exportação de backup com simulações cadastradas.
- [ ] Testar restauração do backup gerado.
- [ ] Testar restauração de backup inválido e confirmar que dados atuais não são apagados.
- [ ] Testar backup após importação com `importBatchId`.
- [ ] Atualizar changelog após validação local da versão revisada.

## Backlog técnico — Reutilização e bibliotecas

### Alta prioridade

- [ ] Mapear componentes repetidos no `App.jsx` antes da próxima refatoração.
- [ ] Mapear funções financeiras duplicadas antes de criar novos cálculos.
- [ ] Criar padrão de formulário reutilizável antes de novas telas de cadastro.
- [ ] Criar padrão de modal/confirmação reutilizável antes de novas ações destrutivas.
- [ ] Avaliar React Hook Form somente quando houver formulário complexo real.
- [ ] Avaliar Zod somente quando houver necessidade concreta de schema compartilhado.

### Média prioridade

- [ ] Criar inventário de bibliotecas candidatas com decisão: adotada, descartada ou adiada.
- [ ] Avaliar biblioteca de datas após extração de `dateUtils.js`.
- [ ] Avaliar biblioteca de CSV após extração de `importService.js`.
- [ ] Avaliar biblioteca de tabelas após consolidação de filtros e paginação.

### Baixa prioridade

- [ ] Avaliar TanStack Query apenas quando houver backend/API.
- [ ] Avaliar troca ou padronização de biblioteca de gráficos somente após estabilização funcional.


## Atualização de backlog — Versão 0.3.2 — 2026-06-29

### Concluído nesta etapa

- [x] Exibir identificação visual da versão do aplicativo.
- [x] Criar modal padronizado para campo obrigatório não preenchido.
- [x] Destacar campo obrigatório que bloqueou a gravação.
- [x] Criar accordion nas telas de **Contas** e **Cartões**.
- [x] Permitir recategorização após gravação com ação protegida por botão.
- [x] Permitir recategorização nas abas **Lançamentos**, **Contas** e **Cartões**.
- [x] Criar filtros na aba **Lançamentos** por data, categoria principal, origem, tipo e status.
- [x] Criar histórico de despesas compartilhadas quitadas.
- [x] Ajustar máscara de competência em despesas compartilhadas para `mm/aaaa`.
- [x] Corrigir restauração de limites/metas por categoria.

### Alta prioridade ao retomar

- [x] Validar localmente a versão `App_ajustes_v0_3_2.jsx` com `npm run dev`, conforme informado pelo usuário em 2026-06-29.
- [x] Validar build da versão `App_ajustes_v0_3_2.jsx` com `npm run build`, conforme informado pelo usuário em 2026-06-29.
- [x] Validar preview da versão `App_ajustes_v0_3_2.jsx` com `npm run preview`, após ajuste local informado pelo usuário em 2026-06-29.
- [ ] Executar teste manual completo dos filtros de lançamentos.
- [ ] Executar teste manual de recategorização nas três abas.
- [ ] Executar teste de backup/restauração com metas por categoria.
- [ ] Executar teste de histórico de despesas compartilhadas após baixa total das pendências.
- [x] Registrar no changelog a validação local de `npm run dev`, `npm run build` e `npm run preview` após conclusão.

### Próximos candidatos técnicos

- [ ] Extrair componente reutilizável de filtro de lançamentos após validação funcional.
- [ ] Extrair componente reutilizável de recategorização protegida.
- [ ] Extrair componente reutilizável de modal de campo obrigatório.
- [ ] Avaliar extração de service para despesas compartilhadas somente após estabilização do histórico.

## Atualização de backlog — Revisão da tela Projeções — 2026-06-29

### Diagnóstico

A tela **Projeções** deve ser revisada porque, no comportamento atual, funciona principalmente como uma estimativa de gastos futuros baseada em médias ou valores históricos. Dessa forma, não entrega sua principal finalidade: projetar a situação financeira futura considerando saldo inicial, receitas previstas, despesas previstas, faturas, parcelas, recorrências, baixas totais/parciais e saldo projetado por competência.

### Problema de negócio

A tela pode induzir o usuário a interpretar uma estimativa de despesas como projeção financeira completa. Para o Finanças PRO, a projeção precisa responder como ficará o futuro financeiro mês a mês, e não apenas quanto tende a ser gasto.

### Alta prioridade funcional

- [ ] Revisar conceitualmente a tela **Projeções** para que deixe de ser apenas estimativa de gastos e passe a projetar fluxo financeiro futuro.
- [ ] Exibir projeção mensal com saldo inicial, receitas previstas, receitas realizadas, despesas previstas, despesas realizadas, faturas previstas, faturas pagas, saldo pendente e saldo projetado.
- [ ] Considerar corretamente despesas de cartão pela fatura/pagamento, evitando tratar compra no cartão como débito direto em conta.
- [ ] Considerar lançamentos previstos, pagos, parciais e pendentes de forma separada.
- [ ] Considerar recorrências e parcelas futuras na competência correta.
- [ ] Considerar pagamentos de fatura previstos no mês subsequente, vinculados à conta do cartão.
- [ ] Explicitar visualmente quando algum valor for estimado por média histórica, diferenciando de lançamento previsto real.
- [ ] Validar se a projeção usa a mesma base de cálculo de Dashboard, Contas, Cartões e Faturas, evitando divergência de valores.

### Ajuste conservador recomendado

- [ ] Antes da revisão funcional completa, alterar o texto da tela atual para indicar que se trata de **estimativa de gastos**, caso a lógica ainda não considere saldo, receitas, faturas e pendências.
- [ ] Evitar mudança estrutural de LocalStorage nesta primeira revisão.
- [ ] Implementar a nova regra preferencialmente por função pura de cálculo, reaproveitando funções existentes antes de criar nova estrutura.

### Critérios de aceite sugeridos

- [ ] Dado um mês com saldo inicial cadastrado, a projeção deve iniciar a partir desse saldo.
- [ ] Dado um mês com receitas previstas, a projeção deve somar essas receitas ao saldo projetado.
- [ ] Dado um mês com despesas previstas, a projeção deve subtrair essas despesas do saldo projetado.
- [ ] Dado um cartão com fatura fechada ou prevista, a projeção deve considerar o pagamento da fatura no mês de pagamento, não a compra individual como débito direto da conta.
- [ ] Dado um lançamento parcialmente pago, a projeção deve considerar separadamente valor pago e saldo pendente.
- [ ] Dado uma compra parcelada ou recorrência futura, a projeção deve distribuir os valores nas competências corretas.
- [ ] Dado que não existam lançamentos previstos suficientes, a tela pode exibir estimativas por média histórica, mas deve identificá-las como estimativas.

### Impacto em regra de negócio

Alto. A revisão altera a finalidade funcional da tela de **Projeções**, passando de estimativa simplificada para projeção financeira mensal. A alteração deve ser documentada antes de codificação e validada contra as regras de competência, previsto/realizado, fatura e saldo inicial.

### Impacto em LocalStorage

Inicialmente não deve haver alteração de LocalStorage. Caso seja necessário persistir parâmetros de projeção, cenários ou premissas de estimativa, a mudança deverá ser tratada em etapa própria com versionamento e migração.

### Dependências técnicas

- [ ] Mapear funções de cálculo já existentes no `App.jsx`.
- [ ] Avaliar reaproveitamento de cálculo de saldo, fatura, recorrência e simulações.
- [ ] Só criar função nova se não houver cálculo reutilizável adequado.
- [ ] Evitar dependência externa nesta etapa.

### Checklist de teste manual

- [ ] Criar receita prevista futura e confirmar impacto positivo na projeção.
- [ ] Criar despesa prevista futura e confirmar impacto negativo na projeção.
- [ ] Criar despesa no cartão e confirmar que o impacto ocorre pela fatura/pagamento.
- [ ] Criar compra parcelada e confirmar distribuição mês a mês.
- [ ] Criar baixa parcial e confirmar saldo pendente projetado.
- [ ] Criar saldo inicial mensal e confirmar que a projeção parte dele.
- [ ] Comparar valores da projeção com Dashboard, Contas e Cartões para o mesmo mês.



## Atualização de backlog — Importação de vales Pluxee — 2026-06-29

### Implementado na versão 0.3.3

- [x] Criar tipo de importação **Extrato de vale**.
- [x] Permitir seleção de conta de vale destino.
- [x] Exigir ano do extrato para arquivos Pluxee sem ano por lançamento.
- [x] Importar PDF/TXT Pluxee usando parser específico.
- [x] Classificar cargas/saldo liberado/agendamento de benefício como receita.
- [x] Classificar compras no vale como despesa.
- [x] Reaproveitar prévia, seleção, categorização, duplicidade e lote importado.
- [x] Permitir desfazer lote importado de vale.

### Pendências de validação

- [x] Instalar `pdfjs-dist` no projeto local.
- [ ] Validar importação do arquivo `Extrato.pdf` gerado pelo aplicativo Pluxee.
- [x] Validar `npm run dev`.
- [x] Validar `npm run build`.
- [x] Validar `npm run preview`.

### Pontos de atenção futuros

- [ ] Avaliar arquivos Pluxee com carteira Alimentação.
- [ ] Avaliar arquivos Pluxee com mais de um ano no mesmo PDF.
- [ ] Avaliar PDFs sem texto pesquisável.
- [ ] Avaliar suporte a outros fornecedores de vale.


### Ajuste UX — Campo de parcelas sem preenchimento forçado

Prioridade: Alta para experiência de uso.

Problema identificado:

- Campos de número de parcelas eram exibidos com valor padrão automático, como `1` ou `2`.
- Ao clicar no campo, o usuário precisava digitar antes do valor existente e depois apagar o valor padrão.
- Esse comportamento aumentava risco de gravação incorreta e gerava atrito no cadastro de compras parceladas e simulações.

Decisão:

- Não preencher automaticamente o campo de parcelas na interface.
- Permitir que o usuário limpe completamente o campo.
- Validar o campo apenas no momento da gravação quando o parcelamento/simulação exigir número de parcelas.

Critérios de aceite:

- [ ] Campo de parcelas abre vazio em novo lançamento parcelado.
- [ ] Campo de parcelas abre vazio em nova despesa compartilhada parcelada.
- [ ] Campo de parcelas abre vazio em nova simulação.
- [ ] Usuário consegue apagar totalmente o conteúdo do campo.
- [ ] Sistema bloqueia gravação se o campo obrigatório estiver vazio.
- [ ] Sistema exibe modal de campo obrigatório para número de parcelas.
- [ ] Sistema grava corretamente quando o usuário informa o número desejado.

Impacto em LocalStorage: nenhum.

Impacto em regra de negócio: não altera cálculo de parcelas; altera apenas UX e validação de preenchimento.



## Atualização de backlog — Correção importação Pluxee v0.3.5

### Correção funcional aplicada

- [x] Ajustar regra de classificação do extrato Pluxee para considerar como crédito/receita somente movimentos com descrição `DISPONIBILIZACAO DE VALOR`.
- [x] Tratar todos os demais movimentos do extrato Pluxee como débito/despesa.
- [x] Atualizar textos de orientação da importação de vales para refletir a regra validada.

### Validação informada pelo usuário

- [x] Acessar aba Importar.
- [x] Selecionar Extrato de vale / Pluxee.
- [x] Informar o ano do extrato.
- [x] Selecionar a conta Vale Refeição ou Vale Alimentação.
- [x] Importar o PDF.
- [x] Conferir a prévia.
- [x] Salvar importação.
- [x] Verificar lançamentos na conta de vale.
- [x] Reimportar o mesmo PDF para testar duplicidade.
- [x] Desfazer lote importado.

### Pendente após correção

- [ ] Validar que `DISPONIBILIZACAO DE VALOR` entra como receita.
- [ ] Validar que todos os demais movimentos entram como despesa.
- [x] Validar execução local com `npm run dev`.
- [x] Validar build com `npm run build` aprovado com alerta não bloqueante de chunk > 500 kB.
- [x] Validar preview com `npm run preview`.


### Atualização de validação técnica — 2026-06-29

- [x] `npm install` validado na versão v0.3.5.
- [x] `npm run dev` validado na versão v0.3.5.
- [x] `npm run build` validado na versão v0.3.5 com alerta não bloqueante de chunk acima de 500 kB.
- [x] `npm run preview` validado na versão v0.3.5.

Ponto de atenção técnico: tratar o alerta de chunk em etapa futura de modularização/code splitting, sem bloquear a estabilização funcional da v0.3.5.


## Atualização de roadmap — 2026-06-29 — v0.3.6

### Concluído

- [x] Passo 3 validado pelo usuário: filtros, recategorização protegida, backup/restauração com metas por categoria e histórico de despesas compartilhadas.
- [x] Iniciada modularização incremental de baixo risco.
- [x] Extraído `RequiredFieldModal` para `src/components/ui/RequiredFieldModal.jsx`.
- [x] Extraídos helpers de validação obrigatória: `requiredFieldInfo` e `highlightIfRequired`.

### Próximas extrações candidatas

1. `MoneyInput` e funções de máscara monetária.
2. Utilitários de data e mês: `mKey`, `formatMonthBR`, `addMonthsToMonthKey`.
3. Componente de filtros de lançamentos.
4. Componente de recategorização protegida.
5. Depois, serviços de importação, começando pelos parsers menos acoplados.

### Observação

A próxima extração deve continuar pequena e sem alteração funcional. Não iniciar mudança de regra financeira junto com refatoração estrutural.


## Atualização de backlog — v0.3.7

### Concluído

- [x] Validar passo 3 pós-v0.3.5: filtros, recategorização protegida, backup/restauração com metas e histórico de despesas compartilhadas.
- [x] Dar continuidade à refatoração incremental com componente reutilizável de data.
- [x] Padronizar campos editáveis de data para `dd/mm/aaaa` sem alterar LocalStorage.

### Próxima prioridade técnica

- [ ] Validar localmente a v0.3.7.
- [ ] Extrair utilitários de dinheiro (`moneyToNumber`, `maskMoneyInput`, `fmtBRL`) para `utils/moneyUtils.js`.
- [ ] Extrair utilitários de competência/mês para `utils/dateUtils.js`, reaproveitando a decisão tomada no `DateInput`.
- [ ] Manter cálculos financeiros no `App.jsx` até haver cobertura manual suficiente para extração segura.

### Observação

A padronização visual de datas foi feita sem mudança estrutural. O próximo passo deve continuar priorizando funções puras e componentes de baixo risco antes de mexer em fatura, projeções ou recorrências.


## Atualização de backlog — v0.3.11

### Concluído

- [x] Validar checklist manual da v0.3.7 conforme informado pelo usuário.
- [x] Extrair utilitários monetários para `src/utils/moneyUtils.js`.
- [x] Extrair utilitários de data/mês para `src/utils/dateUtils.js`.
- [x] Extrair constantes de LocalStorage para `src/constants/storageKeys.js`.
- [x] Extrair `lsGet`, `lsSave` e `useLS` para `src/hooks/useLocalStorage.js`.
- [x] Atualizar `DateInput` para reaproveitar `dateUtils.js`.

### Próxima prioridade técnica

- [ ] Validar localmente a v0.3.11 com `npm run dev`, `npm run build` e `npm run preview`.
- [ ] Executar regressão manual de valores, datas, backup/restauração e recarregamento da aplicação.
- [ ] Mapear funções candidatas à próxima extração de serviço, priorizando regras não financeiras críticas.
- [ ] Avaliar extração futura de `categoryService.js` ou componente de filtros, antes de mexer em fatura/projeção.

### Observação

As extrações da v0.3.11 foram técnicas e conservadoras. Não houve mudança funcional, regra financeira ou alteração de LocalStorage.
