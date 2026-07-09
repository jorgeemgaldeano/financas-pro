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

## Atualização de backlog — v0.3.12

### Concluído

- [x] Corrigir rotina **Apagar dados financeiros** após a refatoração de LocalStorage da v0.3.11.
- [x] Restaurar import explícito de `lsSave` para uso no `handleReset`.
- [x] Restaurar import explícito de `LS_VERSION` para exportação de backup.

### Validação pendente

- [ ] Validar manualmente a limpeza de lançamentos, contas e cartões.
- [ ] Validar persistência da limpeza após atualizar a página.

## Atualização de backlog — Versão 0.3.13 — 2026-06-29

### Concluído nesta etapa

- [x] Extrair componente/função de filtros de lançamentos.
- [x] Criar `TransactionFiltersPanel.jsx`.
- [x] Criar função `filterTransactions`.
- [x] Extrair `categoryService.js` para autocategorização.
- [x] Preservar regra de autocategorização existente.
- [x] Preservar comportamento da aba Lançamentos.

### Próximas etapas recomendadas

- [ ] Validar manualmente filtros de lançamentos após extração.
- [ ] Validar importação com autocategorização por regra personalizada.
- [ ] Validar importação com autocategorização por histórico.
- [ ] Validar importação com regras padrão.
- [ ] Avaliar próxima extração: `importService.js` ou revisão de Projeções.


---

## Atualização de roadmap — Preparação para Vercel e SQL — 2026-07-02

### Diretriz

A aplicação deve se preparar para publicação no Vercel e futura migração para SQL, mas sem abandonar o LocalStorage enquanto as regras financeiras críticas não estiverem validadas.

### Nova sequência recomendada

- [ ] Validar integralmente a `v0.3.16.2`.
- [ ] Corrigir eventuais falhas da validação de cartão/fatura.
- [ ] Extrair `src/services/cardInvoiceService.js` como refatoração técnica pura.
- [ ] Criar camada local de repository/storage mantendo LocalStorage.
- [ ] Revisar Projeções com base nos services financeiros.
- [ ] Preparar build para publicação no Vercel Preview.
- [ ] Definir política de branches para Vercel:
  - `develop` como ambiente de homologação/preview;
  - `main` como produção futura.
- [ ] Planejar modelo SQL somente após versão estável/UAT.

### Modelo SQL preliminar a estudar futuramente

Tabelas candidatas:

- `accounts`;
- `cards`;
- `transactions`;
- `invoices`;
- `invoice_adjustments`;
- `people`;
- `shared_expenses`;
- `simulations`;
- `categories`;
- `params`;
- `import_batches`;
- `import_reports`.

### Critério para iniciar Vercel

Publicar no Vercel somente após:

- build aprovado;
- versão visual clara;
- backup/restauração validado;
- regras de cartão/fatura validadas;
- branch `develop` organizada;
- entendimento de que LocalStorage não sincroniza dados entre dispositivos.

### Critério para iniciar SQL

Iniciar desenho técnico de SQL somente após:

- primeira versão estável/UAT;
- modelo de dados documentado;
- regras de cartão/fatura estáveis;
- regras de projeção e simulação minimamente estabilizadas;
- estratégia de migração de LocalStorage definida;
- decisão técnica registrada.


---

## Atualização de roadmap — Pós-aprovação v0.3.17.4 — 2026-07-04

### Concluído

- [x] Aprovar `v0.3.17.4`.
- [x] Corrigir tela branca em Simulações.
- [x] Corrigir ausência de `getSimulationInstallmentValue`.
- [x] Corrigir ausência de `safeMoneyAmount`.

### Próxima etapa iniciada

- [x] Iniciar `v0.3.18` com camada local de repository/storage.
- [x] Criar `src/services/financeRepository.js`.
- [x] Atualizar `src/hooks/useLocalStorage.js` preservando contrato atual.

### Validação pendente da v0.3.18

- [ ] Validar abertura da aplicação.
- [ ] Validar persistência de lançamentos.
- [ ] Validar persistência de simulações.
- [ ] Validar backup/exportação.
- [ ] Validar rotina de apagar dados financeiros.
- [ ] Executar `npm run build`.
- [ ] Executar `npm run preview`.


## Atualização — v0.3.19 — 2026-07-04

### Concluído tecnicamente para validação

- [x] Criado `src/services/projectionService.js`.
- [x] Extraído cálculo conservador da tela **Projeções** para service próprio.
- [x] Mantida a regra atual de média mensal de despesas fixas e variáveis.
- [x] Mantido LocalStorage sem alteração estrutural.
- [x] Mantida ausência de novas bibliotecas.

### Pendente de validação manual

- [ ] Confirmar versão visual `v0.3.19`.
- [ ] Validar aba **Projeções**.
- [ ] Comparar valores com a `v0.3.18`.
- [ ] Validar `npm run build`.
- [ ] Validar `npm run preview`.

### Próximo passo sugerido após aprovação

- `v0.3.20` — preparação conservadora para Vercel Preview, mantendo LocalStorage e sem backend.

## Atualização — v0.3.21

### Concluído

- [x] Adicionar detalhamento expansível na aba Projeções.
- [x] Exibir itens por origem: receitas, despesas, faturas e simulações.
- [x] Manter cálculo de fluxo de caixa da `v0.3.20` sem alteração estrutural.

### Próximos itens sugeridos

- [ ] Adicionar filtros de Projeções por origem, conta, cartão e categoria.
- [ ] Permitir detalhamento completo quando houver mais de 8 itens por grupo.
- [ ] Melhorar auditoria de duplicidade entre fatura e despesas de cartão.


## Atualização — v0.3.21.1

- [x] Ajustar filtros de período em Projeções para formato `MM/AA`.
- [x] Reduzir poluição visual do detalhamento de Projeções.
- [x] Manter detalhamento apenas para Cartões/Faturas e Simulações.

## Atualização — v0.3.22

### Concluído

- [x] Filtros avançados em Projeções por origem, conta, cartão e categoria.
- [x] Opções para incluir/excluir simulações e recorrências projetadas.
- [x] Indicadores analíticos do fluxo de caixa.
- [x] Projeção analítica de recorrências baseada em `fixo: true`, sem alterar LocalStorage.

### Próximos pontos recomendados

- [ ] Validar a `v0.3.22` com dados reais.
- [ ] Avaliar necessidade de modelo formal de recorrências.
- [ ] Revisar lançamentos previstos e baixa parcial em fluxo completo.
- [ ] Consolidar critérios para Vercel Preview após estabilização das projeções.

## Atualização — v0.3.23

### Concluído

- [x] Corrigir funcionamento do filtro **Projetar recorrências previstas** em Projeções.
- [x] Preservar valores recorrentes já realizados no cálculo.
- [x] Remover recorrências previstas da projeção quando o filtro estiver desmarcado.

### Pendência futura

- [ ] Criar modelo formal de recorrências em versão futura, com análise de impacto em LocalStorage e migração.


## Atualização v0.3.24

- Corrigir duplicidade na importação bancária.
- Corrigir duplicidade na importação de cartão/fatura.
- Validar data, descrição e valor antes de carregar/salvar registros importados.

## Atualização — v0.3.24.1

- [x] Corrigir duplicidade remanescente na importação de cartão de crédito.
- [x] Aplicar validação de duplicidade ao Pluxee/vale.
- [x] Ajustar botão Sel. tudo para não selecionar duplicatas.

---

## v0.3.25 — Controle interno de parcelamentos de cartão

- Criado controle lógico de parcelamento 1:N na importação de cartão.
- Parcelas futuras já previstas deixam de ser importadas novamente.
- Divergências de parcelamento passam a ser apontadas no relatório da importação.
- Campos opcionais `parcelaGrupo` e `descricaoBaseParcelamento` são aplicados a novos lançamentos parcelados.
- Sem alteração de chaves do LocalStorage e sem migração obrigatória.

---

## Atualização de roadmap — Pós v0.3.26.2

### Status

A etapa de isolamento inicial do cartão permanece em validação, com foco na importação de compras parceladas.

### Próxima etapa somente após aprovação da v0.3.26.2

```txt
v0.3.27 — Isolamento de fatura de cartão
```

### Não avançar antes de validar

- Cartão vazio + parcelamento novo.
- Fatura futura com parcela já existente.
- Parcelamentos semelhantes com valores diferentes.
- Tolerância de R$ 0,10.
- Regressão da importação bancária e vale.


## Atualização de backlog — v0.3.26.5 — Importação de cartão

### Concluído nesta versão

- [x] Reduzir margem de equivalência de valor da parcela para R$ 0,05.
- [x] Listar divergência entre parcela prevista no sistema e parcela informada no arquivo.
- [x] Bloquear importação automática de parcelas divergentes.
- [x] Permitir correção manual da parcela atual e subsequentes do mesmo grupo.

### Próxima prioridade

- [ ] Validar manualmente primeira carga, reimportação, fatura subsequente e divergência de parcela.
- [ ] Após aprovação, avançar para isolamento de fatura de cartão na v0.3.27.

---

## Atualização de backlog — v0.3.26.6

### Concluído

- [x] Criar painel de divergências de parcelamento na importação de cartão.
- [x] Bloquear importação automática de parcela divergente.
- [x] Permitir decisão manual: manter, alterar somente atual, alterar atual e futuras.
- [x] Evitar criação automática de nova última parcela ao corrigir sequência.

### Próxima prioridade

- [ ] Validar manualmente o painel de divergências com caso real de fatura subsequente.
- [ ] Após aprovação, avançar para isolamento da fatura de cartão.

---

## Backlog planejado — pós v0.3.30.0 (próximas 5 versões)

Data: 2026-07-08

Contexto: `v0.3.30.0` entregou correção da dívida órfã (aba Pessoas),
classificação manual de créditos de cartão na importação (validada com
faturas reais do BB) e o scaffold de sugestão de categoria por IA (sem
chamada real ainda). Este bloco organiza o que vem a seguir, priorizado
pelo critério já registrado neste documento (evitar perda de dado,
corrigir cálculo financeiro, preservar consistência de fatura/conta,
reduzir risco técnico, facilitar evolução, melhorar UX).

### v0.3.31 — Qualidade e limpeza técnica — ENTREGUE (2026-07-08)

- [x] Configurar CI (GitHub Actions) rodando `npm test` a cada push/PR
  — `.github/workflows/ci.yml`, roda Vitest + build em push/PR de
  `main`/`develop`.
- [x] Criar suíte dedicada de migração com golden master (dado antigo real
  → migração → validação), cobrindo `migrationPipeline.js` —
  `tests/migrationGoldenMaster.test.js` (6 casos).
- [x] Remover `src/src/` — diretório duplicado e não utilizado (cópia
  obsoleta rastreada no Git; nenhum import apontava para lá).
- [ ] Avançar a reatribuição assistida por UI (mover lançamentos para
  outro cartão/conta/categoria antes de excluir), candidata desde
  `DEC-0028` (v0.3.26.9) — **ADIADO deliberadamente**: é feature nova, não
  limpeza técnica, e depende de avaliar antes se o bloqueio simples atual
  incomoda o usuário. Aguarda decisão do usuário.
- [x] Corrigir a inconsistência visual do "Total selecionado" na prévia de
  importação de cartão (somava créditos "pagamento da fatura anterior"
  descartados no `confirmImport`) — corrigido via memo `impSelectedForImport`
  e helper compartilhado `isCardCreditDiscardedOnImport`.

### v0.3.32 — Reatribuição de lançamentos e consolidação de UX — ENTREGUE (2026-07-08)

Branch `feature/v0.3.32-reatribuicao-lancamentos`, para mergear em `develop`
após aprovação da v0.3.31. Ver `DEC-0033`.

**Reatribuição:**

- [x] Mover **lançamentos entre cartões** antes de excluir (diálogo
  mover-e-excluir; competência recalculada pelo ciclo do destino — RN012).
- [x] Mover **lançamentos entre contas** de forma análoga (reponta cartões e
  faturas vinculados à conta).
- [x] Operação **atômica** via `src/services/reassignmentService.js` (snapshot
  completo), com guardrail de fatura fechada (origem/destino).
- [x] **Recategorizar uma categoria por completo** (botão `↦`), movendo todos
  os lançamentos/despesas dela e subcategorias. Trocas pontuais por
  lançamento seguem existindo, inalteradas.

**Consolidação de UX (dialogs e feedback):**

- [x] `ConfirmDialog` reutilizável (`src/components/ui/ConfirmDialog.jsx`)
  aplicado aos fluxos de exclusão de cartão, conta e categoria em Parâmetros.
- [x] Toast com **Desfazer** (`src/components/ui/Toast.jsx`) para as ações de
  mover/excluir, restaurando o snapshot anterior.

**Não incluído nesta versão (fica no backlog):**

- [ ] Substituir os demais `window.confirm`/`alert` nativos ainda espalhados
  pelo `App.jsx` (ex. `delPessoa`, `delDivida`, desfazer lote importado) pelo
  novo `ConfirmDialog`/toast — nesta versão só os fluxos de exclusão de
  cartão/conta/categoria foram migrados.
- [ ] Mover lançamento individual pela aba Lançamentos (gatilho alternativo;
  o usuário escolheu o fluxo em massa no excluir para esta versão).
- [ ] Revisar textos de ajuda da classificação de crédito de cartão com
  base em mais casos reais, se o usuário fornecer novos arquivos de teste.

### v0.3.33 — Transferências entre contas

Planejado em 2026-07-08 (reprioriza o slot; performance/importação/
modularização desceram para v0.3.35/36/37). Decisões do usuário registradas
abaixo; detalhe conceitual a virar `DEC-00XX` antes de codificar.

**Objetivo:** transferência entre contas cadastradas é movimento nulo (sai de
uma, entra na outra) e **não** deve contar como receita nem despesa — só
afeta o saldo das contas envolvidas.

**Modelo de dados (proposto, sem alteração de chave/schema):**

- Uma transferência = **duas transações ligadas** por um `transferId` comum,
  ambas com `natureza:"transferencia"`: uma saída na conta origem e uma
  entrada na conta destino. O campo `natureza` já existe — sem nova chave de
  LocalStorage, sem migração obrigatória.
- Regra transversal: **excluir `natureza:"transferencia"` de todas as
  agregações de receita/despesa** (Dashboard, Projeções, relatórios). São
  ~57 pontos de filtro `tipo==="receita"/"despesa"` no `App.jsx` +
  `projectionService` — antes de codificar, avaliar centralizar num helper
  (`isMovimentoContabil(t)` / `somaReceitas`/`somaDespesas`) para não
  espalhar a exclusão. O saldo por conta continua incluindo as duas pernas.
- **Caracterização ANTES** (travar o valor atual de Dashboard/Projeções) para
  garantir que a exclusão não altere números de quem não usa transferência.

**Escopo funcional (decisão do usuário: manual + auto-detecção na importação):**

- [x] Criar transferência manual: escolher conta origem, conta destino, valor
  e data → gera o par ligado atomicamente (padrão snapshot completo).
  (`createTransfer` + modal ⇄ Nova Transferência.)
- [x] Desfazer transferência tratando as duas pernas como uma unidade
  (`removeTransfer` para criadas, `unlinkTransfer`/desvincular para vínculos).
  Editar in-place (valor/data) fica como refinamento futuro — hoje é
  excluir/desvincular e recriar.
- [x] Auto-detectar na importação: débito numa conta cadastrada que casa com
  crédito em outra (mesmo valor, janela de dias — reusa
  `params.duplaEntradaDias`), oferecido em diálogo. Não vincula
  automaticamente sem confirmação. (`detectTransferCandidates`.)
- [x] Exibir transferências de forma distinta na aba Lançamentos (badge
  ⇄ saída/entrada · conta) + ação Associar/Desvincular por linha.
- [x] Incluir no backup/restauração — pernas são `trans`; validado por
  caracterização (`transferBackup.test.js`) que `transferId`/`transferOrigin`
  sobrevivem ao ciclo.
- [x] Associar dois lançamentos JÁ existentes como transferência (pedido do
  usuário, 2026-07-08): `linkAsTransfer`/`unlinkTransfer` + seletor de
  contraparte (mesmo valor, conta diferente).

**Riscos:** mudança transversal na agregação (maior risco da versão);
consultar `especialista-financas` (RN de saldo/previsto-realizado) e
`arquiteto-operacoes-atomicas` (par atômico). Não bumpar `LS_VERSION`.

**Modularização do `App.jsx` (adiantada para esta versão — decisão do usuário
2026-07-08):** a extração casa com a feature, porque centralizar a agregação já
é pré-requisito do ponto transversal acima. Fazer de forma incremental e
testada (caracterização antes de cada extração), sem misturar refatoração e
mudança de regra no mesmo passo:

- [x] Extrair a agregação contábil para `src/services/accountingService.js`
  (`isMovimentoContabil`, `somaReceitas`, `somaDespesas`) — ponto **único** de
  exclusão de `natureza:"transferencia"`, no `App.jsx` e no
  `projectionService`. Caracterização primeiro (feito).
- [ ] Aproveitar para extrair 1–2 blocos inline grandes que a feature
  encostar (candidatos: `ParamsTab`, aba de importação, Dashboard) para
  arquivos próprios em `src/components/`, sem alterar comportamento.
  **Pendente** — não feito nesta leva para não misturar refactor estrutural
  com a feature; a lógica de transferência já saiu para `transferService.js`.
- [ ] Meta desta versão: reduzir `App.jsx` (~4.700 linhas). Parcial: a
  lógica nova ficou em serviços (`accounting`/`transfer`), mas a UI
  (modais/diálogos) cresceu o `App.jsx`. Extração de blocos inline segue na
  v0.3.37.

**Pendência de UX identificada pelo usuário em sessão 2026-07-09:**

- [x] **Clareza do reflexo da transferência.** Resolvido em 2026-07-09 com
  `especialista-financas` + `revisor-ux` consultados antes de codificar.
  Diagnóstico: a coluna Categoria exibia um badge cinza quebrado (📦, sem
  texto) mais um botão "Editar" sem sentido para pernas de transferência
  (`catId:null`). Implementado: `renderCategoryEditor` (`App.jsx` ~linha
  3385) trata `t.natureza==="transferencia"` como caso especial e renderiza
  o badge dourado "⇄ Transferência · saída/entrada" na própria coluna
  Categoria, sem botão Editar. **Rótulo derivado, não persistido** — nasce de
  `natureza`, que já existe; nenhuma pseudo-categoria foi criada em `cats`,
  logo sem risco de vazar para `CategorySelect`, filtros ou gráficos por
  categoria, e sem necessidade de migração. Verificado no preview (badge
  dourado nas duas pernas, sem botão Editar).
  Escopo **não** incluído nesta leva (avaliado, mas fora da decisão do
  usuário 2026-07-09): opção sintética "Transferência" no filtro de
  Categoria principal, e formalização de RN031 (transferência como
  movimento nulo) em `docs/02-REGRAS-DE-NEGOCIO.md` — ambos ficam como
  débito técnico para retomar se necessário.

### v0.3.34 — Cofrinhos (objetivos de poupança)

Planejado em 2026-07-08. Nome **"Cofrinhos"** (decisão do usuário) para não
colidir com a aba **"Metas"** já existente, que é orçamento/limite por
categoria (`metas: {}` por `catId`) — coisa diferente.

**Objetivo:** aba para criar um objetivo com valor-alvo e data-alvo, controlar
o saldo guardado e simular o aporte mensal necessário para atingir a meta a
partir do mês atual.

**Modelo de dados (NOVA entidade persistida → território `guardiao-localstorage`):**

- [ ] Nova chave de LocalStorage `cofrinhos` (array). Estrutura por item
  (proposta): `{ id, nome, valorAlvo, dataAlvo, aportes:[{ id, data, valor,
  tipo:"aporte"|"retirada" }], cor?, icon?, arquivado? }`. Saldo = soma dos
  aportes − retiradas (**ledger próprio, aportes manuais** — decisão do
  usuário; sem acoplamento a contas, sem risco de dupla contagem).
- [ ] Entrar em `BACKUP_STORAGE_KEYS`, backup/restauração e no
  `migrationPipeline` com default seguro `[]` para dados antigos (RN002).
  Aditivo — **sem bump de `LS_VERSION`**.

**Escopo funcional:**

- [ ] CRUD de cofrinho (nome, valor-alvo, data-alvo).
- [ ] Registrar aporte/retirada, com saldo acumulado e % do alvo.
- [ ] **Simulação do aporte mensal**: `(valorAlvo − saldoAtual) / meses entre
  o mês atual e a dataAlvo`. Exibir também projeção "no ritmo atual, atinge
  em MM/AAAA". Reaproveitar utilitários de mês (`dateUtils`) e monetários.
- [ ] Estado visual: em dia / atrasado / concluído.
- [ ] Testes unitários do cálculo de simulação e do saldo do ledger.

**Riscos:** baixo em cálculo (ledger isolado), médio em persistência (chave
nova) — a migração/backup é o ponto de atenção. Não altera nenhuma RN
existente; adiciona entidade nova.

### v0.3.35 — Performance e cálculo

- [ ] Corrigir a complexidade quadrática do cálculo de saldo (item E4, já
  mapeado desde a sessão de 2026-07-05) — centralizar em função memoizada
  reaproveitável por Dashboard, Contas e Projeções (RN021).
- [ ] Reduzir o alerta de build de chunk > 500 kB (hoje só documentado
  como não bloqueante) via code splitting — candidato principal é o
  parser de PDF (`pdfjs-dist`), usado só na importação de vale Pluxee e
  carregável sob demanda (`import()` dinâmico).
- [ ] Auditar recomputações desnecessárias em Projeções/Dashboard
  (`useMemo`/`useCallback` já usados em parte, mas não auditados
  sistematicamente).

### v0.3.36 — Importação avançada

- [ ] Permitir classificar em lote linhas de crédito semelhantes na
  prévia de importação (ex.: aplicar a mesma classificação a todas as
  linhas com descrição parecida), reduzindo cliques quando a fatura tiver
  vários créditos do mesmo tipo.
- [ ] Avaliar suporte a formatos de OFX de outras administradoras além do
  BB para a classificação de crédito (hoje testada só com arquivos reais
  do BB) — Nubank e Itaú podem usar `TRNTYPE`/convenções diferentes.
- [ ] **Decisão pendente com o usuário antes de codificar**: escolher
  provedor de IA (OpenAI, Anthropic, outro) e onde guardar a chave, para
  então implementar a chamada real em `aiCategorizationService.js`
  (hoje só scaffold, ver `DEC-0031`). Não iniciar sem essa decisão.

### v0.3.37 — Modularização estrutural

> Nota (2026-07-08): a modularização foi **iniciada na v0.3.33** (extração da
> agregação contábil + 1–2 blocos inline grandes). Esta seção cobre o que
> restar depois disso.

- [ ] Extrair `simulationService.js` (cálculo de simulações hoje dentro
  de `App.jsx`).
- [ ] Extrair `peopleSharedService.js` (regras de despesas compartilhadas
  e dívidas de `PessoasTab`).
- [ ] Criar `backupService.js` dedicado, saindo do `App.jsx` — só depois
  que a rotina atual de backup/restauração estiver validada
  manualmente mais uma vez (critério já registrado em `DEC-0008`).
- [ ] Retomar a revisão conceitual da aba Projeções (fluxo de caixa real
  vs. estimativa) mapeada na sessão de 2026-06-29, ainda não concluída.

### Backlog aberto (sem versão agendada, baixa prioridade)

- [ ] Exportação CSV além de TXT para despesas de cartão.
- [ ] Relatório por pessoa em formato exportável.
- [ ] Gráficos de evolução por pessoa e de impacto de simulações.
- [ ] Suporte a arquivos Pluxee com carteira Alimentação e com mais de um
  ano no mesmo PDF; avaliar PDFs sem texto pesquisável.
- [ ] Avaliar suporte a outros fornecedores de vale-benefício além da
  Pluxee.
- [ ] Testes de integração leves com `@testing-library/react`.
- [ ] Smoke test E2E (Playwright) cobrindo o checklist de fatura.

### Melhorias de tooling/processo — revisão de agentes/skills (sessão 2026-07-09)

Levantamento pedido pelo usuário sobre necessidade de novos agentes/skills e
pontos de performance de sessão. Nenhum item foi implementado ainda — só
registrado para priorização futura.

- [ ] **Agente `otimizador-react` (novo).** Já cogitado em `DEC` de
  36-DECISAO-AGENTES-CLAUDE-CODE.md ("Itens em aberto") e nunca criado.
  Nenhum dos 7 agentes atuais cobre performance de render/bundle — cobriria
  a complexidade quadrática do saldo e a auditoria de `useMemo`/`useCallback`
  já mapeadas na v0.3.35, e o code-splitting do `pdfjs-dist` (sem
  `vite.config.js` hoje, bundle default do Vite).
- [ ] **Hook de teste automático pós-edição.** Rodar `npm test` via hook
  `PostToolUse` do Claude Code ao editar `src/services/*.js` — item também já
  citado como aberto na mesma DEC-036 e nunca implementado. Pega regressão de
  service sem depender de lembrete manual.
- [ ] **Serviços sem teste dedicado.** `cardInstallmentService.js` (587
  linhas, o maior service do projeto), `importService.js` (626 linhas),
  `projectionService.js`, `financeRepository.js`, `categoryService.js`,
  `transactionNormalizer.js`, `moneyUtils.js`, `dateUtils.js` — nenhum tem
  arquivo de teste próprio em `tests/`. Prioridade sugerida: os dois maiores
  primeiro (`cardInstallmentService`, `importService`), por concentrarem mais
  regra de negócio (RN de parcelamento e importação).
- [ ] **Inconsistência entre CLAUDE.md e realidade — E2E Playwright.** O
  CLAUDE.md declara a pirâmide "unitário → integração → E2E com Playwright →
  CI", mas não há nenhum spec Playwright, a dependência não está instalada e
  o `ci.yml` só roda Vitest + build. Decidir entre implementar de fato (1–2
  smoke tests reais, ex. checklist de fatura, já listado acima no backlog) ou
  ajustar o texto do CLAUDE.md para refletir o estado atual até haver
  bandwidth.

### Ajuste visual — paleta de cores (sessão 2026-07-09)

- [ ] **Usuário relata que a aplicação está com cores muito escuras** e pediu
  um ajuste para deixar mais clara. Ainda não analisado tecnicamente — a
  paleta hoje vive no objeto `C` no topo do `App.jsx` (`navy`, `surface`,
  `border`, `emerald`, `coral`, `gold`, `muted`, `text`, `soft`), usada como
  tema único (não há alternância clara/escura hoje). Próxima sessão: abrir com
  o usuário se é (a) só clarear os tons de fundo mantendo tema escuro, ou
  (b) introduzir um tema claro alternável — impacto e escopo são bem
  diferentes. Consultar `revisor-ux` antes de mudar qualquer cor.
