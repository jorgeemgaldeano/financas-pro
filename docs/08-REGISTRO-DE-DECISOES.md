# Registro de Decisões Técnicas — Finanças PRO

Use este arquivo para registrar decisões importantes do projeto.

## Modelo de decisão

```md
## DEC-0001 — Título da decisão

Data: AAAA-MM-DD

### Contexto

Descrever o problema, necessidade ou dúvida.

### Decisão

Descrever a decisão tomada.

### Alternativas avaliadas

- Alternativa 1.
- Alternativa 2.
- Alternativa 3.

### Consequências positivas

- Benefício 1.
- Benefício 2.

### Consequências negativas ou riscos

- Risco 1.
- Risco 2.

### Impacto em LocalStorage

Informar se houve impacto.

### Impacto em regra de negócio

Informar se houve impacto.
```

---

## DEC-0001 — Manter LocalStorage como persistência inicial

Data: 2026-06-27

### Contexto

O aplicativo Finanças PRO está sendo desenvolvido como aplicação local, sem backend, usando React + Vite.

### Decisão

Manter o LocalStorage como mecanismo de persistência nesta fase.

### Alternativas avaliadas

- Backend próprio.
- Firebase/Supabase.
- IndexedDB.
- LocalStorage.

### Consequências positivas

- Simplicidade.
- Execução local.
- Menor barreira de entrada.
- Facilidade de teste inicial.

### Consequências negativas ou riscos

- Dados ficam restritos ao navegador/dispositivo.
- Risco de perda se o navegador limpar dados.
- Limitações de tamanho.
- Não há sincronização nativa.

### Impacto em LocalStorage

Mantém o uso atual.

### Impacto em regra de negócio

Sem impacto direto.

---

## DEC-0002 — Evolução incremental, sem reescrita total

Data: 2026-06-27

### Contexto

A aplicação possui muitas funcionalidades concentradas no `App.jsx`.

### Decisão

A modularização será feita em etapas pequenas e seguras.

### Alternativas avaliadas

- Reescrever tudo.
- Migrar para arquitetura completa de uma vez.
- Refatorar gradualmente.

### Consequências positivas

- Menor risco.
- Aplicação continua funcionando.
- Facilita validação.
- Preserva regras existentes.

### Consequências negativas ou riscos

- Evolução mais lenta.
- Algumas duplicidades podem permanecer temporariamente.

### Impacto em LocalStorage

Sem impacto imediato.

### Impacto em regra de negócio

Sem impacto imediato.

---

## DEC-0003 — Cartão deve possuir conta associada

Data: 2026-06-27

### Contexto

O pagamento da fatura do cartão deve ser lançado como débito na conta corrente associada.

### Decisão

Cada cartão deve possuir `accountId`, informado no cadastro.

### Alternativas avaliadas

- Vincular cada despesa de cartão a uma conta.
- Vincular somente o cartão à conta.
- Escolher conta no momento do fechamento da fatura.

### Consequências positivas

- Simplifica despesas individuais do cartão.
- Centraliza regra no cartão.
- Facilita geração automática do pagamento da fatura.
- Evita duplicidade de vínculo.

### Consequências negativas ou riscos

- Cartões antigos precisam de migração ou tratamento.
- Alteração da conta do cartão exige regra clara para faturas já fechadas.

### Impacto em LocalStorage

Adicionar campo `accountId` aos cartões.

### Impacto em regra de negócio

Alto. Impacta fechamento e pagamento de fatura.

## DEC-0004 — Desprezar BB Rende Fácil na importação bancária

Data: 2026-06-27

### Contexto

Movimentações BB Rende Fácil representam movimentação automática entre conta corrente e poupança associada. Caso sejam importadas como lançamentos financeiros comuns, podem gerar duplicidade e distorcer o saldo.

### Decisão

Ignorar automaticamente transações com descrição BB Rende Fácil ou Rende Fácil durante a importação bancária.

### Alternativas avaliadas

- Importar e deixar o usuário excluir manualmente.
- Classificar como transferência.
- Ignorar automaticamente por regra.

### Consequências positivas

- Evita duplicidade.
- Reduz necessidade de limpeza manual.
- Melhora confiabilidade da importação bancária.

### Consequências negativas ou riscos

- Descrições diferentes podem não ser capturadas.
- Caso o banco altere o texto, a regra precisará ser atualizada.

### Impacto em LocalStorage

Sem alteração estrutural.

### Impacto em regra de negócio

Médio. Afeta quais registros importados viram lançamentos financeiros.

## DEC-0005 — Rastrear importações por lote

Data: 2026-06-27

### Contexto

O usuário precisa conferir importações e desfazer um lote inteiro quando houver erro.

### Decisão

Adicionar `importBatchId` aos lançamentos importados e permitir desfazer lote.

### Alternativas avaliadas

- Excluir lançamento por lançamento.
- Criar backup obrigatório antes de importar.
- Rastrear lote por identificador.

### Consequências positivas

- Facilita correção de importações equivocadas.
- Preserva lançamentos manuais.
- Cria base para histórico de importações.

### Consequências negativas ou riscos

- Lançamentos importados editados manualmente ainda serão removidos ao desfazer o lote.

### Impacto em LocalStorage

Adiciona campo opcional em lançamentos importados.

### Impacto em regra de negócio

Médio. Introduz rastreabilidade de origem.

## DEC-0006 — Competência da fatura pode ser manual ou calculada

Data: 2026-06-27

### Contexto

Compras de cartão precisam entrar na fatura correta. A data da compra nem sempre corresponde ao mês da fatura impactada, especialmente quando a compra ocorre após o fechamento ou quando a fatura já foi fechada manualmente.

### Decisão

Permitir competência manual opcional no lançamento de cartão. Quando ausente, calcular a competência pela data da compra, fechamento do cartão e situação da fatura.

### Alternativas avaliadas

- Sempre usar mês da compra.
- Sempre exigir competência manual.
- Calcular automaticamente, permitindo sobrescrita manual.

### Consequências positivas

- Mais aderente à operação real de cartão.
- Reduz erro em compras após fechamento.
- Permite correção manual pelo usuário.

### Consequências negativas ou riscos

- Competência manual incorreta pode distorcer fatura.
- Exige boa indicação visual na interface.

### Impacto em LocalStorage

Adiciona campos opcionais `competencia` e/ou `faturaCompetencia` nos lançamentos de cartão.

### Impacto em regra de negócio

Alto. Define a fatura efetivamente impactada pelo lançamento.

## DEC-0007 — Simulações devem ser persistidas e recalculáveis

Data: 2026-06-27

### Contexto

Simulações precisam ser acompanhadas ao longo do tempo e comparadas contra a situação atualizada.

### Decisão

Persistir simulações, permitir recálculo e exibir impacto conforme número de parcelas e competência de fatura.

### Alternativas avaliadas

- Manter simulações apenas em memória.
- Criar lançamentos previstos reais.
- Persistir como simulação independente.

### Consequências positivas

- Usuário pode comparar cenários posteriormente.
- Não mistura simulação com lançamento real.
- Permite refazer análise com dados atualizados.

### Consequências negativas ou riscos

- Requer inclusão no backup/restauração.
- Pode exigir limpeza manual periódica.

### Impacto em LocalStorage

Adiciona chave própria para simulações.

### Impacto em regra de negócio

Médio. Afeta projeções simuladas, sem alterar lançamentos reais.


## DEC-0008 — Backup com envelope e snapshot de LocalStorage

Data: 2026-06-27

### Contexto

Após a inclusão de simulações persistidas, metadados de importação e regras editáveis de autocategorização, o backup precisava ser revisado para evitar perda de dados em restaurações futuras.

### Decisão

Reforçar o backup/restauração dentro do `App.jsx`, sem criar ainda um `backupService.js`, usando envelope com metadados e snapshot bruto das chaves conhecidas do LocalStorage.

### Alternativas avaliadas

- Criar imediatamente `backupService.js`.
- Consolidar todos os dados em uma chave única.
- Manter backup simples apenas por estado React.
- Criar envelope de backup conservador preservando as chaves atuais.

### Consequências positivas

- Reduz risco de perda de simulações.
- Preserva metadados de importação já existentes.
- Mantém compatibilidade com o modelo atual de múltiplas chaves.
- Evita modularização prematura em uma etapa de estabilização.
- Facilita migração futura para `backupService.js`.

### Consequências negativas ou riscos

- Ainda há lógica de backup dentro do `App.jsx`.
- O snapshot bruto aumenta o tamanho do arquivo de backup.
- Será necessário refatorar para service em etapa futura.

### Impacto em LocalStorage

Não altera chaves existentes. Apenas reforça leitura/exportação/restauração das chaves atuais.

### Impacto em regra de negócio

Sem impacto nas regras financeiras. Impacto positivo na proteção dos dados.

---

## DEC-0009 — Reutilizar antes de criar e avaliar bibliotecas compatíveis

Data: 2026-06-29

### Contexto

O Finanças PRO cresceu a partir de um `App.jsx` concentrando telas, regras, cálculos, persistência e componentes internos. Com novas funcionalidades, há risco de duplicação de código, criação de padrões paralelos e aumento de complexidade sem necessidade.

### Decisão

Antes de qualquer novo desenvolvimento, correção ou refatoração, deve-se verificar primeiro se já existe solução reaproveitável no projeto, depois se React nativo resolve, depois se há biblioteca JavaScript/React compatível, e somente então criar código próprio.

### Alternativas avaliadas

- Continuar criando soluções próprias diretamente.
- Adotar bibliotecas preventivamente para todas as áreas.
- Reescrever o projeto com uma stack completa.
- Criar regra incremental de reutilização e avaliação antes de novas criações.

### Consequências positivas

- Reduz duplicidade.
- Reduz risco de divergência entre telas.
- Facilita modularização incremental.
- Melhora manutenção.
- Evita dependências desnecessárias.
- Prepara o projeto para adoção criteriosa de bibliotecas.

### Consequências negativas ou riscos

- Desenvolvimento pode exigir análise prévia maior.
- Algumas soluções simples podem demorar mais para serem padronizadas.
- Bibliotecas úteis podem ser adiadas até haver necessidade concreta.

### Impacto em LocalStorage

Sem impacto direto. A diretriz não altera chaves, formatos ou dados persistidos.

### Impacto em regra de negócio

Sem impacto nas regras financeiras. A decisão altera apenas o processo técnico de evolução.


---

## DEC-0010 — Recategorização protegida e filtros sem nova dependência

Data: 2026-06-29

### Contexto

A aplicação precisava permitir edição de categorização após a gravação, filtros na aba **Lançamentos** e recategorização também nas abas **Contas** e **Cartões**. Também foi identificada necessidade de reduzir risco de alterações acidentais de categoria.

### Decisão

Implementar a recategorização por botão **Editar/OK**, usando React nativo e componentes já existentes, sem adicionar biblioteca externa. Os filtros foram implementados como estado local de interface e não são persistidos no LocalStorage.

### Alternativas avaliadas

- Deixar o seletor de categoria sempre editável.
- Criar modal específico para cada recategorização.
- Adotar biblioteca de tabela/filtro.
- Usar controle simples com estado React e botão de confirmação.

### Consequências positivas

- Reduz risco de troca acidental de categoria.
- Evita dependência externa para filtros simples.
- Reaproveita padrões existentes do projeto.
- Mantém a evolução incremental dentro do `App.jsx`.

### Consequências negativas ou riscos

- A lógica de recategorização ainda está dentro do `App.jsx`.
- Pode haver duplicidade temporária até futura extração de componente reutilizável.
- Filtros mais avançados no futuro podem justificar componente próprio ou biblioteca de tabela.

### Impacto em LocalStorage

Sem alteração de chave. A recategorização altera apenas campos de categoria já existentes nos lançamentos.

### Impacto em regra de negócio

Baixo. A regra financeira não foi alterada; foi alterado apenas o modo de edição da categorização.

---

## DEC-0011 — Metas devem ser restauradas como objeto

Data: 2026-06-29

### Contexto

Após restauração de backup, os limites/metas por categoria não estavam sendo recuperados corretamente. A causa provável foi normalização de `metas` como array, embora a aplicação trate limites por categoria como objeto.

### Decisão

Manter `metas` como objeto na exportação, restauração e fallback seguro. Backups sem metas devem usar `{}`.

### Alternativas avaliadas

- Converter metas para array.
- Criar nova chave de LocalStorage para metas.
- Manter o formato atual como objeto e corrigir a restauração.

### Consequências positivas

- Preserva compatibilidade com dados existentes.
- Evita migração desnecessária.
- Corrige restauração de backup sem alterar regra de negócio.

### Consequências negativas ou riscos

- O formato de metas continua dependente de documentação clara até futura centralização em service de storage.

### Impacto em LocalStorage

Sem alteração de chave e sem alteração intencional do formato persistido. Correção para preservar o formato atual.

### Impacto em regra de negócio

Médio positivo. Garante que limites por categoria continuem disponíveis após restauração de backup.


---

## DEC-0011 — Preparar arquitetura para Vercel e SQL sem migração imediata

Data: 2026-07-02

### Contexto

Após a estabilização das regras de cartão/fatura nas versões `v0.3.16`, `v0.3.16.1` e `v0.3.16.2`, foi avaliada a possibilidade de publicação no Vercel e futura migração para banco SQL.

A aplicação ainda opera em React + Vite com persistência em LocalStorage, e a versão `v0.3.16.2` ainda depende de validação manual antes de ser considerada estável.

### Decisão

Preparar gradualmente a arquitetura para futura publicação no Vercel e futura migração para backend/API com banco SQL, sem executar a migração neste momento.

A aplicação continuará usando LocalStorage até que as regras financeiras críticas estejam validadas e até que exista uma primeira versão estável/UAT.

### Alternativas avaliadas

- Publicar imediatamente no Vercel mantendo LocalStorage.
- Criar backend e banco SQL imediatamente.
- Aguardar a primeira versão estável antes de qualquer preparação.
- Preparar a arquitetura agora, mantendo LocalStorage e adiando backend/SQL.

### Consequências positivas

- Reduz risco de modelar banco com regras ainda instáveis.
- Permite publicar futuramente no Vercel sem bloquear a evolução local.
- Direciona as próximas refatorações para services e repositories.
- Facilita futura troca de LocalStorage por API.
- Mantém o foco atual na validação da regra financeira.

### Consequências negativas ou riscos

- A sincronização entre dispositivos continuará inexistente enquanto o app usar LocalStorage.
- A publicação no Vercel, quando feita, não resolverá persistência centralizada.
- Será necessário desenhar uma estratégia formal de migração de dados antes do SQL.

### Impacto em LocalStorage

Sem impacto imediato. A decisão reforça que o LocalStorage permanece como persistência oficial até nova decisão técnica.

### Impacto em regra de negócio

Sem alteração direta. A decisão afeta apenas a estratégia técnica futura.

### Diretriz prática

As próximas versões devem priorizar:

1. Validar a `v0.3.16.2`.
2. Extrair `cardInvoiceService.js` sem alterar comportamento.
3. Criar uma camada local de repository/storage antes de qualquer backend.
4. Publicar no Vercel apenas quando houver build validado e versão estável de teste.
5. Planejar backend/SQL após estabilização funcional e UAT inicial.


---

## DEC-0012 — Criar camada local de repository/storage antes de backend

Data: 2026-07-04

### Contexto

Após a aprovação da `v0.3.17.4`, a próxima evolução escolhida foi a opção B: iniciar uma camada local de repository/storage. O objetivo é reduzir o acoplamento direto com LocalStorage e preparar o projeto para futura publicação, backend/API e SQL, sem alterar a persistência oficial neste momento.

### Decisão

Criar `src/services/financeRepository.js` como camada intermediária de acesso ao LocalStorage e atualizar `src/hooks/useLocalStorage.js` para delegar leitura e gravação ao repository local.

A assinatura pública de `useLS`, `lsGet` e `lsSave` deve ser preservada para evitar impacto no `App.jsx`.

### Alternativas avaliadas

- Manter acesso direto ao LocalStorage no hook atual.
- Substituir LocalStorage por backend/API agora.
- Criar repository local conservador mantendo LocalStorage.

### Consequências positivas

- Reduz acoplamento técnico.
- Facilita futura troca de persistência.
- Mantém comportamento atual da aplicação.
- Evita migração prematura para backend ou SQL.

### Consequências negativas ou riscos

- A camada inicial ainda é simples e não substitui uma estratégia completa de migração.
- Pode haver falsa sensação de backend; os dados continuam locais no navegador.
- Exige validação cuidadosa de persistência após recarregar a aplicação.

### Impacto em LocalStorage

Sem alteração de chaves ou estrutura. LocalStorage continua sendo a persistência oficial.

### Impacto em regra de negócio

Sem alteração de regra financeira.


## DEC-0012 — Extrair cálculo de Projeções para service próprio

Data: 2026-07-04

### Contexto

Após a aprovação da `v0.3.18`, o projeto passou a contar com uma camada inicial de repository/storage. A sequência técnica prevista indicava revisar a tela **Projeções** usando services, preparando a aplicação para maior modularização sem alterar regra financeira.

### Decisão

Criar `src/services/projectionService.js` e mover para ele o cálculo puro das projeções mensais, mantendo o `App.jsx` responsável apenas por chamar o service dentro de `useMemo`.

### Alternativas avaliadas

- Manter o cálculo inline no `App.jsx`.
- Reescrever toda a tela de Projeções.
- Criar uma página separada `ProjectionsPage.jsx` nesta etapa.
- Extrair somente o cálculo puro para service.

### Consequências positivas

- Reduz responsabilidade do `App.jsx`.
- Facilita testes futuros de Projeções.
- Prepara a separação gradual entre UI e regra de cálculo.
- Mantém a aplicação executável a cada etapa.

### Consequências negativas ou riscos

- A tela de Projeções ainda permanece renderizada dentro do `App.jsx`.
- O cálculo continua simples e deve ser revisado futuramente para considerar mais detalhes financeiros, se aprovado.

### Impacto em LocalStorage

Nenhum.

### Impacto em regra de negócio

Nenhuma alteração intencional. A regra atual foi apenas movida para service.


## DEC-0018 — Projeções devem usar dados reais e fluxo de caixa

Data: 2026-07-04

### Contexto

A aba Projeções exibia visão genérica baseada em fixos e variáveis, sem permitir análise financeira real.

### Decisão

A partir da `v0.3.20`, a aba Projeções deve usar dados reais existentes no sistema e exibir gráfico de fluxo de caixa.

### Alternativas avaliadas

- Manter média de fixos e variáveis.
- Apenas trocar os rótulos da tela.
- Recalcular projeções com receitas, despesas, faturas e simulações.

### Consequências positivas

- Melhora a análise financeira.
- Permite visualizar evolução do saldo.
- Prepara a tela para relatórios mais úteis.

### Consequências negativas ou riscos

- Maior complexidade de cálculo.
- Risco de duplicidade entre despesa de cartão e pagamento de fatura, mitigado pela separação de fatura como saída de caixa.

### Impacto em LocalStorage

Sem impacto estrutural.

### Impacto em regra de negócio

Médio/alto na interpretação da aba Projeções. Não altera regras de lançamento, fatura ou baixa.

## DEC-0021 — Detalhamento expansível das projeções

Data: 2026-07-04

### Contexto

A `v0.3.20` substituiu a projeção genérica por fluxo de caixa real, porém os totais ainda precisavam ser auditáveis pelo usuário.

### Decisão

Adicionar detalhamento expansível por competência na aba Projeções, agrupando os itens por receitas, despesas, faturas e simulações.

### Alternativas avaliadas

- Manter apenas totais consolidados.
- Criar uma nova tela de auditoria de projeção.
- Adicionar expansão diretamente na tabela de Projeções.

### Consequências positivas

- Melhora a rastreabilidade dos números.
- Facilita conferência manual.
- Evita criar nova tela neste momento.
- Preserva a estrutura de persistência.

### Consequências negativas ou riscos

- A tabela fica visualmente mais densa.
- Meses com muitos itens podem exigir refinamento posterior.

### Impacto em LocalStorage

Nenhum.

### Impacto em regra de negócio

Baixo. A regra de cálculo da `v0.3.20` foi preservada; a mudança é de rastreabilidade e exibição.


## DEC-0021 — Reduzir detalhamento visual das Projeções

Data: 2026-07-04

### Contexto

O detalhamento de receitas e despesas na aba Projeções pode gerar excesso de informação e dificultar a análise.

### Decisão

Manter receitas e despesas nos totais mensais, mas restringir o detalhamento expansível a Cartões/Faturas e Simulações.

### Impacto em LocalStorage

Nenhum.

### Impacto em regra de negócio

Baixo. A regra de cálculo foi preservada; a alteração é de apresentação.

## DEC-0015 — Projeções com filtros, indicadores e recorrências analíticas

Data: 2026-07-04

### Contexto

A aba Projeções evoluiu para fluxo de caixa real, mas precisava permitir análise por filtros e leitura gerencial do período. Também havia necessidade de considerar recorrências existentes sem criar um novo modelo persistido antes de validação funcional.

### Decisão

Consolidar na `v0.3.22` filtros avançados, indicadores analíticos e projeção conservadora de recorrências a partir de lançamentos marcados como `fixo: true`.

### Alternativas avaliadas

- Criar modelo novo de recorrências com persistência.
- Manter apenas lançamentos já existentes, sem projeção futura.
- Criar projeção analítica de recorrências sem gravar dados.

### Decisão aplicada

Usar projeção analítica sem alterar LocalStorage.

### Consequências positivas

- Melhora a utilidade da aba Projeções.
- Evita migração prematura.
- Permite validar a lógica de recorrência antes de criar modelo persistido.
- Mantém o aplicativo executável e compatível com dados existentes.

### Consequências negativas ou riscos

- Recorrências projetadas são inferidas por `fixo: true`, não por um modelo formal de recorrência.
- Pode ser necessário revisar futuramente casos de recorrências mais complexas.
- Filtros por categoria não representam faturas agregadas, pois faturas não possuem categoria única.

### Impacto em LocalStorage

Nenhum.

### Impacto em regra de negócio

Médio. Altera a leitura funcional da aba Projeções, mas não altera dados gravados nem regras de fechamento, baixa ou fatura.

## DEC-0023 — Projetar recorrências previstas sem alterar LocalStorage

Data: 2026-07-04

### Contexto

Na `v0.3.22`, o filtro **Projetar recorrências** não apresentava efeito prático suficiente, pois removia apenas recorrências inferidas dinamicamente, mas não removia lançamentos fixos/recorrentes previstos já materializados no array de transações.

### Decisão

A projeção passa a diferenciar recorrências previstas de recorrências já realizadas. Ao desmarcar **Projetar recorrências previstas**, o sistema remove apenas recorrências ainda previstas da projeção analítica, preservando valores já pagos ou recebidos.

### Alternativas avaliadas

- Criar modelo formal de recorrência com nova estrutura persistida.
- Remover todas as recorrências, inclusive realizadas.
- Corrigir apenas a camada de projeção, sem alterar persistência.

### Decisão adotada

Corrigir apenas a camada de projeção, sem alterar LocalStorage.

### Consequências positivas

- Corrige o filtro sem migração.
- Evita perda de dados.
- Mantém histórico realizado no cálculo.
- Preserva estabilidade das versões anteriores.

### Consequências negativas ou riscos

- Ainda não cria um modelo formal de recorrência.
- A identificação depende dos campos atuais `fixo`, `recorrenciaId` e `parcelaGrupo`.

### Impacto em LocalStorage

Nenhum.

### Impacto em regra de negócio

Médio, restrito à interpretação da projeção analítica.


## DEC-00XX — Duplicidade estrita em importações

Data: 2026-07-04

### Contexto

A importação bancária e de cartão permitia duplicidade quando registros já existentes eram carregados novamente.

### Decisão

Adicionar validação conservadora por destino, data, descrição normalizada, valor e tipo, executada na prévia e na confirmação da importação.

### Impacto em LocalStorage

Sem impacto.

### Impacto em regra de negócio

Médio. Protege a integridade dos lançamentos importados e evita distorção em saldo, fatura e projeções.

## DEC — Duplicidade complementar em cartão e Pluxee

Data: 2026-07-04

### Contexto

A validação por data, descrição e valor funcionou para extrato bancário, mas ainda havia falso negativo em cartão de crédito, especialmente quando registros podiam usar `data` e `dataCompra`. O Pluxee também precisava da mesma proteção.

### Decisão

Gerar candidatos de chave de duplicidade considerando `dataCompra` e `data`, com destino, descrição normalizada, valor e tipo. Aplicar a mesma estratégia para cartão e Pluxee.

### Impacto em LocalStorage

Nenhum.

### Impacto em regra de negócio

Médio, restrito à prevenção de duplicidade em importações.

---

## v0.3.25 — Controle interno de parcelamentos de cartão

- Criado controle lógico de parcelamento 1:N na importação de cartão.
- Parcelas futuras já previstas deixam de ser importadas novamente.
- Divergências de parcelamento passam a ser apontadas no relatório da importação.
- Campos opcionais `parcelaGrupo` e `descricaoBaseParcelamento` são aplicados a novos lançamentos parcelados.
- Sem alteração de chaves do LocalStorage e sem migração obrigatória.

---

## DEC-v0.3.26.2 — Master lógico de parcelamento com tolerância de valor

**Data:** 2026-07-04

### Contexto

A importação de cartão ainda apresentava inconsistências em compras parceladas. A identificação apenas por descrição e data da compra não era suficiente, pois o usuário pode realizar duas compras no mesmo local, na mesma data, com o mesmo número de parcelas, mas com valores diferentes.

### Decisão

O master lógico do parcelamento será identificado por:

```txt
cartão + descrição base normalizada + data da compra + valor da parcela com tolerância de R$ 0,10
```

### Justificativa

A inclusão do valor da parcela evita misturar compras diferentes. A tolerância de R$ 0,10 reduz falsos negativos causados por arredondamentos, diferenças de centavos ou formatação dos arquivos importados.

### Impacto em LocalStorage

Nenhuma nova chave obrigatória, nenhuma migração e nenhuma alteração estrutural.

### Escopo

Aplica-se somente à importação de cartão de crédito.

### Fora do escopo

Fechamento de fatura, pagamento previsto, baixa parcial, projeções e layout.

---

## DEC — Separar duplicidade de compra à vista e compra parcelada

Data: 2026-07-04

### Contexto

A primeira carga de uma compra parcelada em cartão sem histórico gerava as parcelas futuras, mas as parcelas subsequentes eram marcadas como duplicadas na prévia.

### Decisão

A chave estrita de compra à vista não será aplicada a compras parceladas. Para parcelamento, a duplicidade será validada por master lógico, parcela e total de parcelas.

### Impacto LocalStorage

Sem alteração estrutural e sem migração.

## DEC-00XX — Validação complementar de fatura subsequente por competência

Data: 2026-07-04

### Contexto

A primeira carga de compras parceladas passou a gerar corretamente parcelas futuras, mas a fatura subsequente podia não reconhecer essas parcelas caso o arquivo do emissor apresentasse data ou descrição diferente da primeira carga.

### Decisão

Manter a regra principal do master lógico por cartão, descrição base, data da compra e valor aproximado, mas adicionar uma validação complementar para faturas subsequentes por competência, número da parcela, total de parcelas, valor aproximado e descrição compatível.

### Alternativas avaliadas

- Usar somente data da compra e descrição exata: descartado por gerar falso negativo em faturas subsequentes.
- Ignorar totalmente data e descrição: descartado por aumentar risco de falso positivo.
- Usar competência + parcela/total + valor + descrição compatível: adotado como fallback conservador.

### Consequências positivas

- Reconhece parcelas futuras já criadas mesmo com pequenas variações do arquivo.
- Preserva a primeira carga funcionando.
- Evita duplicidade em fatura subsequente.

### Consequências negativas ou riscos

- Pode exigir ajuste futuro de compatibilidade de descrição para emissores com descrições muito diferentes.
- Ainda depende de valor aproximado e competência correta.

### Impacto em LocalStorage

Sem impacto estrutural. Nenhuma migração necessária.

### Impacto em regra de negócio

Médio. A importação de cartão passa a ter fallback específico para fatura subsequente.


---

## DEC-0026 — Tolerância de R$ 0,05 e correção manual de sequência de parcelas

Data: 2026-07-04

### Contexto

A importação de faturas subsequentes pode encontrar divergência entre a parcela prevista no sistema e a parcela informada pela administradora do cartão. Exemplo: o sistema possui 03/10 na competência, mas o arquivo informa 02/10.

### Decisão

Reduzir a tolerância de valor de R$ 0,10 para R$ 0,05 e permitir que divergências corrigíveis sejam ajustadas manualmente pelo usuário na prévia da importação.

### Consequências positivas

- Reduz falso positivo entre compras com valores próximos.
- Evita importação automática incorreta.
- Permite corrigir sequência de parcelas quando a administradora pulou ou repetiu parcela.

### Consequências negativas ou riscos

- A correção manual altera lançamentos já gravados.
- Exige confirmação e teste cuidadoso antes de avançar com a importação.

### Impacto em LocalStorage

Sem nova chave e sem migração. A ação manual altera campos já existentes em lançamentos do cartão.

### Impacto em regra de negócio

Alto para importação de cartão, pois adiciona fluxo de análise e correção manual de divergência de parcelamento.

---

## DEC-0026 — Painel de divergências de parcelamento

Data: 2026-07-04

### Contexto

A importação de cartão passou a detectar divergência entre a parcela gravada no sistema e a parcela informada no arquivo. Porém, a correção automática poderia alterar indevidamente a sequência ou gerar comportamento inesperado.

### Decisão

Divergências de parcela serão tratadas em painel próprio no final da página de revisão da importação. Nenhuma alteração será aplicada automaticamente.

O usuário poderá:

- manter como está;
- alterar somente a parcela da competência atual;
- alterar a parcela atual e as subsequentes.

### Alternativas avaliadas

- Corrigir automaticamente a sequência.
- Criar nova parcela final automaticamente.
- Bloquear tudo sem ação de correção.
- Criar painel de decisão manual.

### Consequências positivas

- Reduz risco de alteração indevida.
- Dá controle explícito ao usuário.
- Preserva dados já gravados até confirmação.
- Evita criação automática de parcela final.

### Consequências negativas ou riscos

- A importação exige mais uma etapa de análise quando houver divergência.
- A correção manual altera lançamentos já persistidos e deve ser validada com cuidado.

### Impacto em LocalStorage

Sem nova chave e sem migração. Apenas campos opcionais de rastreabilidade podem ser gravados nos lançamentos alterados.

### Impacto em regra de negócio

Alto para importação de cartão, pois define o comportamento correto para divergências de sequência de parcelas.

---

## DEC-0027 — Classificar lançamento de fatura OFX pelo TRNTYPE, não só pelo sinal do TRNAMT

Data: 2026-07-07

### Contexto

Na importação de fatura de cartão via OFX do Banco do Brasil, `parseOFX`
decidia receita/despesa unicamente pelo sinal de `TRNAMT`, e descartava
qualquer lançamento com valor positivo (`if (mode === "cartao" && amount >= 0)
continue`). No arquivo real do BB, pagamentos de fatura e estornos
(`TRNTYPE=CREDIT`) nem sempre têm `TRNAMT` positivo, então entravam como
despesa comum em vez de reduzir o total da fatura — gerando divergência
entre o valor calculado no app e o valor real da fatura.

### Decisão

Em `parseOFX`, quando `mode === "cartao"`, usar o campo `TRNTYPE` como fonte
primária de classificação: `CREDIT` → `tipo: "receita"` (reduz a fatura,
via `signedCardAmount`), `PAYMENT` → `tipo: "despesa"` (compõe a fatura).
Quando `TRNTYPE` não é `CREDIT` nem `PAYMENT` (ausente ou outro valor), o
comportamento anterior é mantido como fallback: classifica pelo sinal de
`TRNAMT` e descarta valores positivos.

Complementar: `confirmImport` em `App.jsx` gravava sempre `tipo:"despesa"`
para lançamentos de cartão, independente do que o parser classificava.
Passou a gravar `tipo: r.tipo || "despesa"`, para não anular a correção do
parser no momento de salvar.

### Alternativas avaliadas

- Adicionar um seletor de banco (como já existe para extrato bancário) e
  aplicar a regra só quando `bancoImportacao === "bb"`. Descartada por ora:
  a importação de cartão hoje não tem esse seletor na UI, e `TRNTYPE`
  `CREDIT`/`PAYMENT` já é específico o suficiente para não colidir com
  arquivos de outras administradoras (que tendem a usar `DEBIT` para
  compras).
- Deixar de descartar créditos e apenas inverter o sinal sem olhar
  `TRNTYPE`. Descartada por não refletir o dado real do arquivo do BB
  (`TRNAMT` não é confiável para essa distinção nesse extrato).

### Consequências positivas

- Pagamento de fatura e estorno importados do BB deixam de inflar
  indevidamente o total da fatura.
- Fallback preserva o comportamento existente para arquivos sem `TRNTYPE`
  reconhecido, sem regressão para outras administradoras.

### Consequências negativas ou riscos

- Depende do `TRNTYPE` do arquivo estar correto; se outra administradora
  usar `PAYMENT`/`CREDIT` com semântica diferente da observada no BB, a
  classificação pode sair errada para esse banco. Não há seletor de banco
  na importação de cartão hoje para restringir a regra.

### Impacto em LocalStorage

Nenhum. Sem nova chave, sem migração. Lançamentos importados como `receita`
de cartão já eram suportados por `signedCardAmount` (usado em ajuste de
fatura).

### Impacto em regra de negócio

Médio-alto: altera o valor total calculado da fatura para arquivos OFX do
BB que contenham `TRNTYPE=CREDIT`/`PAYMENT`. Não altera cálculo de fatura
para lançamentos manuais, CSV ou outros bancos.

---

## DEC-0028 — Bloquear exclusão de cartão/conta/categoria em uso (E3/L5)

Data: 2026-07-07

### Contexto

Item de backlog E3/L5 (integridade referencial em exclusões), registrado em
`docs/README-ENCERRAMENTO-SESSAO-2026-07-05.md` como parte da v0.3.29
planejada. Numa auditoria anterior desta mesma sessão, a exclusão de
**pessoa** (`delPessoa`) já foi confirmada correta (remove `dividas` e
`despPess` em cascata). Esta rodada auditou **cartão**, **conta** e
**categoria**, que são containers referenciados por lançamentos reais
(dinheiro) — diferente de pessoa/dívida, onde a dívida não existe sem a
pessoa.

Auditoria encontrou: exclusão de cartão sem checar `trans`/`faturas`/
`despPess`/`sims`; exclusão de conta **sem confirmação nenhuma** e sem checar
`trans`/cartões vinculados (com efeito real — pagamento de fatura podia ser
gravado numa conta fantasma sem erro visível, ver detalhe no changelog
`[0.3.26.9]`); exclusão de categoria sem checar uso, e regra de
autocategorização apontando para categoria excluída continuando a atribuir
`catId` inválido a novas importações indefinidamente.

### Decisão

Bloquear a exclusão (em vez de cascata ou reatribuição assistida por UI)
quando houver dependência real (lançamento/despesa compartilhada/fatura/
simulação), mostrando ao usuário quantos registros de cada tipo estão
vinculados. O usuário resolve manualmente (recategoriza/move/exclui os
lançamentos) antes de conseguir excluir o container.

Para dependências que são apenas **configuração órfã**, não lançamento real
— `metas[catId]` e `params.autoCategoryRules` apontando para uma categoria
que já foi confirmada sem uso — a limpeza é automática, sem exigir
confirmação extra do usuário.

### Alternativas avaliadas

- Cascata (excluir os lançamentos junto com o cartão/conta/categoria).
  Descartada: perde histórico financeiro real, incompatível com a regra
  geral do projeto de não perder dado sem intenção explícita do usuário.
- Reatribuição assistida (seletor no próprio diálogo de exclusão para mover
  lançamentos para outro cartão/conta/categoria antes de excluir). Adiada
  para uma v0.3.29.1 futura, se o usuário sentir falta depois de usar o
  bloqueio simples — exigiria um componente de UI novo, fora do escopo desta
  correção pontual de integridade referencial.

### Consequências positivas

- Nenhuma perda de dado financeiro real por exclusão acidental de
  cartão/conta/categoria em uso.
- Fecha o vetor de bug ativo da regra de autocategorização órfã (`catId`
  inválido sendo atribuído a cada nova importação que bate com a regra).
- Conta ganhou confirmação que não existia antes.

### Consequências negativas ou riscos

- Usuário com muitos lançamentos num cartão/conta/categoria que realmente
  quer excluir vai precisar recategorizar/mover cada um manualmente nesta
  primeira versão (sem reatribuição assistida).
- `cardDependents`/`contaDependents`/`delCat` continuam como closures
  internas de `App.jsx` (mesmo padrão pré-existente), não testáveis via
  Vitest no ambiente atual (`environment: "node"`, sem plugin React) —
  validação desta versão foi feita via E2E manual no preview, não por teste
  automatizado.

### Impacto em LocalStorage

Nenhuma alteração de chave ou estrutura. `metas` e `params.autoCategoryRules`
continuam com o mesmo formato — a mudança é que entradas órfãs são removidas
no momento da exclusão da categoria, em vez de ficarem acumulando
indefinidamente.

### Impacto em regra de negócio

Médio: exclusões que antes eram sempre permitidas (com ou sem confirmação,
dependendo do caso) agora podem ser bloqueadas quando há uso real. Nenhum
cálculo financeiro existente muda — só a possibilidade de excluir um
container que já está em uso.

---

## DEC-0029 — Expor dívida órfã em vez de excluir automaticamente

Data: 2026-07-08

### Contexto

Usuário reportou o KPI "Total de Dívidas" (aba Pessoas) exibindo um valor
que não correspondia a nenhuma pessoa visível na lista. Investigação
confirmou que não há nenhum valor hardcoded no código: os KPIs globais
(`totalDividas`, `totalEmAberto`, `totalPago`) somam todo o array
`dividas` sem checar se `pessoaId` ainda existe em `pessoas`, enquanto a
lista por pessoa (`pessoasSummary`, detalhe de pessoa) filtra por
`pessoaId` válido. Uma dívida órfã (`pessoaId` sem pessoa correspondente
— dado legado anterior à cascata de exclusão, ou backup antigo
restaurado) infla os KPIs do topo indefinidamente, sem nenhum caminho de
UI para o usuário encontrá-la e excluí-la.

### Decisão

Criar `getOrphanDividas(dividas, pessoas)` (`src/utils/dividaUtils.js`) e
exibir um painel "Dívidas sem pessoa vinculada" na lista da aba Pessoas
quando houver dívida órfã, reaproveitando `delDivida` já existente para a
exclusão. Os KPIs globais continuam somando todo o array (não excluir
automaticamente do total).

### Alternativas avaliadas

- Excluir/filtrar a dívida órfã automaticamente dos KPIs e da persistência.
  Descartada: RN020 (não perder dado financeiro sem controle do usuário) —
  a dívida pode representar dinheiro real que o usuário ainda quer revisar
  antes de decidir.
- Deixar como está e apenas documentar. Descartada: não resolve o sintoma
  relatado, o usuário continuaria sem conseguir agir sobre o dado.

### Consequências positivas

- Usuário consegue finalmente ver e excluir (ou decidir manter) o registro
  órfão.
- Protege contra o mesmo sintoma no futuro (ex.: restauração de backup
  antigo com dívida apontando para pessoa já removida).

### Consequências negativas ou riscos

- Nenhum risco identificado; mudança é aditiva (leitura + painel de UI).

### Impacto em LocalStorage

Nenhum. Sem novo campo, sem nova chave, sem migração.

### Impacto em regra de negócio

Baixo: não altera nenhum cálculo financeiro existente, apenas torna
visível e acionável um dado que já existia mas ficava inacessível pela UI.

---

## DEC-0030 — Classificação manual de créditos de cartão na importação

Data: 2026-07-08

### Contexto

Desde a `DEC-0027` (v0.3.26.8), créditos de OFX de fatura de cartão
(`TRNTYPE=CREDIT`) são classificados como `tipo:"receita"` e reduzem a
fatura. Porém `confirmImport` sempre gravava esses créditos com
`competencia: r.competencia || impCompetencia` — ou seja, a competência do
lote inteiro que está sendo importado. Na prática, um crédito pode
representar três coisas diferentes: pagamento da fatura anterior (que já
é tratado por um lançamento próprio de `pagamento_fatura`, então importar
o `CREDIT` do OFX como receita de cartão duplicaria essa redução), crédito
de reparcelamento de uma compra à vista (deveria reduzir a fatura da
competência correspondente à compra, não a do lote atual), ou estorno
(mesma lógica). O comportamento anterior sempre debitava a fatura errada
quando o crédito não pertencia ao mês do lote.

### Decisão

Adicionar campo de classificação manual por linha de crédito na prévia de
importação de cartão (`creditoTipo`: `pagamento_fatura_anterior` |
`parcelamento_avista` | `estorno`, mais `creditoCompetencia` para os dois
últimos). A linha fica bloqueada para seleção/importação até ser
classificada (e, quando aplicável, até ter uma competência de destino
válida). Em `confirmImport`:

- `pagamento_fatura_anterior` → linha é descartada (não gera lançamento),
  mas entra no relatório da importação (`creditosDesconsiderados`) para
  ficar auditável.
- `parcelamento_avista`/`estorno` → lançamento gravado com `competencia`
  igual à competência de destino escolhida pelo usuário, validando antes
  que a fatura de destino não esteja fechada
  (`isInvoiceClosedForNewEntries`) — sem essa checagem, o crédito poderia
  alterar silenciosamente uma fatura já fechada, violando RN012.

Implementado em `src/services/cardImportService.js`
(`classifyImportedCardCreditRows`, `isCardCreditRowBlocked`,
`resolveCardCreditCompetencia`, `CARD_CREDIT_TYPES`) e `confirmImport`
(`src/App.jsx`). Nova `RN030` em `02-REGRAS-DE-NEGOCIO.md`.

### Alternativas avaliadas

- Continuar assumindo que todo crédito pertence à competência do lote.
  Descartada: é exatamente o bug relatado.
- Tentar inferir automaticamente a que compra/fatura um crédito pertence
  (ex.: por valor aproximado e descrição, como já é feito para
  parcelamento). Descartada nesta versão: heurística arriscada para
  dinheiro entrando/saindo de fatura fechada: dado dinheiro real e o risco
  de acerto errado poder fechar/reabrir fatura incorretamente, decisão
  manual explícita é mais segura como primeira versão.
- Permitir salvar o crédito sem competência de destino, caindo de volta
  para `impCompetencia`. Descartada: reintroduziria o bug original por
  omissão do usuário.

### Consequências positivas

- Cada crédito passa a afetar a fatura correta.
- Pagamento de fatura anterior não duplica a redução já feita pelo
  lançamento de `pagamento_fatura`.
- Fatura fechada não pode ser alterada silenciosamente por um crédito mal
  direcionado.
- Nada é descartado sem rastro — o bucket `creditosDesconsiderados` fica
  visível no relatório da importação.

### Consequências negativas ou riscos

- Importação de cartão com créditos passa a exigir uma etapa manual a
  mais (classificar cada crédito) — aceitável dado que é dinheiro real e
  a alternativa (adivinhar) é mais arriscada.
- `creditoCompetencia` depende de `<input type="month">` (`YYYY-MM`);
  não deve ser derivado de `toISOString()` (risco de fuso horário já
  documentado como bug real do projeto).

### Impacto em LocalStorage

Nenhuma chave nova. Novo campo opcional `creditoTipo` no lançamento de
cartão salvo (fallback seguro para dados antigos sem o campo, mesmo
padrão de `importBatchId`). `creditoCompetencia` existe só na prévia em
memória, nunca é persistido.

### Impacto em regra de negócio

Alto para importação de cartão: muda que competência final um crédito do
OFX recebe, e adiciona validação de fatura fechada que não existia para
créditos antes desta versão (só existia para `impCompetencia`).

---

## DEC-0031 — Adiar chamada real de IA na categorização de importação

Data: 2026-07-08

### Contexto

Usuário pediu para incluir IA na classificação automática de lançamentos
importados, hoje 100% baseada em regras de palavra-chave e histórico
(`src/services/categoryService.js`). O projeto não tem backend — qualquer
chamada a uma API de LLM (OpenAI, Anthropic etc.) precisaria ser feita
direto do navegador, expondo a chave de API no código-cliente.

### Decisão

Nesta versão, preparar apenas a estrutura (`src/services/
aiCategorizationService.js`: `isAiCategorizationEnabled(params)`,
`suggestCategoryWithAI(...)`), sem nenhuma chamada de rede real —
`suggestCategoryWithAI` retorna sempre `{ ok:false, reason:"not_configured" }`.
Novo campo opcional `params.aiCategorization = { enabled:false }`, com
toggle "Sugestão de categoria por IA (beta)" em Parâmetros. O fluxo real
de importação continua usando só `guessCategoryForTransaction` — o toggle
não muda nenhum resultado de categorização ainda.

### Alternativas avaliadas

- Implementar a chamada real já nesta versão, com chave de API guardada em
  `params` (LocalStorage). Descartada por ora: usuário optou
  explicitamente por preparar a estrutura primeiro e decidir o provedor
  depois, evitando expor uma chave real antes dessa decisão.
- Não fazer nada até a decisão de provedor. Descartada: usuário queria ver
  o scaffold pronto para poder ligar rapidamente depois.

### Consequências positivas

- Fluxo de importação real não muda nesta versão (zero risco de regressão
  na categorização).
- Quando o provedor for escolhido, a integração tem um ponto único de
  entrada já preparado (`suggestCategoryWithAI`).

### Consequências negativas ou riscos

- Feature "aparenta" estar pronta na UI (toggle liga/desliga), mas ainda
  não produz nenhum efeito real — mitigado com texto explícito no toggle
  ("estrutura em preparação, ainda sem chamada real de provedor").

### Impacto em LocalStorage

Novo campo opcional `aiCategorization` dentro de `params`, fallback seguro
`{ enabled:false }` para dados antigos. Sem migração.

### Impacto em regra de negócio

Nenhum nesta versão — não altera `guessCategoryForTransaction` nem o
resultado de nenhuma importação.
