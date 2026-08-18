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
abaixo. Modelo de dados e sequenciamento formalizados em `DEC-0034` e
`RN031` (2026-08-16), após análise de impacto que corrigiu duas premissas
deste planejamento original: (1) o risco real de agregação são 6 pontos, não
"~57"; (2) `params.duplaEntradaDias` não tem motor de detecção implementado
— a Fase 2 constrói esse matcher do zero, não reaproveita.

**Sequenciamento (DEC-0034, adendo 2026-08-16):** Fase 1 e Fase 2 entregues
na mesma sessão/tag `v0.3.33.0`, por decisão do usuário de acelerar — o
plano original previa Fase 2 só depois da Fase 1 validada em uso real de
produção; a validação real usada foi a de preview (`npm run dev`), não uso
de produção.

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
  **ENTREGUE v0.3.33.0** (`transferService.createTransfer`, botão "🔁
  Transferir" na aba Lançamentos).
- [x] Desfazer/editar transferência tratando as duas pernas como uma unidade.
  **PARCIAL v0.3.33.0**: exclusão atômica das duas pernas com toast
  "Desfazer" entregue. Edição (mudar valor/data/contas de uma transferência
  já existente) não entrou nesta fase — hoje o caminho é excluir e recriar.
- [x] Auto-detectar na importação: débito numa conta cadastrada que casa com
  crédito em outra (mesmo valor, janela de dias). **ENTREGUE v0.3.33.0**
  (`transferMatchService.findTransferMatchCandidates`/
  `linkImportedRowAsTransfer`, checkbox "🔁 Possível transferência" na
  prévia de importação bancária, nunca vincula sem confirmação explícita).
  `params.duplaEntradaDias` era só um campo de configuração sem consumidor
  — o matcher foi escrito do zero, reaproveitando só o nome/janela do
  parâmetro.
- [x] Exibir transferências de forma distinta na aba Lançamentos (não como
  entrada/saída) e garantir que filtros e saldos batam. **ENTREGUE
  v0.3.33.0** (badge "🔁 Transferência", saldos validados no preview).
- [x] Incluir no backup/restauração (as pernas já são `trans`, então cobertas;
  validar que o `transferId` sobrevive ao ciclo). **Coberto por construção**
  — `trans` já está em `BACKUP_STORAGE_KEYS`, `transferId` é só mais um
  campo do registro.

**Riscos:** mudança transversal na agregação (maior risco da versão) —
**revisado por `DEC-0034`**: o risco real eram 6 pontos de agregação
(`receitaCorr`/`despCorr`/`catBreakdown`/`last6` no `App.jsx` +
`receitasItens`/`despesasItens` em `projectionService.js`), não os "~57"
estimados aqui originalmente; `movimentoContaMes` (saldo por conta) não foi
tocado. Não bumpou `LS_VERSION`. Ver `RN031` e o changelog `[0.3.33.0]`.

### v0.3.34 — Cofrinhos (objetivos de poupança)

Planejado em 2026-07-08. Nome **"Cofrinhos"** (decisão do usuário) para não
colidir com a aba **"Metas"** já existente, que é orçamento/limite por
categoria (`metas: {}` por `catId`) — coisa diferente (confirmado sem
colisão estrutural na análise de 2026-08-16). Modelo de dados e fórmula de
simulação formalizados em `DEC-0035` e `RN032`: ledger isolado (aportes/
retiradas não tocam `trans`, decisão do usuário) e fórmula de aporte mensal
com 3 estados (Em dia/Concluído/Atrasado), corrigindo uma divisão por zero
não tratada na fórmula original quando a dataAlvo já passou.

**Objetivo:** aba para criar um objetivo com valor-alvo e data-alvo, controlar
o saldo guardado e simular o aporte mensal necessário para atingir a meta a
partir do mês atual.

**Modelo de dados (NOVA entidade persistida → território `guardiao-localstorage`):**

- [x] Nova chave de LocalStorage `cofrinhos` (array). Estrutura por item
  (RN032): `{ id, nome, valorAlvo, dataAlvo, aportes:[{ id, data, valor,
  tipo:"aporte"|"retirada" }], arquivado? }`. Saldo = soma dos
  aportes − retiradas (**ledger próprio, aportes manuais, isolado de
  `trans`** — decisão do usuário; sem acoplamento a contas, sem risco de
  dupla contagem).
- [x] Entrar em `BACKUP_STORAGE_KEYS` (`storageKeys.js`) e em
  `normalizeBackupPayload()` (`App.jsx`) com default seguro `[]` para
  backups antigos (RN002). Não usa `migrationPipeline.js` — esse pipeline é
  específico do formato interno de `trans`, não se aplica a uma chave nova
  isolada. Aditivo — **sem bump de `LS_VERSION`**.

**Escopo funcional:**

- [x] CRUD de cofrinho (nome, valor-alvo, data-alvo).
- [x] Registrar aporte/retirada, com saldo acumulado e % do alvo.
- [x] **Simulação do aporte mensal**: `(valorAlvo − saldoAtual) / meses entre
  o mês atual e a dataAlvo`. Exibir também projeção "no ritmo atual, atinge
  em MM/AAAA". Reaproveitar utilitários de mês (`dateUtils`) e monetários.
- [x] Estado visual: em dia / atrasado / concluído.
- [x] Testes unitários do cálculo de simulação e do saldo do ledger.

**Riscos:** baixo em cálculo (ledger isolado), médio em persistência (chave
nova) — a migração/backup é o ponto de atenção. Não altera nenhuma RN
existente; adiciona entidade nova.

### v0.3.35 — Performance e cálculo

Item E4 localizado e escopo real formalizado em `DEC-0036` (2026-08-16),
depois de ficar como rótulo sem causa identificada desde 2026-07-05.

- [x] **E4 — complexidade quadrática do cálculo de saldo, fix completo**
  (não só cache): extrair `movimentoContaMes`/`getSaldoInicialConta`
  (`App.jsx:2201-2221`) para `src/services/saldoService.js` novo, com
  testes de caracterização do valor atual ANTES de mudar o algoritmo;
  trocar o custo O(C×M×N) (recursão mês a mês, cada passo refiltrando todo
  `trans`) por O(N + C×M) (agrupar `trans` por conta+mês numa passada só,
  depois somar prefixado por conta). `useMemo`/`useCallback` sozinho NÃO
  resolve — só evita recálculo em re-renders não relacionados, o custo
  algorítmico volta a cada troca de mês/edição de lançamento.
- [x] **Absorve o item de auditoria de `useMemo`/`useCallback`** (não é mais
  item separado — acontece naturalmente ao reestruturar o cálculo acima).
- [x] Reduzir o alerta de build de chunk > 500 kB via code splitting —
  candidato validado: `pdfjs-dist` (`App.jsx:25-26`, uso isolado em
  `extractPdfTextFromFile` atrás de `impMode==="vale"`) trocar os imports
  estáticos do topo por `import()` dinâmico dentro dessa função. Item
  independente do fix de E4, baixo risco.

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

### v0.3.37 — Modularização estrutural (serviços + Atomic Design do front-end)

Escopo ampliado em 2026-08-16 (`DEC-0038`), por decisão do usuário: a
extração de serviços já planejada (itens 1-4 abaixo) e uma reorganização
completa da camada de apresentação em Atomic Design (itens 5-9) passam a
viver na mesma versão, em vez de uma v0.3.39 separada. Ver `DEC-0038` para
o diagnóstico completo (mapa factual do estado atual de `App.jsx`) e o
raciocínio do sequenciamento por fase.

**Extração de serviços (escopo original, 2026-07-08):**

- [x] Extrair `simulationService.js` (cálculo de simulações hoje dentro
  de `App.jsx`). **Entregue na Fase 3 da v0.3.37**, com 11 testes novos —
  o checkbox ficou desmarcado por engano até 2026-08-18.
- [ ] Extrair `peopleSharedService.js` (regras de despesas compartilhadas
  e dívidas de `PessoasTab`).
- [ ] Criar `backupService.js` dedicado, saindo do `App.jsx` — só depois
  que a rotina atual de backup/restauração estiver validada
  manualmente mais uma vez (critério já registrado em `DEC-0008`).
- [ ] Retomar a revisão conceitual da aba Projeções (fluxo de caixa real
  vs. estimativa) mapeada na sessão de 2026-06-29, ainda não concluída.

**Atomic Design do front-end (escopo novo, `DEC-0038`) — 5 fases, cada
uma testável/validável isoladamente antes de seguir para a próxima:**

- [x] **Fase 1 — Tokens.** Criar `src/theme/tokens.js` com a paleta `C`
  hoje presa dentro de `App.jsx`. Componentes já extraídos
  (`ConfirmDialog`, `RequiredFieldModal`, `Toast`, `CashFlowChart`) trocam
  seu `DEFAULT_COLORS`/`colors` próprio por import de `tokens.js` — fecha
  o risco de drift de cor entre telas. Risco: quase zero (sem mudança
  visual).
- [x] **Fase 2 — Atoms.** `Button`, `Card`, `Label`, `StatValue`,
  `ProgressBar`, `Badge`, `IconButton` (o padrão "×" de excluir, hoje
  repetido 15×), `MoneyInput` (hoje função local em `App.jsx:419`, nunca
  extraída). Wrappers finos em cima do estilo já existente, sem mudar
  visual — validar por preview antes/depois. Risco: baixo.
- [x] **Fase 3 — Molecules.** `FormField` (Label+Input, hoje pareados à
  mão em 46+ lugares), `StatTile` (Label+StatValue+legenda),
  `ProgressCard` (unifica o padrão de barra+badge+status hoje duplicado
  quase igual entre Metas e Cofrinhos), `ModalShell` (título+corpo+rodapé
  Cancelar/Confirmar, reaproveitado pelos 6 modais). Risco: médio (mais
  callsites tocados, mas ainda presentational). Entregue como
  `FormField`/`StatTile`/`ProgressStat`/`ModalFooter`/`MetaInput`/
  `MonthShortInput`/`CategorySelect`.
- [x] **Fase 4 — Organisms (abas).** Uma aba = um componente, em arquivo
  próprio (não mais função dentro de `App.jsx`, ao contrário do padrão
  antigo de `PessoasTab`/`ParamsTab`). As 10 abas restantes viraram
  organisms: Simulações, Cofrinhos, Lançamentos, Cartões, Recorrências,
  Contas, Metas, Importação, Dashboard, Projeções. Infraestrutura
  compartilhada extraída no caminho: `categoryTreeUtils.js`,
  `simulationService.js` (item 1 do backlog original, com 11 testes
  novos), `BarChart`/`DonutChart`. `App.jsx`: 5.048 → 3.727 linhas (-26%).
- [x] **Fase 4 — Organisms (modais).** Os 6 modais do switch em
  `App.jsx` (`addTrans`, `addTransfer`, `addCofrinho`,
  `movimentoCofrinho`, `editRecorrencia`, `addCard`) viraram
  `components/organisms/modals/`. `addTrans` (~189 linhas, formulário
  mais usado do app) deixado por último, validado no preview (modo
  cartão, parcelamento com preview de cálculo). `App.jsx`: 5.048 → 3.457
  linhas (-32%).
- [x] **Fase 5 — Template/Page.** Executada em escopo completo (decisão do
  usuário registrada no adendo de `DEC-0038`), porque extrair só o
  `AppShell` teria reduzido o arquivo em ~130 linhas e deixado 1.278
  linhas de organism ainda dentro dele. Entregue:
  `components/templates/AppShell.jsx` (sidebar+topbar+slot, mais
  `TABS`/`TAB_ICONS`/`NAV_LABELS`), `components/organisms/ModalHost.jsx`
  (moldura e switch dos 6 modais), `components/organisms/PessoasTab.jsx` e
  `components/organisms/ParamsTab.jsx` (as duas últimas abas no padrão
  antigo), `constants/seedData.js` (9 constantes `INIT_*`) e
  `services/importDuplicateService.js` (chaves de deduplicação, com 33
  testes de caracterização novos). `App.jsx`: 3.457 → **1.823 linhas**
  (5.048 → 1.823 no total da v0.3.37, -64%).
- [ ] **Fase 6 (candidata, NÃO aprovada) — decompor o corpo de `App()`
  em hooks customizados.** Sobraram 1.590 linhas em `App()`: estado,
  hooks, handlers e composição. Quebrá-las em hooks por domínio
  (`useImportFlow`, `useFaturas`, `useCofrinhos`, `useRecorrencias`...)
  é o único caminho que chega à faixa de 600-800 originalmente imaginada
  na `DEC-0038`. **Não faz parte da v0.3.37 e não deve ser puxada sem
  decisão explícita:** diferente das fases 1-5, mexe em wiring de estado
  com `useLocalStorage`/persistência no meio, então deixa de ser mudança
  "puramente estrutural/apresentacional" e exige análise de risco de
  persistência própria. Só faz sentido avaliar depois da v0.3.38
  (sincronização multi-dispositivo), que vai mexer nessa mesma camada.

**Dívida técnica aberta pela Fase 5:**

- [ ] **Adotar ESLint no projeto.** Durante a Fase 5, a extração de
  `ParamsTab` quebrou em runtime com `catColor is not defined` e nem
  `npm test` nem `npm run build` acusaram — não há linter, e o Vitest não
  cobre telas. Um `no-undef` teria pego na hora. Enquanto não houver,
  toda extração de componente precisa de verificação manual de
  identificadores livres mais preview obrigatório.
- [ ] **Alinhar o contrato de props de `PessoasTab`.** Ela recebe `C`,
  `uid`, `fmtBRL` e `fmtDate` por parâmetro, enquanto todos os outros
  organisms importam esses mesmos valores direto de
  `theme/tokens.js`/`utils/`. Foi preservado assim de propósito na Fase 5
  (movimentação pura, para não misturar mudança de assinatura com
  mudança de arquivo). `C`/`fmtBRL`/`fmtDate` são troca trivial; `uid`
  exige extrair a função do `App.jsx` para `utils/` antes.
- [x] **`APP_VERSION` bumpado de `0.3.35.0` para `0.3.37.0`**
  (`App.jsx:69`) em 2026-08-16, por decisão do usuário no fechamento da
  v0.3.37. O badge da sidebar voltou a bater com o topo do
  `09-CHANGELOG.md`. **Observação:** a v0.3.36 (Importação avançada)
  continua inteiramente pendente e foi pulada na numeração do app —
  `APP_VERSION` marca a última versão *entregue*, não a última planejada.
  Se a v0.3.36 for retomada depois, ela entra como bloco de escopo, não
  como retrocesso de versão.
- [ ] **`package.json` está em `"version": "0.1.0"`** e nunca foi mantido
  em sincronia com o `APP_VERSION`. Deixado como está no fechamento da
  v0.3.37 (mexer nele sem necessidade só cria ruído em build/lockfile).
  Decidir se vira fonte única de versão ou se é oficialmente ignorado.

### v0.3.38 — Sincronização multi-dispositivo (casal em notebooks separados)

**Bloco reescrito em 2026-08-18 pela `DEC-0039`**, que trocou o desenho de merge
contínuo por registro (12 fases) por sincronização de payload com trava otimista e
merge assistido de três vias (6 blocos). O desenho anterior segue descrito no adendo
de 2026-08-16 da `DEC-0037` e permanece como **alternativa avaliada e não adotada** —
é o caminho para o dia em que o uso deixar de ser "mesma casa, quase sempre online".

**Motivação real:** o app é usado por um casal, cada um no seu notebook — sem
sincronização, cada LocalStorage é uma ilha. O dado vive no navegador de cada
máquina, então servir o app por rede local **não** resolve (compartilha o código, não
o dado).

**Stack:** Supabase (uma linha: `estado(payload jsonb, versao, updatedAt, usuario)`)
+ Vercel.

#### Como funciona, em uma passada

Ao salvar, o cliente envia o payload inteiro mais a **versão que carregou**. O
servidor aceita e incrementa, ou **recusa** porque alguém salvou no meio. Recusa
nunca descarta nada: dispara backup e abre a reconciliação. Na reconciliação o
cliente busca do servidor a versão que havia carregado — o ancestral comum — e faz
merge de três vias por id: aplica sozinho o que só um lado mudou, deduz exclusão pela
ausência em relação ao ancestral (**sem tombstone**) e pergunta só sobre o que os dois
mudaram.

#### O que NÃO é preciso fazer neste desenho

Registrado explicitamente para não voltar por inércia do plano anterior: **sem
tombstone, sem expurgo de 90 dias, sem achatamento de registros aninhados, sem bump
de `LS_VERSION`, sem migração de formato.** Ver `DEC-0039` para o que cada um desses
itens revogou.

#### Ordem operacional

- **A Fase A (deploy) é a última, colada ao cutover.** Publicar antes de existir
  sincronização move o uso para uma origem sem os dados e sem o benefício que
  justificaria a mudança.
- O histórico financeiro atual será **descartado** (decisão de 2026-08-18): a base
  nova nasce com contas, saldos iniciais e recorrências. Sem migração, sem semeadura.
- O nome do projeto no Vercel é definitivo na prática (T1): renomear muda a URL, e
  origem nova é LocalStorage vazio.

#### Fase 0 — Higiene técnica (risco baixo, independente de tudo) — ENTREGUE 2026-08-18

- [x] Adotar ESLint com `no-undef` — dívida aberta pela Fase 5 da v0.3.37, quando a
  extração de `ParamsTab` quebrou em runtime com `catColor is not defined` sem que
  `npm test` ou `npm run build` acusassem.
- [x] Criar `vite.config.js` ligando `@vitejs/plugin-react`. O plugin está declarado
  em `package.json` e nunca foi aplicado (só existe `vitest.config.js`): **o React
  Fast Refresh nunca rodou neste projeto.** Provável causa raiz dos `ReferenceError`
  fantasmas em aba antiga, tratados como "staleness de HMR" em várias sessões.
- Aceite: lint sem erro no `src/`; editar um componente preserva o estado da tela.

##### Resultado da Fase 0

Configuração: `eslint.config.js` (flat config, ESLint 9), `vite.config.js` com
`@vitejs/plugin-react`, e os scripts `npm run lint` / `npm run lint:fix`. Estado
final: **0 erros e 8 warnings** no `src/`, 193 testes passando, build limpo.

**Fast Refresh verificado no navegador**, não só no papel: com a aba Pessoas aberta,
editar `PessoasTab.jsx` produziu `[vite] hot updated` sem recarga de página, o estado
do React foi preservado (a aba continuou selecionada) e uma marca gravada em `window`
sobreviveu à edição — prova de que não houve reload. Antes desta fase, qualquer edição
recarregava a página inteira.

**A regra `no-undef` não encontrou nenhuma ocorrência no código atual.** O defeito que
originou a dívida (`catColor is not defined`) já tinha sido corrigido à mão na v0.3.37;
o valor da regra aqui é preventivo, não corretivo. Registrar isso importa para não
atribuir à Fase 0 um ganho que ela não teve.

Os 42 erros encontrados eram de outra natureza e foram corrigidos:

- 31 de `no-unused-vars`, quase todos código morto: 15 imports não usados no `App.jsx`,
  o `useMemo` `nm` (lista de 6 meses) e o `useCallback` `saldoContaFinal`, ambos sem
  nenhum consumidor, mais um `dt` sobrevivente da correção de clamp de dia.
- 6 de `no-empty`: os `catch {}` de LocalStorage, `crypto.randomUUID` e notificação de
  erro. São silêncios deliberados; ganharam comentário explicando o porquê, em vez de a
  regra ser desligada.
- 4 de `react/no-unescaped-entities` e 1 de `no-useless-escape`.

**Três achados colaterais, que não são regressão desta fase:**

1. `setImportMsg` nunca foi chamado — desde a versão inicial do projeto, confirmado por
   `git log -S`. A mensagem de resultado da importação de backup na aba Parâmetros
   **nunca apareceu para o usuário**: o estado existia, o `div` existia, e nada nunca
   escrevia nele. Estado e `div` removidos. Se o feedback de importação for desejado,
   é item novo de backlog, não conserto.
2. `addInvoiceAdjustment` (`cardInvoiceOperations.js`) calculava `now` e descartava: o
   lançamento de ajuste de fatura nasce **sem nenhum carimbo de data de criação**.
   Insumo direto para a Fase 1, que precisa de `updatedAt` universal.
3. `cardInvoiceService.js` tinha cópia privada e morta de `getSimulationInstallmentValue`
   e `safeMoneyAmount`, duplicando `simulationService.js` — drift silencioso entre dois
   services. As cópias mortas foram removidas.

**Regras deliberadamente afrouxadas, com o motivo, para não parecerem descuido:**

- `eslint-plugin-react-hooks` v7 entra apenas com `rules-of-hooks` e `exhaustive-deps`.
  O preset `recommended` da v7 traz o conjunto do React Compiler (`immutability`,
  `purity`, `use-memo`, `set-state-in-effect` e mais), que é outro trabalho, de outro
  tamanho, e não cabe numa fase de higiene.
- `react/no-unescaped-entities` proíbe só `>` e `}`. Aspas duplas em texto de tela são
  inofensivas e o app é escrito em português.
- `no-unused-vars` com `ignoreRestSiblings: true`, porque `const { a, ...resto } = obj`
  é o idioma de omissão de propriedade usado em `transferMatchService.js` — os nomes
  descartados ali são a intenção, não código morto.

**Os 8 warnings que ficaram** são todos `react-refresh/only-export-components`, em
`Label.jsx`, `TransactionFiltersPanel.jsx`, `AppShell.jsx`, `RequiredFieldModal.jsx` e
`Toast.jsx`: arquivos que exportam componente e não-componente juntos, e por isso ainda
caem para recarga completa quando editados. Separar os exports é refatoração, não
higiene — fica como backlog aberto, e não bloqueia a Fase 1.

#### Fase 1 — `usuario` e `updatedAt` (risco médio) — ENTREGUE 2026-08-18

- [x] Campo de texto `usuario` no LocalStorage (D7). Como a conta do Supabase é
  compartilhada, é a **única** atribuição existente — sincronização bloqueada
  enquanto estiver vazio.
- [x] Carimbo `updatedAt` em toda escrita de registro, em todas as entidades. Hoje
  existe em três pontos do `App.jsx` e em dois services.
- [x] **Puramente aditivo: sem bump de `LS_VERSION`.**
- Aceite: teste que cria e edita cada entidade verificando o carimbo.
- Nota: `updatedAt` é o único item que **não pode ser retrofitado** — é ele que
  mantém aberta a porta para o desenho C, caso um dia seja necessário.

##### Resultado da Fase 1

`RN035` e `DEC-0041` novas. 29 testes em `tests/recordStamp.test.js` (222 no total),
lint com 0 erros, build limpo.

**Onde o carimbo mora: na fronteira de persistência (`useLS`), não nos setters.** O
`App.jsx` tem dezenas de pontos de escrita e o carimbo existia em cinco. Carimbar em
cada um seria esquecer um, e o esquecido não falharia em teste nem em build — falharia
na Fase 4, como registro que o merge não sabe desempatar, já com os dois dispositivos
em uso. `stampChangedRecords` recebe o par (anterior, próximo) que o React entrega ao
setter funcional e marca só o que mudou de fato.

**Três decisões que vão além do que esta fase pedia**, detalhadas na `DEC-0041`:

1. **`updatedBy` junto com `updatedAt`.** O aceite da Fase 4 fala em mostrar
   "`updatedAt` e `usuario`" na escolha de conflito; sem atribuição por registro, essa
   tela mostraria o autor do payload inteiro. E atribuição é tão não-retrofitável
   quanto data.
2. **"Registro" é regra estrutural, não lista:** objeto com `id` dentro de um array,
   em qualquer profundidade. `cats[].subs[]` (recursivo),
   `dividas[].amortizacoes[]`, `cofrinhos[].aportes[]` e `params.autoCategoryRules[]`
   entram pela mesma regra, e entidade nova nasce carimbada sem ninguém lembrar.
3. **Três escritas são isentas** (`stamp:false`): restauração de backup (as datas vêm
   do arquivo e representam edição real), normalização de leitura e migração automática
   de campo. Recarimbar qualquer uma delas faria uma cópia vencer a outra no merge sem
   que nada de real tivesse mudado.

**O carimbo só marca o que mudou.** Salvar sem alterar nada não carimba; os vizinhos
não alterados mantêm a data anterior; e `stampChangedRecords` devolve a mesma
referência quando nada mudou, o que também evita invalidar os `useMemo` do `App.jsx`.
Se toda gravação recarimbasse tudo, o merge da Fase 4 veria a base inteira como
conflito e a autoria perderia o valor.

**Verificado no navegador, além dos testes:** criar um lançamento carimbou 1 registro
entre 23 (os outros 22 intactos); renomear uma categoria carimbou a categoria e
**nenhuma** das 4 subcategorias dela, nem a categoria irmã; clicar em salvar sem mudar
nada não moveu a data; e o `usuario` sobreviveu ao recarregamento. Numa base recém-
semeada, zero registros nascem carimbados — a migração automática de cartões roda com
`stamp:false`.

**Limitação consciente:** `metas` (mapa categoria → limite), `saldosIniciais` (mapa mês
→ conta → valor) e os escalares de `params` **não** recebem carimbo, por não terem
identidade própria. O merge da Fase 4 resolve esses três comparando valor, não data. Se
isso não bastar, a saída não é forçar carimbo: é reestruturá-los como listas de
registros, o que **é** mudança de formato e exige migração e decisão nova.

**`usuario` é identificação de dispositivo, não dado financeiro** — chave própria, fora
do backup e fora do payload. Como "Apagar dados financeiros" limpa todas as chaves
`fpro_`, o campo é regravado logo depois; sem isso ele sumiria do LocalStorage e
continuaria em memória, e a divergência só apareceria no próximo reload.

#### Fase 2 — Infra Supabase (risco baixo, não toca o app) — ENTREGUE 2026-08-18

- [x] Tabela de uma linha: `estado(payload jsonb, versao, updatedAt, usuario)`, com
  RLS e retenção das últimas versões (o ancestral do merge sai daqui).
  **Escrita e versionada** em `supabase/sql/0001-estado-e-rls.sql`.
- [x] Conta compartilhada (D7); `anon key` no bundle e **senha fora do repositório e
  fora das variáveis de ambiente do Vercel** (D8). Login manual — senha embutida no
  código daria acesso total a quem lesse o bundle. Conta criada, cadastro público
  desligado, `.env.local` preenchido com `Project URL`/`anon key`.
- [x] Aceite: insert e select manuais pelo painel respeitando a RLS. Rodado por completo
  em 2026-08-18 (`0002-aceite.sql`), depois de uma correção no meio do caminho.

##### Resultado da Fase 2

**O que existe:** `supabase/sql/0001-estado-e-rls.sql` (schema, gatilhos, RLS, grants),
`supabase/sql/0002-aceite.sql` (o roteiro de aceite, autocontido bloco a bloco),
`supabase/README.md` (passo a passo do painel) e `.env.example`. `DEC-0042` registra as
decisões de schema e o achado de metodologia. Nenhuma linha de `src/` foi tocada — esta
fase não altera o app, como o roadmap previa.

**Executado e validado no painel real**, não só escrito: projeto Supabase criado, conta
compartilhada criada com cadastro público desligado, schema aplicado, UID autorizado na
allowlist, e o roteiro de aceite rodado do início ao fim. `.env.local` local preenchido
com `Project URL` e `anon key` (públicas por design); a `service_role key` não saiu do
painel.

**Quatro decisões de schema além do que a fase pedia**, detalhadas na `DEC-0042`:

1. **Allowlist `contas_autorizadas`.** "RLS" sozinha não fecha o buraco: o cadastro
   público vem ligado por padrão no Supabase e a `anon key` está no bundle, então
   `to authenticated` liberaria qualquer pessoa que se cadastrasse. A policy passa a
   exigir presença numa tabela que a própria API não enxerga.
2. **Versão e data carimbadas pelo servidor**, por gatilho `before insert/update`. O
   cliente manda payload e `usuario` e não escolhe o próprio número de versão. Relógio de
   notebook errado deixa de poder reordenar o histórico.
3. **Histórico em tabela separada, escrita só pelo gatilho.** O cliente lê o ancestral e
   não grava nele. Sem policy de escrita, histórico não se forja.
4. **Retenção de 100 versões**, por contagem e não por prazo. Ver o raciocínio do número
   na `DEC-0042`.

**A trava otimista da Fase 3 já está pronta como cláusula `where`**, não como código de
servidor: `update estado set ... where id = 1 and versao = <a carregada>`. Uma linha
afetada é aceite; zero linhas é a recusa. A Fase 3 fica sendo cliente e mensagem de erro,
não mecânica nova.

**Dois achados reais só apareceram ao rodar o aceite de verdade, não na leitura do
script** — motivo pelo qual esta fase só foi marcada como entregue depois da execução:

1. **Falso alarme investigado até a causa real.** O Bloco 5 (autoconcessão de acesso)
   pareceu ter sido bem-sucedido na primeira rodada — apareceu uma linha nova em
   `contas_autorizadas` com um UUID aleatório. Não era o schema: era o SQL Editor do
   Supabase não preservando `set role`/`set_config` entre execuções separadas ("Run" por
   bloco). O Bloco 5 rodou como `postgres` (dono das tabelas, ignora RLS), não como
   `authenticated`. Confirmado com um teste isolado (`begin; set local role
   authenticated; ...; rollback;`) que o insert é negado quando a sessão é mesmo
   `authenticated`.
2. **Roteiro corrigido para não depender de continuidade de sessão.** `0002-aceite.sql`
   passou a refazer `set_config`/`set role` do zero em cada bloco, com um `do $$ ...
   raise exception ... $$;` logo depois de cada `set role` que aborta com erro claro se
   `current_user` não virou quem devia — transforma "sucesso indevido e silencioso" em
   erro visível, caso o mesmo problema se repita.

#### Fase 3 — Trava otimista (risco médio)

- [ ] Enviar payload mais versão esperada; servidor aceita e incrementa, ou recusa.
- [ ] Na recusa: aviso claro, backup baixado, nada descartado.
- [ ] Falha de rede nunca impede o uso local nem a gravação local, e nunca é
  silenciosa.
- **Ao fim desta fase já existe sincronização utilizável e sem perda silenciosa.** O
  merge da Fase 4 é conforto, não correção — se o projeto parar aqui, o resultado
  ainda é melhor que hoje.
- Aceite: dois navegadores convergem; o segundo a salvar é recusado com mensagem
  compreensível e sai com backup na mão.

#### Fase 4 — Merge assistido de três vias (RISCO ALTO — o coração do projeto)

- [ ] Buscar do servidor a versão carregada (ancestral) no momento da recusa.
- [ ] Auto-resolver o que só um lado mudou; deduzir exclusão pela ausência em relação
  ao ancestral; apresentar para escolha só o que os dois mudaram, mostrando
  `updatedAt` e `usuario`.
- [ ] Tratar aninhados (`dividas[].amortizacoes`, `cofrinhos[].aportes`,
  `cats[].subs`, `params.autoCategoryRules`) pela mesma lógica, recursiva.
- [ ] Backup automático **antes** de aplicar o resultado.
- [ ] Se o ancestral não for recuperável, degradar para o comportamento da Fase 3.
- [ ] **Teste antes do código**, com os cenários: alterado só de um lado; alterado dos
  dois; apagado de um e editado do outro; aninhado alterado em filhos diferentes;
  ancestral indisponível.
- Aceite: nenhum cenário da bateria perde dado sem o usuário ter escolhido.

#### Fase 5 — Orquestração (risco médio)

- [ ] Sync ao abrir, ao sair e por botão manual (D6).
- [ ] **"Apagar dados financeiros" passa a propagar** (T4): backup automático baixado
  antes e confirmação por digitação no lugar do `window.confirm`.
- Aceite: os dois dispositivos convergem em uso normal de um dia.

#### Fase A — Deploy e cutover (risco baixo)

- [ ] Publicar em `*.vercel.app` (T1), **sem PWA** (T2) — `RN017` já alterada para
  separar "gerar backup não exige rede" de "carregar o app publicado exige".
- [ ] Cutover: os dois abrem a URL, um cadastra contas, saldos iniciais e
  recorrências, o sync é ligado.
- Aceite: os dois notebooks operando na mesma base pela URL pública.

### Backlog aberto (sem versão agendada, baixa prioridade)

- [ ] Feedback visual do resultado da importação de backup na aba Parâmetros. O
  estado existia desde a versão inicial e nunca foi preenchido (achado da Fase 0
  da v0.3.38); o código morto foi removido. É feature nova, não conserto.
- [ ] Separar exports de não-componentes em `Label.jsx`, `TransactionFiltersPanel.jsx`,
  `AppShell.jsx`, `RequiredFieldModal.jsx` e `Toast.jsx` para que o Fast Refresh
  valha também nesses arquivos (8 warnings de `react-refresh/only-export-components`).
- [ ] Avaliar a adoção do conjunto do React Compiler no `eslint-plugin-react-hooks` v7
  (`immutability`, `purity`, `use-memo`, `set-state-in-effect`), fora do escopo da
  Fase 0 por tamanho.
- [ ] Exportação CSV além de TXT para despesas de cartão.
- [ ] Relatório por pessoa em formato exportável.
- [ ] Gráficos de evolução por pessoa e de impacto de simulações.
- [ ] Suporte a arquivos Pluxee com carteira Alimentação e com mais de um
  ano no mesmo PDF; avaliar PDFs sem texto pesquisável.
- [ ] Avaliar suporte a outros fornecedores de vale-benefício além da
  Pluxee.
- [ ] Testes de integração leves com `@testing-library/react`.
- [ ] Smoke test E2E (Playwright) cobrindo o checklist de fatura.
