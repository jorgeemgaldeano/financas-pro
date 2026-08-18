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

## DEC-0032 — CI no GitHub Actions e golden master de migração

Data: 2026-07-08

### Contexto

A pirâmide de testes de `docs/CLAUDE.md` (unitário → integração → E2E →
CI) tinha a etapa de CI pendente desde a sessão de 2026-07-05: os testes
(`npm test`, Vitest) só rodavam localmente, por decisão manual. Nada
impedia um merge em `develop`/`main` com a suíte vermelha. Em paralelo,
`migrationPipeline.js` (que evolui o formato interno dos dados de cada
usuário no LocalStorage) só tinha dois smoke tests unitários — nada travava
a **forma completa** do dado migrado de um usuário antigo real.

### Decisão

1. **CI**: adotar GitHub Actions (`.github/workflows/ci.yml`) rodando
   `npm ci`, `npm test` e `npm run build` em push e pull request para
   `main` e `develop`, em `ubuntu-latest` com Node 20.
2. **Golden master de migração**: criar `tests/migrationGoldenMaster.test.js`
   com um dataset antigo realista congelado e a saída exata esperada da
   migração (`toEqual`). Qualquer passo de migração futuro que altere a
   forma dos dados de um usuário existente quebra o golden e força uma
   decisão consciente (atualizar o golden + registrar a razão), em vez de a
   mudança passar silenciosa.

### Alternativas avaliadas

- **Node 24 na CI** (versão da máquina local do dev). Descartada em favor de
  Node 20 LTS, mais estável e amplamente suportado em Actions; o projeto não
  usa recurso exclusivo de Node 24. Reavaliar se surgir necessidade.
- **Só ampliar os smoke tests unitários** em vez de um golden master
  dedicado. Descartada: smoke tests pequenos não travam a forma completa do
  dado; o valor do golden é justamente a regressão visível quando a
  estrutura muda por inteiro.
- **Rodar apenas testes na CI, sem build.** Descartada: o build já pegou
  regressões de import/JSX no passado; mantê-lo na CI é barato.

### Consequências positivas

- Merge com suíte quebrada passa a ser visível/bloqueável no PR.
- Regressão silenciosa no formato de dados migrados fica detectável.
- Base pronta para adicionar E2E (Playwright) ao mesmo workflow depois.

### Consequências negativas ou riscos

- A CI só protege o que os testes cobrem — não substitui a validação manual
  das regras financeiras.
- O golden precisa ser atualizado conscientemente quando um passo de
  migração legítimo mudar a saída; isso é intencional (é o ponto do teste),
  mas exige disciplina para não "consertar" o golden sem pensar.

### Impacto em LocalStorage

Nenhum. Adição de infraestrutura de teste/CI, sem tocar dado persistido.

### Impacto em regra de negócio

Nenhum. Nenhuma RN alterada.

## DEC-0033 — Reatribuição em massa (mover antes de excluir) e UX dialogs

Data: 2026-07-08

### Contexto

Desde `DEC-0028` (v0.3.26.9), excluir um cartão/conta/categoria em uso é
apenas BLOQUEADO, com a mensagem "transfira antes de excluir" — mas a
transferência não existia. O usuário confirmou (2026-07-08) que precisa
efetivamente MOVER lançamentos entre cartões e entre contas, e recategorizar
uma categoria por completo (trocas pontuais por lançamento já existem). Em
paralelo, os fluxos destrutivos usavam `window.confirm`/`alert` nativos, sem
feedback reversível.

### Decisão

1. **Serviço puro atômico** `reassignmentService.js` com `moveCardTransactions`,
   `moveAccountTransactions` e `recategorizeCategory`, cada um devolvendo o
   snapshot completo (padrão `cardInvoiceOperations`), aplicado de uma vez.
2. **Gatilho: em massa no fluxo de exclusão** (escolha do usuário). Ao excluir
   cartão/conta em uso, um diálogo oferece o destino e faz mover-e-excluir.
   Recategorização por completo fica num botão `↦` próprio por categoria.
3. **Competência ao mover cartão: recalculada pelo ciclo do destino** (escolha
   do usuário), via `getCardInvoiceCompetence` (RN012). O movimento é
   BLOQUEADO se houver fatura fechada envolvida (origem ou destino) — não se
   altera fatura fechada silenciosamente. Pagamento de fatura
   (`natureza:"fatura_cartao"`, origem "corrente") não é movido como compra.
4. **UX: ConfirmDialog reutilizável + toast com Desfazer**, capturando o
   snapshot anterior para restaurar a ação.

### Alternativas avaliadas

- **Manter só o bloqueio de `DEC-0028`.** Descartada: o usuário pediu
  explicitamente a reatribuição.
- **Mover por lançamento individual (na aba Lançamentos).** Descartada como
  gatilho principal: o usuário escolheu o fluxo em massa no excluir, que
  resolve diretamente o "mover antes de excluir". Pode ser adicionado depois.
- **Manter a mesma competência ao mover entre cartões.** Descartada: cartões
  têm dias de fechamento diferentes; manter a competência colocaria o
  lançamento numa fatura que não corresponde ao ciclo real do destino.

### Consequências positivas

- Exclusão de cartão/conta em uso deixa de ser um beco sem saída.
- Toda mutação é atômica e reversível (undo), reduzindo risco de erro do
  usuário.
- `ConfirmDialog`/`Toast` ficam disponíveis para padronizar outros fluxos.

### Consequências negativas ou riscos

- A reatribuição de cartão recusa (por ora) casos com fatura fechada — o
  usuário precisa reabrir a fatura antes. É o comportamento seguro (RN012),
  mas exige um passo extra nesses casos.
- Mover despesas compartilhadas/simulações apenas reponta o cartão (mantém a
  competência manual própria), o que é adequado por não serem itens de fatura
  calculada, mas difere do recálculo aplicado às compras.

### Impacto em LocalStorage

Nenhum. Sem chave/prefixo/schema novo. Apenas reatribuição de campos já
existentes em registros existentes, pela fronteira normal de persistência.

### Impacto em regra de negócio

Respeita RN012 (isolamento de fatura) no recálculo de competência e no
bloqueio de fatura fechada. Não altera o comportamento de nenhuma RN
existente — adiciona um caminho novo (mover) onde antes só havia bloqueio.

## DEC-0034 — Modelo de dados de transferência entre contas (v0.3.33)

Data: 2026-08-16

### Contexto

O roadmap (`docs/07-ROADMAP-E-BACKLOG.md`, planejado em 2026-07-08) definiu
o escopo funcional da v0.3.33 (transferência manual + auto-detecção na
importação) mas deixou o modelo de dados como proposta a confirmar antes de
codificar. Análise de impacto feita nesta sessão (2026-08-16) levantou o
código real antes de travar a decisão, e corrigiu duas premissas do
roadmap:

1. O roadmap estimava "~57 pontos de filtro `tipo==='receita'/'despesa'`"
   como superfície de risco. Levantamento real no `App.jsx` encontrou 27
   ocorrências, das quais só **6 são agregações que precisam excluir a
   transferência** (`receitaCorr`/`despCorr` e gráfico de categorias no
   Dashboard, `receitasItens`/`despesasItens` em `projectionService.js`); o
   resto são pontos cosméticos de UI (cor, ícone, sinal) que não quebram se
   não forem tocados imediatamente.
2. O roadmap propunha "reusar `params.duplaEntradaDias`" para a
   auto-detecção na importação. Esse parâmetro existe **só como campo de
   configuração** (`App.jsx:188` default, `App.jsx:1954` label) — nenhum
   código o consome. Não há motor de detecção de duplicidade para reusar; a
   Fase 2 (auto-detecção) exige escrever esse matcher do zero.

### Decisão

1. **Modelo de dados:** cada perna da transferência mantém `tipo:"despesa"`
   (origem) / `tipo:"receita"` (destino) — é o `tipo` que decide o sinal em
   `movimentoContaMes` (`App.jsx:2201-2208`), e ele **não muda**. O campo
   novo `natureza:"transferencia"` (mesmo padrão já usado para
   `natureza:"fatura_cartao"` em `cardInvoiceOperations.js`) é só o
   marcador de exclusão dos 6 pontos de agregação de receita/despesa
   listados acima. As duas pernas são ligadas por `transferId` comum.
   Formalizado em `RN031`.
2. **Sequenciamento em duas fases, não uma entrega única:**
   - **Fase 1 (v0.3.33):** transferência manual — CRUD do par atômico via
     `transferService.js` novo (padrão `cardInvoiceOperations.js`/
     `reassignmentService.js`, snapshot completo), testes de caracterização
     dos 6 pontos de agregação **antes** de alterá-los, e ajuste dos 6
     pontos para excluir `natureza:"transferencia"`.
   - **Fase 2 (v0.3.33.1 ou posterior):** auto-detecção na importação
     (matcher débito/crédito por valor + janela de dias, reusando o *nome*
     do parâmetro `params.duplaEntradaDias` mas implementando a lógica do
     zero), com vínculo sempre sujeito a confirmação do usuário na prévia
     — nunca automático.
3. **Sem alteração de `LS_VERSION`/schema.** Transferência usa a mesma
   chave `trans` já existente; `natureza` e `transferId` são campos novos
   e opcionais em registros existentes, cobertos pelo `migrationPipeline.js`
   com default seguro (RN002) para dados antigos sem esses campos.

### Alternativas avaliadas

- **Entregar manual + auto-detecção juntas numa única v0.3.33** (escopo
  original do roadmap). Descartada nesta decisão: a Fase 2 tem uma
  superfície de risco maior do que o roadmap assumia (motor novo, não
  reaproveitamento), e misturar as duas aumenta o raio de teste antes de a
  Fase 1 (isolada, mais simples de caracterizar) estar validada em uso
  real. Decisão do usuário (2026-08-16): sequenciar em fases.
- **`tipo` novo (`"transferencia"`) em vez de reusar `receita`/`despesa`
  por perna.** Descartada: quebraria `movimentoContaMes`, que decide o
  sinal do saldo por conta unicamente por `tipo==="receita"`, e exigiria
  tocar esse cálculo central (risco maior, sem ganho — `natureza` já
  resolve a exclusão sem mexer no saldo).
- **Um único registro com dois `contaId` (origem/destino) em vez de duas
  transações ligadas por `transferId`.** Descartada nesta decisão (opção
  levantada e recusada pelo usuário, 2026-08-16): quebraria o padrão atual
  de que toda entrada em `trans` pertence a uma conta só, exigindo tratar
  transferência como tipo de registro à parte em todos os pontos que hoje
  iteram `trans` (backup, filtros, `reassignmentService`, etc.) — reforma
  estrutural desproporcional ao ganho.

### Consequências positivas

- Reaproveita o padrão de "serviço puro atômico + `natureza` como marcador
  de exclusão" já validado em `cardInvoiceOperations.js` e
  `reassignmentService.js` — sem conceito novo no código.
- Superfície de mudança da Fase 1 é pequena e bem delimitada (6 pontos de
  agregação, testados por caracterização antes de tocar).
- Fase 2 isolada permite validar a Fase 1 com dados reais do usuário antes
  de investir na complexidade do matcher de auto-detecção.

### Consequências negativas ou riscos

- Enquanto a Fase 2 não é feita, transferências identificadas em extratos
  importados continuam virando receita/despesa comuns (comportamento atual,
  sem regressão — só não há ainda o atalho de vinculá-las).
- Os pontos cosméticos de UI (ícone/cor "↑ Receita"/"↓ Despesa" nas pernas
  de transferência) não são corrigidos na Fase 1; ficam mostrando como
  receita/despesa comuns até um ajuste visual posterior — não afeta cálculo,
  só a leitura da lista de lançamentos.

### Impacto em LocalStorage

Nenhuma chave nova. `natureza` (já existente, usado por `fatura_cartao`) e
`transferId` (novo) são campos adicionais opcionais em registros de `trans`
existente. Sem bump de `LS_VERSION`. Default seguro via
`migrationPipeline.js` para dados antigos sem esses campos (RN002).

### Impacto em regra de negócio

Formaliza `RN031` (nova), cumprindo o que `RN004` já prometia e nunca
implementou. Não altera nenhuma RN existente.

### Adendo — 2026-08-16, mesma sessão: Fase 2 entregue sem esperar validação isolada

O sequenciamento original (item 2 da decisão) previa Fase 2 só depois da
Fase 1 validada em uso real, em versão separada (v0.3.33.1+). O usuário
optou por acelerar e pediu a Fase 2 na mesma sessão, ainda sob a mesma tag
`v0.3.33.0` — a Fase 1 tinha sido validada em preview real (não em uso
real de produção) antes da Fase 2 começar, o que mitiga parcialmente o
risco original de "investir no matcher antes de validar o modelo". A forma
aprovada aqui (item 1) não mudou: `linkImportedRowAsTransfer` converte a
transação de crédito existente em vez de duplicá-la, exatamente como
desenhado. Ver entrada `[0.3.33.0]` completa em `docs/09-CHANGELOG.md`.

## DEC-0035 — Modelo de dados e fórmula de simulação de Cofrinhos (v0.3.34)

Data: 2026-08-16

### Contexto

Análise de impacto desta sessão confirmou que "Cofrinhos" não colide
estruturalmente com "Metas" (`metas[catId]`, orçamento por categoria — nada
em comum). Registrar uma chave nova de LocalStorage segue um checklist já
percorrido em `RN029` (quando `simulacoes` foi adicionada): `useLS`,
`BACKUP_STORAGE_KEYS`, `normalizeBackupPayload()` em `App.jsx`, e uma aba
nova em `TABS`. Risco técnico baixo — entidade isolada, sem tocar `trans`
nem nenhuma RN existente.

O ponto que precisava de decisão real: a fórmula de simulação do roadmap
(`(valorAlvo − saldoAtual) / meses até a dataAlvo`) divide por zero quando a
dataAlvo já é o mês atual ou já passou sem a meta atingida — cenário comum
(usuário atrasado), não extremo.

### Decisão

1. **Ledger isolado, sem tocar `trans`.** Aportes/retiradas do cofrinho são
   só um array dentro do próprio registro (`cofrinhos[i].aportes`) — não
   geram transação, não afetam saldo de conta, não são transferência
   (RN031). Escolha do usuário (2026-08-16): manter Cofrinhos
   estruturalmente desacoplado de `trans` nesta versão, mesmo sendo
   contabilmente menos "correto" (o dinheiro aportado não sai de fato da
   conta corrente no modelo).
2. **Fórmula de simulação com 3 estados** (formalizado em `RN032`):
   "Em dia" (cálculo normal), "Concluído" (`saldoAtual >= valorAlvo`, sem
   sugestão de aporte) e "Atrasado" (dataAlvo <= mês atual e meta não
   atingida — recalcula o aporte sugerido como se a meta fosse o mês
   seguinte, nunca divide por zero nem mostra valor negativo).
3. **`cofrinhoService.js` novo** (funções puras): cálculo de saldo do
   ledger, status do cofrinho e simulação de aporte mensal — mesmo padrão
   de `reassignmentService.js`/`transferService.js`. Requer um helper novo
   de "meses entre duas competências" (não existe em `dateUtils.js` hoje).
4. **Retirada não pode deixar o saldo negativo** — bloqueio na UI, mesmo
   sem persistência transacional (o ledger é livre, mas a UI garante
   consistência antes de gravar).

### Alternativas avaliadas

- **Aporte gerar transferência real da conta corrente para o cofrinho**
  (acoplando ao `transferService`/RN031). Descartada nesta decisão: mais
  correta contabilmente, mas expande o escopo da v0.3.34 para depender da
  Fase 1 da v0.3.33 e do modelo de transferência; o usuário optou por manter
  Cofrinhos simples e desacoplado nesta versão. Fica registrado como
  evolução possível de versão futura, não como pendência aberta desta.
- **"Atrasado" sem sugestão de aporte** (só mostrar quanto falta, sem
  recalcular). Descartada: o usuário preferiu manter um número acionável
  mesmo fora do prazo, em vez de só sinalizar o atraso.

### Consequências positivas

- Escopo pequeno e isolado — não toca nenhum dos 6 pontos de agregação
  protegidos na v0.3.33, não risca `RN031`/`transferService`.
- Fórmula de simulação cobre os 3 estados reais sem caso de borda quebrado
  (divisão por zero), testável isoladamente em `cofrinhoService.js`.

### Consequências negativas ou riscos

- Ledger desacoplado de `trans` significa que o saldo "guardado" no
  cofrinho não é, de fato, retirado da conta corrente no modelo de dados —
  é responsabilidade do usuário considerar isso ao planejar o saldo real
  disponível. Documentado como escolha consciente, não como bug.

### Impacto em LocalStorage

Nova chave `cofrinhos` (array), aditiva. Entra em `BACKUP_STORAGE_KEYS` e em
`normalizeBackupPayload()` com fallback `[]` para backups antigos sem essa
chave (RN002). Sem bump de `LS_VERSION`.

### Impacto em regra de negócio

Formaliza `RN032` (nova). Não altera nenhuma RN existente — em particular,
não altera `RN031` (transferência) nem `RN004` (saldo por conta), já que o
ledger de Cofrinhos não participa desses cálculos.

## DEC-0036 — Escopo real do fix de complexidade quadrática do saldo (v0.3.35)

Data: 2026-08-16

### Contexto

O item E4 ("complexidade quadrática do cálculo de saldo") está no backlog
desde a sessão de 2026-07-05, sempre como rótulo — nenhuma sessão anterior
havia localizado a causa exata no código. Análise desta sessão localizou:
`movimentoContaMes` (`App.jsx:2201-2208`) filtra **todo** o array `trans`
(O(N)) a cada chamada; `getSaldoInicialConta` (`App.jsx:2215-2221`) é
recursiva e, quando não há saldo manual override, chama
`movimentoContaMes` uma vez por mês desde `baseSaldoMonth` — custo O(M×N)
por chamada, O(C×M×N) somando as `C` contas em `saldoInicialTotal`
(Dashboard) e `saldoContaFinal` (aba Contas). Como `M` (meses de uso) e `N`
(transações) crescem juntos num app de uso contínuo, o custo real tende a
O(M²) ao longo dos anos.

Dois achados corrigem a expectativa do roadmap:
1. **Memoização React (`useMemo`/`useCallback`) não resolve isso.** Só evita
   recálculo em re-renders não relacionados; ao trocar o mês selecionado ou
   editar uma transação (uso normal), o custo O(M×N) volta a acontecer. O
   fix precisa ser algorítmico, não de cache.
2. **Não existe hoje nenhum teste para o cálculo de saldo** — vive inline em
   `useCallback` dentro do `App.jsx`, não extraído para serviço puro. Pelo
   próprio `CLAUDE.md` ("testes de caracterização ANTES de refatorar"), o
   fix não pode começar direto na otimização.

### Decisão

1. **v0.3.35 entrega o fix completo de E4**, não uma versão reduzida: extrair
   o cálculo de saldo para `src/services/saldoService.js` novo (funções
   puras, mesmo padrão de `transferService.js`), escrever testes de
   caracterização travando o valor atual ANTES de qualquer mudança de
   algoritmo, e só então substituir o algoritmo O(C×M×N) por uma versão
   O(N + C×M): agrupar `trans` por `(contaId, mês)` numa única passada
   (O(N)), e computar o saldo de cada conta como soma prefixada sobre esse
   agrupamento (O(M) por conta, sem re-filtrar `trans` a cada mês).
2. **Absorve o item 3 do roadmap** ("auditar recomputações
   `useMemo`/`useCallback` em Dashboard/Projeções") dentro do trabalho de
   E4, em vez de tratá-lo como item separado — a auditoria de memória na
   área de saldo acontece naturalmente ao extrair e reestruturar o cálculo;
   um item separado arriscaria remexer a mesma área duas vezes.
3. Code-splitting de `pdfjs-dist` (chunk >500kB) segue como item
   independente da mesma versão — sem relação técnica com o fix de saldo,
   baixo risco (uso já isolado em `extractPdfTextFromFile`, atrás de
   `impMode==="vale"`).

### Alternativas avaliadas

- **Só code-splitting nesta versão, adiar E4 para versão dedicada.**
  Descartada por decisão do usuário (2026-08-16): preferiu entregar o fix
  completo agora, já que a extração para serviço puro é pré-requisito de
  qualquer correção real, não um adicional.
- **Fix só de memoização (`useMemo` em cima do cálculo atual), sem mudar o
  algoritmo.** Descartada: não resolve o problema, só empurra o custo para
  a primeira renderização após qualquer edição — falsa sensação de
  resolvido.

### Consequências positivas

- Resolve E4 de fato (algoritmo O(N + C×M)), não um band-aid de cache.
- Cria a primeira suíte de testes para cálculo de saldo — RN021 (cálculos
  centralizados/testáveis) passa a ter cobertura real nessa área.
- Evita retrabalho ao não tratar a auditoria de memória como item separado.

### Consequências negativas ou riscos

- Maior superfície de mudança nesta versão do que uma correção só de cache
  teria — mitigado pelos testes de caracterização escritos antes de tocar
  no algoritmo (mesmo padrão usado com sucesso em `transferService`/
  `projectionService` na v0.3.33).
- `saldoContaFinal`/`getSaldoInicialConta`/`movimentoContaMes` são usados em
  múltiplos pontos do `App.jsx` (Dashboard, Contas) — a extração precisa
  preservar a assinatura de uso (ou os call sites precisam ser atualizados
  com cuidado) para não quebrar nenhum consumidor.

### Impacto em LocalStorage

Nenhum. É refatoração de cálculo em memória — não toca formato de dados
persistidos, chave, prefixo ou schema.

### Impacto em regra de negócio

Não altera nenhuma RN de resultado financeiro — o valor do saldo calculado
deve permanecer idêntico (é isso que os testes de caracterização travam).
Reforça `RN021` (consistência/centralização dos cálculos), que já previa
esse tipo de centralização sem nunca ter sido cumprida para o saldo.

## DEC-0037 — Sincronização multi-dispositivo: forma aprovada e sequenciamento

Data: 2026-08-16

### Contexto

O usuário perguntou se não era hora de criar um backend. Investigado o
motivador real (não estava nas premissas iniciais): o app é usado por um
casal, cada um no seu notebook, sem sincronização entre os dois hoje. Isso
é diferente de "quero um backend" — é "preciso que os dois LocalStorage
cheguem a um estado consistente", um problema mais estreito e mais barato
de resolver do que reescrever a camada de persistência do zero.

O usuário propôs uma primeira forma: arquivar o JSON de backup num backend
e, ao abrir o app, verificar se há dado mais novo para atualizar.

### Decisão

1. **A forma proposta (verificar/substituir pelo mais novo) foi avaliada e
   REJEITADA.** É um "last-write-wins" por arquivo inteiro: se os dois
   editam offline no mesmo período (uso normal de notebook, não estar
   sempre online), quem sincronizar por último apaga silenciosamente o
   trabalho do outro. Isso viola a invariante que o próprio `CLAUDE.md` do
   projeto já declara como não-negociável: "persistência que falha não pode
   falhar em silêncio." Perder um lançamento financeiro real por timing de
   sync é pior do que não sincronizar.
2. **Forma aprovada para qualquer análise futura**: (a) armazenamento via
   BaaS (Firebase/Supabase ou equivalente) — não construir API/auth
   próprios, não operar servidor; (b) merge por **id de registro +
   timestamp de alteração**, reaproveitando que os arrays persistidos
   (`trans`, `contas`, `cards`, ...) já têm `id` por item — mantém o mais
   recente por registro, une os que só existem de um lado; (c) reaproveita
   o formato de payload de `normalizeBackupPayload()`/
   `BACKUP_STORAGE_KEYS` como base, mas a lógica de merge é nova — hoje
   `RN018` (restauração) é "substituir tudo", não "mesclar".
3. **Sequenciamento**: análise de impacto completa (estratégia de merge
   linha a linha, escolha de provedor, o que muda em `RN017`/`RN018`, custo
   de operação) fica para **depois da v0.3.35** — decisão do usuário
   (2026-08-16). Registrado como bloco próprio `v0.3.38` em
   `docs/07-ROADMAP-E-BACKLOG.md`, fora da numeração de features de negócio
   por ser mudança de arquitetura.

### Alternativas avaliadas

- **Backend completo (API própria + auth própria + servidor operado pelo
  usuário).** Descartada como forma preferencial: custo de construção e
  operação desproporcional ao problema real (2 usuários, sincronizar um
  payload), quando um BaaS resolve a mesma necessidade com muito menos
  código e sem infraestrutura para manter.
- **Fazer agora, em paralelo com v0.3.33/34/35.** Descartada: são três
  frentes já abertas mexendo em persistência/cálculo; abrir uma quarta
  mudança de arquitetura ao mesmo tempo aumenta risco sem necessidade —
  nenhuma delas depende da sincronização para ser útil isoladamente.

### Consequências positivas

- Resolve a dor real (uso por duas pessoas em dispositivos separados) sem
  descartar a arquitetura local-first que já funciona — LocalStorage
  continua sendo a fonte de verdade local, sync é uma camada adicional.
- Evita o risco de maior gravidade da proposta original (perda silenciosa
  de dado financeiro por sobrescrita).

### Consequências negativas ou riscos

- Merge por id ainda não resolve todos os casos de conflito (ex.: o mesmo
  registro editado dos dois lados com valores diferentes) — a estratégia
  de resolução desses conflitos específicos fica para a análise completa,
  não está decidida aqui.
- Introduz dependência de um provedor externo (BaaS) e de conectividade
  para sincronizar — o app continua funcionando offline (local-first
  preservado), mas a sincronização em si não.

### Impacto em LocalStorage

Nenhum nesta sessão — é só decisão de direção e sequenciamento, sem
código. Quando implementado, não deve exigir bump de `LS_VERSION` (a
sincronização é uma camada acima do formato já existente).

### Impacto em regra de negócio

Nenhum nesta sessão. A análise futura provavelmente vai propor mudança em
`RN018` (restauração hoje é "substituir tudo") para acomodar merge — a
decidir formalmente quando essa análise for feita.

### Adendo (2026-08-16) — desenho fechado: Supabase + Vercel, em 11 decisões

A decisão acima fixou a **forma** (BaaS em vez de backend próprio, merge por id em vez de sobrescrita de
arquivo) e deixou o desenho em aberto. Este adendo o fecha: provedor, schema, mecânica de conflito e
sequenciamento.

**Stack escolhida:** Supabase (banco) + Vercel (front).

#### O que a leitura do código mudou no desenho

Três achados na camada de persistência, nenhum previsto por esta decisão:

1. **A exclusão é física.** `App.jsx:609` é `delTrans=(id)=>setTrans(p=>p.filter(t=>t.id!==id))`, e o
   padrão se repete em outros handlers. Merge por união de registros **ressuscita** o que foi apagado,
   porque o lado que apagou não tem como afirmar que foi de propósito.
2. **O `updatedAt` usado como critério de desempate quase não existe.** É gravado em três pontos do
   `App.jsx` e em `cardInstallmentService`/`cardInvoiceOperations`. A maioria das entidades não tem carimbo.
3. **Vários registros têm arrays com id dentro deles** (`dividas[].amortizacoes`, `cofrinhos[].aportes`,
   `params.autoCategoryRules`, `cats[].subs`). Merge no nível do pai perde edição concorrente em filhos
   diferentes, sem sinalizar conflito.

Nenhum é bloqueio, mas os três viram trabalho **antes** da primeira linha de rede — daí a separação das
fases 1-5 (fundação local) das fases 6-9 (sincronização).

#### As 11 decisões

| # | Assunto | Escolha |
|---|---|---|
| D1 | Fonte de verdade | Local-first: LocalStorage primário, Supabase réplica |
| D2 | Modelo no Postgres | Tabela genérica `registros(tipo, id, payload jsonb, ...)` |
| D3 | Exclusão | Tombstone no próprio registro, filtrado na fronteira de leitura |
| D4 | Timestamp de conflito | `updatedAt` gravado pelo cliente |
| D5 | Conflito | Last-write-wins, mas visível e auditável |
| D6 | Momento do sync | Híbrido: ao abrir, ao sair, mais botão manual |
| D7 | Autenticação | Conta Supabase compartilhada + campo de texto `usuario` no LocalStorage |
| D8 | Chave | `anon key` pública no bundle + RLS; senha nunca no repositório |
| D9 | Dados existentes | Base começa limpa; o primeiro registro gravado é a base inicial |
| D10 | Faseamento | Fundação local sem rede primeiro, sincronização depois |
| D11 | Registros aninhados | Achatamento seletivo (`amortizacoes`, `aportes`); `params` e `cats` inteiros |

Mais duas definições fora da numeração: expurgo aos **90 dias** no servidor; categorias e subcategorias
semeadas na base zerada e preservadas no reset (**já é o comportamento de `handleReset`** — virou item de
teste, não de construção).

#### Raciocínio das escolhas menos óbvias

**D2 — tabela genérica em vez de 13 tabelas.** O contra da genérica é perder validação e consulta analítica
no servidor, e o app **não faz nenhuma consulta analítica no servidor**: `projectionService` e
`saldoService` rodam no cliente sobre o array em memória. Seriam 13 migrations mantidas em sincronia com o
formato local para sempre, pagas por uma garantia que ninguém usa.

**D7 — conta compartilhada.** O único argumento a favor de duas contas + household era preservar o "quem
editou" que o log de conflito precisa; um campo de texto entrega a mesma atribuição sem tela de convite e
sem RLS elaborada. **Consequência dura:** como `auth.uid()` é o mesmo para os dois, esse campo é a única
atribuição existente — a sincronização deve ficar bloqueada enquanto ele não estiver preenchido.

**D8 — com uma regra inegociável.** A `anon key` é pública por design e pode ir no bundle; a segurança mora
na RLS. O que não pode existir é login automático com a senha da conta compartilhada embutida no código:
qualquer pessoa que abrisse a URL e lesse o bundle teria acesso total. Login manual, senha fora do
repositório **e fora das variáveis de ambiente do Vercel**.

**D9 — base limpa.** Elimina o passo de maior risco do projeto (mesclar duas bases divergentes por meses,
sem metadado de tempo, com um motor recém-escrito) e permite que `updatedAt` e `excluidoEm` nasçam
obrigatórios, sem código de migração. E se executa sozinha: sair de `localhost:5180` para uma URL do Vercel
é origem nova, então o LocalStorage nasce vazio.

### Adendo (2026-08-18) — as 6 travas resolvidas

Seis pontos ficaram em aberto no desenho de 16/08 e impediam qualquer fase de começar. Todos decididos em
2026-08-18, cada um com três alternativas avaliadas.

| # | Trava | Decisão |
|---|---|---|
| T1 | Domínio | `*.vercel.app` **definitivo**, sem regra de travessia |
| T2 | PWA | **Sem PWA**; `RN017` reescrita |
| T3 | Expurgo local de tombstone | **Fase 9**, por confirmação do servidor, não por prazo cego |
| T4 | "Apagar dados financeiros" | **Propaga** como exclusão lógica em massa, com backup automático antes e confirmação por digitação |
| T5 | Auditoria de conflito | Versão perdedora **dentro do registro vencedor** (`versaoAnterior` no payload); sem tabela `conflitos` |
| T6 | `LS_VERSION` | **Bump para 2 na Fase 1**; fases 1-4 tratadas como um formato único |

T1 e T2 foram decididas contra a recomendação da análise, que preferia `*.vercel.app` com regra de
travessia e PWA completo. Registrado para rastreabilidade, sem ressalva ulterior.

#### Correção de duas afirmações da análise original

- **A `RN020` não estava sendo descumprida.** A análise de 16/08 afirmava que a exclusão física violava a
  `RN020`. A regra diz "deve-se preferir inativação ou exclusão lógica" quando a exclusão **impacta
  histórico**, e seus critérios tratam de contas, cartões e categorias; sobre lançamento é explícita ao
  admitir que "podem ser cancelados ou removidos conforme regra definida". A Fase 3 continua necessária,
  mas por causa do merge — não para consertar uma regra violada.
- **O custo de não ter PWA é menor do que a análise apresentou.** Com o app já carregado, gerar backup
  continua sem depender de rede; o que passa a exigir conexão é o cold start. A reescrita da `RN017` é
  essa separação, não a revogação da garantia inteira.

#### Consequências

- `RN017` reescrita (separa gerar backup de carregar o app). `RN033` e `RN034` criadas.
- **Esta decisão afirmava que a sincronização "não deve exigir bump de `LS_VERSION`". T6 revoga isso:** o
  prefixo passa a `fpro_v2_` na Fase 1.
- O expurgo aos 90 dias passa a ter natureza única (tombstone no servidor); a auditoria deixa de ser tabela.
- **Restrição operacional nova:** renomear o projeto no Vercel muda a URL e zera o LocalStorage. O nome
  escolhido na Fase A é definitivo na prática.
- **Exportar backup manual antes da Fase A e antes da Fase 1** — as duas zeram a base local por caminhos
  diferentes (origem nova e prefixo novo) e nenhuma avisa.
- A D1 (local-first) continua válida por dado e cálculo no cliente, mas perde o argumento offline que a
  sustentava na redação original.

#### Achado colateral

`@vitejs/plugin-react` está declarado em `package.json` e **não está ligado em lugar nenhum**: existe
`vitest.config.js` na raiz, mas **não existe `vite.config.js`**. O build funciona porque o esbuild do Vite
transpila JSX sozinho, mas o plugin nunca é aplicado e **o React Fast Refresh nunca rodou neste projeto**.
Candidato forte a causa raiz dos `ReferenceError` fantasmas em aba antiga, tratados como "staleness de HMR"
em várias sessões. Correção de poucas linhas, absorvida pela Fase 0.

#### Reversibilidade das seis

- **T6 é a mais cara**: define o formato de todo registro. Reverter depois da Fase 4 significa refazer as
  fases 1 a 4.
- **T1 e T5 são médias**: T1 fica cara no dia em que a URL mudar; T5 vira migração de payload se a tabela
  de conflitos for criada depois.
- **T2, T3 e T4 são baratas**: são comportamento e configuração, não formato.

## DEC-0038 — Atomic Design do front-end absorvido na v0.3.37

Data: 2026-08-16

### Contexto

Pedido do usuário: analisar o front-end sob a lente de Atomic Design
(atoms/molecules/organisms/templates) e propor melhorias, combinando com o
backlog já existente da v0.3.37. Mapa factual do estado atual (via
subagente de exploração, sem tocar código):

- Os helpers de estilo (`card()`, `lbl`, `big()`, `inp`, `btn()`,
  `ghost()`) são fechamentos declarados dentro da própria função `App()`
  (`App.jsx:2365`) — não reutilizáveis fora dela por construção. Existe uma
  **segunda cópia quase idêntica** (`btn2`/`ghost2`) dentro de `ParamsTab`.
- Padrões visuais repetidos sem componente próprio: barra de progresso
  (duplicada quase igual entre Metas e Cofrinhos), "stat tile"
  (label+valor), input com label emparelhado à mão (46+ ocorrências),
  botão "×" de excluir (15 ocorrências).
- Abas inteiras inline dentro do `return` de `App()`: Projeções (~199
  linhas), Dashboard (~167), Importação (~153), Contas (~119), Metas
  (~98), Cofrinhos (~82). Só `Pessoas`/`Parâmetros` foram extraídas como
  componente próprio até hoje.
- Os 7 componentes já extraídos (`components/ui`, `components/finance`,
  `components/charts`) evitaram o problema em vez de resolvê-lo: cada um
  define seu próprio `DEFAULT_COLORS`/`colors` em vez de consumir uma
  fonte única de tokens — já existe drift de paleta entre telas.
- Switch de modais: 6 modais num bloco só de ~310 linhas no fim do
  arquivo; o modal `addTrans` sozinho tem ~189 linhas.

### Decisão

1. **Reorganizar a camada de apresentação em Atomic Design**, em 5 fases
   sequenciais, cada uma validável isoladamente antes da próxima: (1)
   tokens (`src/theme/tokens.js`, paleta `C` centralizada), (2) atoms
   (`Button`, `Card`, `Label`, `StatValue`, `ProgressBar`, `Badge`,
   `IconButton`, `MoneyInput`), (3) molecules (`FormField`, `StatTile`,
   `ProgressCard`, `ModalShell`), (4) organisms (uma aba/modal = um
   componente, das menores pras maiores, mesmo padrão já provado em
   `PessoasTab`/`ParamsTab`), (5) template/page (`AppShell`, `App.jsx`
   reduzido a orquestração).
2. **Escopo absorvido na v0.3.37**, não numa versão nova separada — decisão
   explícita do usuário (eu havia proposto v0.3.39 separada, como opção
   B, por ser mais conservador dado o tamanho da mudança; ele preferiu
   manter tudo na v0.3.37, mesmo isso tornando a versão maior que o normal
   do projeto).
3. **Nenhum código escrito nesta sessão** — só a análise, a decisão de
   forma e o sequenciamento por fase.

### Alternativas avaliadas

- **v0.3.39 separada, depois da v0.3.38** (minha recomendação inicial):
  mantém a v0.3.37 enxuta, só com a extração de serviços já planejada em
  2026-07-08; separa uma reorganização de arquitetura do mesmo porte que a
  decisão de sincronização mereceu (`DEC-0037`) em sua própria versão.
  Descartada por decisão explícita do usuário.
- **Reescrita para JS Vanilla** (framing inicial do pedido do usuário):
  descartada antes mesmo de eu propor as fases — confirmado com o usuário
  que o pedido real era revisão com a lente de Atomic Design dentro do
  stack React/Vite já existente, não uma migração de framework. Uma
  reescrita completa reprovaria a própria regra inegociável do
  `CLAUDE.md` do projeto ("não quebrar comportamento existente") num app
  financeiro em produção.

### Consequências positivas

- Fecha o risco de drift de paleta entre telas (fase 1, tokens).
- Reduz duplicação real já observada (ex.: barra de progresso repetida
  entre Metas e Cofrinhos) via `ProgressCard` (fase 3).
- `App.jsx` sai de ~5.000 linhas para uma faixa realista de 600-800
  (fase 5), alinhado com a diretriz já existente no `CLAUDE.md`
  ("Preferir extração... Modularização > crescimento monolítico").

### Consequências negativas ou riscos

- v0.3.37 fica maior e mais longa que as versões anteriores do projeto —
  risco aceito conscientemente pelo usuário.
- Maior superfície de mudança que uma extração pontual de serviços — cada
  fase precisa ser validada visualmente (preview) antes da próxima, para
  não acumular regressão silenciosa numa reorganização desse tamanho.
- Ordem de extração de organisms (fase 4) prioriza risco, não valor de
  negócio — abas de maior tráfego (Dashboard, Projeções) ficam para o
  fim, quando o padrão de extração já estiver validado nas menores.

### Impacto em LocalStorage

Nenhum. É reorganização de camada de apresentação — não toca persistência,
formato de dados, chave, prefixo ou schema.

### Impacto em regra de negócio

Nenhum. Mudança puramente estrutural/visual — nenhuma RN é alterada.

### Adendo (2026-08-16) — a meta de "600-800 linhas" estava errada

Ao iniciar a Fase 5, a medição do `App.jsx` (então com 3.457 linhas)
mostrou que a meta declarada acima nas "Consequências positivas" era
inalcançável pelo escopo que a própria fase definia. Composição real
naquele momento:

| Bloco | Linhas |
|---|---|
| Imports | 51 |
| Helpers de módulo (backup, seed, `uid`, chaves de duplicata) | 423 |
| `PessoasTab` (função dentro do `App.jsx`) | 849 |
| `ParamsTab` (idem) | 429 |
| Corpo de `App()` — estado, hooks, handlers | 1.469 |
| Árvore de render | 229 |

O `AppShell` vive dentro das 229 linhas de render e vale ~130 delas.
Extrair só ele levaria o arquivo a ~3.330 linhas.

Pior, a frase original se contradizia: dizia que o `App.jsx` ficaria com
"orquestração de estado/hooks + composição", mas essa orquestração
sozinha já eram 1.469 linhas. O número 600-800 foi otimismo na hora de
escrever o plano, não uma estimativa medida.

**Decisão do usuário, consultado com as três opções na mesa:** executar a
Fase 5 em escopo completo — `AppShell` + `ModalHost` + `PessoasTab` e
`ParamsTab` como organisms + seed data em `constants/` + chaves de
duplicata em `services/` —, sem tocar no corpo de `App()`. Resultado
medido: **3.457 → 1.823 linhas**.

A opção que de fato chegaria a 600-800 (quebrar o corpo de `App()` em
hooks customizados) foi **deliberadamente deixada de fora**: ela mexe em
wiring de estado com `useLocalStorage`/persistência no meio, o que
romperia a garantia desta mesma decisão de que a v0.3.37 é mudança
"puramente estrutural/apresentacional". Se for perseguida, deve ser uma
fase própria, com decisão própria e análise de risco de persistência —
registrada como `Fase 6 (candidata)` no roadmap, não aprovada.

**Reversibilidade:** alta. Nenhuma extração da Fase 5 alterou
comportamento, dado ou regra; cada uma foi um commit isolado, revertível
sem efeito sobre as demais.

## DEC-0039 — Sincronização por payload com trava otimista e merge assistido de três vias

Data: 2026-08-18

### Contexto

A `DEC-0037` e seus dois adendos fecharam um desenho de sincronização baseado em **merge contínuo por
registro**, em 12 fases. Antes de escrever a primeira linha, duas informações novas apareceram:

1. **O cenário de uso foi caracterizado pela primeira vez.** Os dois dispositivos são usados quase sempre
   na mesma casa e na mesma rede, ou seja, quase sempre online e com baixa chance de divergência
   prolongada. Toda a análise anterior assumiu implicitamente o pior caso (edição offline longa dos dois
   lados), sem que isso tivesse sido verificado.
2. **O histórico financeiro atual será descartado** (decisão do usuário, 2026-08-18). Some a necessidade de
   migração de dado antigo e o cutover deixa de ser o passo delicado que era.

Com isso ficou visível que a análise da `DEC-0037` avaliou apenas dois pontos do espaço de soluções e
pulou um terceiro, que fica entre eles.

### As três regras possíveis de reconciliação

| | Regra | O que acontece se os dois lados mudaram |
|---|---|---|
| A | Sobrescrita pelo mais novo | O último a salvar vence; o trabalho do outro some **sem aviso**. |
| B | Trava otimista | O último a salvar é **recusado**; ele reconcilia e salva de novo. |
| C | Merge contínuo por registro | Os dois são combinados registro a registro, com desempate por `updatedAt`. |

A `DEC-0037` avaliou A e C, rejeitou A com razão (perda silenciosa, violação da invariante de persistência
do projeto) e adotou C. **B nunca esteve na mesa.** A perda silenciosa que condenou A é resolvida pela
trava, não exclusivamente pelo merge: a trava transforma perda silenciosa em recusa visível, que é o que a
invariante exige.

### Decisão

**Adotado o desenho B, acrescido de merge assistido de três vias no momento da recusa.**

- A unidade de sincronização é o **payload inteiro**, no mesmo formato já validado por
  `normalizeBackupPayload()`/`BACKUP_STORAGE_KEYS`.
- O servidor guarda **uma linha**: `estado(payload jsonb, versao, updatedAt, usuario)`.
- Ao salvar, o cliente envia o payload e a **versão que carregou**. O servidor aceita e incrementa, ou
  recusa. Recusa nunca descarta nada: dispara backup e abre o caminho de reconciliação.
- Na recusa, o cliente recupera do servidor a **versão que havia carregado** (o ancestral comum) e faz um
  merge de três vias por id de registro.

### Por que o merge de três vias é mais simples e mais seguro que o merge contínuo

O merge contínuo de C compara dois lados: o local e o do servidor. Sem saber como o registro estava antes,
ele não distingue "eu apaguei" de "o outro criou" — **é exatamente por isso que C exige tombstone**, um
marcador que existe só para suprir a ausência do ancestral.

Com o ancestral disponível, a comparação passa a três vias e o problema muda de natureza:

- registro alterado só de um lado → aplica esse lado, sem perguntar;
- registro presente no ancestral e ausente de um lado → foi apagado de propósito, **dedutível sem tombstone**;
- registro alterado dos dois lados → conflito real, apresentado ao usuário com `updatedAt` e `usuario`.

Pelo mesmo motivo não é necessário achatar registros aninhados: `dividas[].amortizacoes`,
`cofrinhos[].aportes`, `cats[].subs` e `params.autoCategoryRules` se resolvem pela mesma lógica recursiva.

### O que esta decisão revoga da `DEC-0037`

| Item | Situação |
|---|---|
| D3 — tombstone no registro | **REVOGADO.** O ancestral distingue apagado de inexistente. |
| D11 — achatamento seletivo dos aninhados | **REVOGADO.** Não há merge no formato do servidor. |
| T3 — expurgo de tombstone e regra dos 90 dias | **REVOGADO** junto com D3. |
| T6 — bump de `LS_VERSION` para 2 na Fase 1 | **REVOGADO.** As mudanças passam a ser puramente aditivas. |
| D2 — tabela genérica `registros` | **ALTERADO.** Vira uma linha única (`estado`). |
| D5 — last-write-wins automático | **ALTERADO.** Vira recusa mais merge assistido: quem decide é o usuário, não o relógio. |
| T5 — `versaoAnterior` dentro do registro vencedor | **ALTERADO.** Backup automático antes de aplicar o merge cobre a mesma necessidade melhor. |
| D1, D4, D6, D7, D8, D9, D10, T1, T2, T4 | **MANTIDOS sem alteração.** |

O desenho C continua descrito por inteiro no adendo de 2026-08-16 da `DEC-0037` e fica registrado como
**alternativa avaliada e não adotada**, não como documentação morta: se o cenário de uso mudar para
divergência prolongada entre dispositivos, ele é o caminho.

### Alternativas avaliadas e descartadas

- **Executar as 12 fases do desenho C assim mesmo.** Defensável: paga mais uma vez e nunca mais revisita o
  assunto. Descartada por desproporção — metade da máquina (expurgo, regra dos 90 dias, achatamento,
  auditoria de conflito) existe para servir divergência prolongada, que é a exceção no cenário real.
- **B puro, sem merge e sem `updatedAt`.** Descartada: é o único caminho que fica caro de verdade depois.
  `updatedAt` não pode ser retrofitado — não se inventa o horário em que um registro foi alterado no
  passado. Carimbá-lo desde o primeiro dia custa pouco e preserva a opção de migrar para C.
- **Servir o app por rede local** (`vite --host 0.0.0.0`, script `dev:network` já existente). **Inválida**,
  registrada para não ser proposta de novo: servir por rede compartilha o código, não o dado. O
  LocalStorage é do navegador de cada máquina, então o segundo dispositivo encontraria uma base vazia.

### Consequências positivas

- As três fases de maior risco do plano anterior (tombstones, achatamento, merge contínuo) viram **uma
  só**, executada com o usuário presente e com mais informação do que C jamais teria.
- Nenhuma mudança de formato de dado: sem bump de `LS_VERSION`, sem migração, sem quebra de prefixo.
- Reaproveita a rotina de backup e restauração já validada em produção, em vez de contorná-la — a
  `RN018` ("substituir tudo") deixa de ser obstáculo e passa a ser o motor.
- Existe valor entregue antes do fim: ao término da Fase 3 já há sincronização utilizável e sem perda
  silenciosa. O merge da Fase 4 é conforto, não correção.

### Consequências negativas ou riscos

- **Edição simultânea é recusada, não mesclada automaticamente.** A reconciliação exige o usuário presente.
  Se o padrão de uso mudar para edição paralela frequente, isso incomoda.
- **Todo salvamento sobe o payload inteiro** (algumas centenas de KB). Torna sync de alta frequência caro —
  o que é aceitável sob a D6 (ao abrir, ao sair, botão manual), mas fecha a porta para sync contínuo.
- **A Fase 4 continua sendo o código de maior risco do projeto**, ainda que menor que o de C. Exige teste
  antes do código.
- Não há auditoria de conflito por registro. Para dois usuários, o backup automático antes do merge cobre.

### Decisões de implementação assumidas

1. **O ancestral não é guardado no LocalStorage.** Uma segunda cópia do payload dobraria o consumo contra
   um teto de aproximadamente 5 MB por origem. O servidor retém as últimas versões e o cliente busca a que
   carregou **apenas quando a recusa acontece** — custo zero no caso normal.
2. **Auto-resolução silenciosa quando só um lado mudou.** Perguntar sobre registro sem conflito real
   transformaria o merge em interrogatório.
3. **Se o ancestral não for recuperável** (versão já expurgada do servidor), o merge degrada para o
   comportamento da Fase 3: recusa com backup e resolução manual. Degrada, não quebra.

### Impacto em LocalStorage

Aditivo apenas: campo `usuario` e carimbo `updatedAt` nos registros. **Sem bump de `LS_VERSION`**, sem
migração, sem mudança de prefixo. É a diferença mais concreta em relação ao desenho anterior.

### Impacto em regra de negócio

- **`RN033` revogada antes de implementada** (era a exclusão lógica universal por tombstone).
- **`RN034` reescrita** para a mecânica de payload, trava otimista e merge de três vias.
- `RN017` mantém a alteração de 2026-08-18 (cold start exige rede, backup não).
- `RN018` deixa de precisar de reescrita: "substituir tudo" continua correto e vira parte do motor.

### Reversibilidade

**Alta enquanto nada estiver implementado, média depois da Fase 3.** Migrar de B para C mais adiante exige
construir tombstone e achatamento sobre uma base com dados reais — mais caro que fazer agora sobre base
vazia. O carimbo `updatedAt` da Fase 1 existe justamente para que essa migração continue possível sem
perda de informação.

## DEC-0040 — `package.json` como fonte única de versão

Data: 2026-08-18

### Contexto

O `package.json` estava em `"version": "0.1.0"` desde a criação do projeto, enquanto a versão real do
aplicativo vivia em `APP_VERSION`, uma constante literal no `src/App.jsx` (`"0.3.37.0"`). Os dois números
nunca foram sincronizados. Nenhum processo lia o `package.json`, então o valor errado não causava defeito
visível — mas todo relatório, changelog ou tooling que consultasse o `package.json` leria a versão errada,
e a divergência crescia a cada release.

Era pendência aberta desde 2026-08-18, formulada assim: o `package.json` vira fonte única de versão ou é
oficialmente ignorado?

### Decisão

**O `package.json` passa a ser a fonte única.** A constante literal no `App.jsx` foi substituída por
`__APP_VERSION__`, injetado em tempo de build pelo `define` do Vite a partir do `package.json`. Subir
versão passa a ser uma edição em um lugar só.

O mesmo `define` foi repetido no `vitest.config.js`, porque o Vitest não carrega o `vite.config.js`: sem
isso, o primeiro teste que importasse o `App.jsx` quebraria com `__APP_VERSION__ is not defined`. O
`eslint.config.js` declara `__APP_VERSION__` como global de leitura, senão o `no-undef` adotado na Fase 0
acusaria a variável injetada.

### Raciocínio

A alternativa era manter os dois números e sincronizá-los à mão a cada release. Foi descartada: sincronia
manual entre duas fontes é exatamente o que produziu a divergência de `0.1.0` contra `0.3.37.0` ao longo
de todo o projeto. Repetir o mecanismo esperando um resultado diferente não é decisão, é hábito.

A direção do fluxo (`package.json` → código, e não o contrário) foi escolhida porque o `package.json` é
lido por ferramenta externa e o `App.jsx` não. Um arquivo `.js` de constante exportada resolveria o lado
do código, mas deixaria o `package.json` errado, que é justamente o lado que outras ferramentas enxergam.

### O que mudou

- `package.json`: `"version"` de `0.1.0` para `0.3.37.0`, alinhado ao que o app já exibia.
- `vite.config.js` e `vitest.config.js`: `define` de `__APP_VERSION__` lido do `package.json`.
- `src/App.jsx`: `const APP_VERSION = __APP_VERSION__;`.
- `eslint.config.js`: `__APP_VERSION__` como global `readonly`.

Nada muda para o usuário: o app continua exibindo `v0.3.37.0`. Verificado no bundle de produção.

### Reversibilidade

**Total e barata.** Reverter é voltar o literal para o `App.jsx` e apagar os dois `define`. Nenhum dado
persistido depende disto.

### Cuidado herdado

O `"name"` do `package.json` continua `financas-pro-localhost`, resquício da fase em que o app só rodava
em `localhost`. Com o deploy da Fase A o nome fica enganoso, mas renomear pacote é assunto separado e não
foi tocado aqui.

## DEC-0041 — Carimbo de alteração na fronteira de persistência, e não nos setters

Data: 2026-08-18

### Contexto

A Fase 1 da v0.3.38 pedia "carimbo `updatedAt` em toda escrita de registro, em todas as entidades". O
`App.jsx` tem dezenas de pontos que escrevem estado (`setTrans`, `setCards`, `setCats`, ...), e antes
desta fase o carimbo existia em três deles e em dois services — os cinco lugares onde alguém lembrou.

O `updatedAt` é o único item do desenho que **não pode ser retrofitado**: dado escrito hoje sem carimbo
nunca mais recupera a data em que foi alterado.

### Decisão

**O carimbo é aplicado no `useLS`, na fronteira de persistência**, por `stampChangedRecords`, que recebe
o par (anterior, próximo) que o React já entrega ao setter funcional. Nenhum ponto de escrita do `App.jsx`
precisa lembrar de carimbar.

Três decisões acompanham, e vão além do que o roadmap pedia:

1. **`updatedBy` além de `updatedAt`.** O aceite da Fase 4 diz "apresentar para escolha o que os dois
   mudaram, mostrando `updatedAt` e `usuario`". Sem atribuição por registro, essa tela mostraria a
   autoria do payload inteiro, não de cada linha. E, como o `updatedAt`, atribuição não é retrofitável:
   registro gravado hoje sem autor nunca mais sabe quem o alterou.
2. **A regra de "o que é registro" é estrutural, não uma lista.** Objeto com `id` dentro de um array, em
   qualquer profundidade. Com isso `cats[].subs[]` (recursivo), `dividas[].amortizacoes[]`,
   `cofrinhos[].aportes[]` e `params.autoCategoryRules[]` entram sem lista de exceções para manter
   atualizada — e uma entidade nova nasce carimbada sem ninguém precisar lembrar.
3. **Três escritas são isentas** (`stamp:false`): restauração de backup, normalização de leitura e
   migração automática de campo. Ver `RN035`.

### Raciocínio

A alternativa óbvia era carimbar em cada setter. Foi descartada por um motivo concreto, não estético: o
ponto esquecido não falha em teste nem em build — ele falha na Fase 4, como registro que o merge não sabe
desempatar, e só aparece quando os dois dispositivos já estiverem em uso real. É o mesmo padrão da dívida
que a Fase 0 acabou de fechar (`catColor is not defined`), em que nada acusava o esquecimento.

A segunda alternativa era carimbar tudo a cada gravação, sem comparar. É mais simples e está errada: se
toda escrita recarimba a base inteira, o merge de três vias passa a ver a base inteira como alterada dos
dois lados, e a tela de conflito vira ruído. O carimbo só tem valor se distinguir o que mudou. Por isso
`stampChangedRecords` compara ignorando os próprios campos de carimbo e **preserva a referência dos
objetos que não mudaram** — o que também evita invalidar os `useMemo` do `App.jsx`.

Sobre carimbar o pai quando um filho muda: renomear uma subcategoria carimba a subcategoria **e** a
categoria que a contém. É intencional. O pai de fato mudou de conteúdo, e o merge precisa enxergar isso
para não aplicar um pai antigo por cima de um filho novo.

### O que mudou

- `src/services/recordStamp.js` (novo): `stampChangedRecords`, `equalIgnoringStamp`, `setStampUser`.
- `src/hooks/useLocalStorage.js`: `useLS` carimba antes de persistir; setter aceita `{ stamp: false }`.
- `src/hooks/useTransactionsStorage.js` e a migração de cartões no `App.jsx`: passam `stamp:false`.
- `src/App.jsx`: estado `usuario` (chave própria), sincronização com `setStampUser`, restauração de
  backup sem carimbo, e preservação do `usuario` no "Apagar dados financeiros" — que apaga todas as
  chaves `fpro_`.
- `src/components/organisms/ParamsTab.jsx`: campo "Identificação neste dispositivo" na aba Geral.
- `tests/recordStamp.test.js`: 29 testes, cobrindo criação e edição por entidade, os três casos sem
  carimbo e a preservação de referência.
- `RN035` nova em `docs/02-REGRAS-DE-NEGOCIO.md`.

**Sem bump de `LS_VERSION` e sem migração**: os campos são aditivos e registro antigo sem carimbo
continua válido — ele simplesmente ganha carimbo na primeira vez que for alterado.

### Reversibilidade

**Alta hoje, baixa depois de dias de uso.** Reverter o mecanismo é apagar um arquivo e três linhas. O que
não se recupera é o tempo: cada dia sem carimbo é um dia de alterações cuja data e cuja autoria não
existem em lugar nenhum. Foi por isso que esta fase veio antes da infraestrutura do Supabase, e não
depois.

### Limitação conhecida

`metas`, `saldosIniciais` e os escalares de `params` não recebem carimbo por não terem identidade própria
(ver `RN035`). Se o merge da Fase 4 mostrar que a resolução por valor não basta para esses três, a saída
não é forçar carimbo neles: é reestruturá-los como listas de registros — o que **é** mudança de formato e
exigiria migração, isto é, decisão nova.

## DEC-0042 — Schema do servidor: allowlist, numeração pelo servidor e retenção por contagem

Data: 2026-08-18

### Contexto

A Fase 2 da v0.3.38 pedia uma frase: "tabela de uma linha `estado(payload jsonb, versao, updatedAt,
usuario)`, com RLS e retenção das últimas versões". Escrever o SQL correspondente exigiu decidir quatro
coisas que a frase não cobria, e uma delas é uma falha de segurança real na leitura ingênua do enunciado.

Nada disso é código do app: a Fase 2 não toca `src/`.

### Decisão

**1. Allowlist `contas_autorizadas`, e não `to authenticated` puro.**

A RLS ingênua deste desenho seria `for select to authenticated using (true)`: a conta é compartilhada
(D7), `auth.uid()` é o mesmo para os dois dispositivos, então não há o que filtrar. Isso está errado, e o
motivo não aparece no enunciado: **o cadastro público vem ligado por padrão no Supabase**, e a `anon key`
está no bundle por decisão (D8). Qualquer pessoa que abrisse a URL, lesse a chave e criasse uma conta
viraria `authenticated` — exatamente o papel que a policy liberaria.

As policies passam a exigir `public.conta_autorizada()`, que verifica presença numa tabela com RLS ligada
e **nenhuma policy**: invisível pela API, administrada só pelo painel. Desligar o cadastro público
continua sendo passo obrigatório do roteiro; as duas travas juntas são o desenho, não redundância
decorativa — a primeira impede a conta existir, a segunda impede que ela sirva para alguma coisa.

**2. `versao` e `atualizado_em` são carimbadas pelo servidor, por gatilho.**

O cliente envia `payload` e `usuario`. A numeração e a data são atribuídas em `before insert/update`. Sem
isso, cliente com relógio errado reordena o histórico, e cliente com defeito escolhe o próprio número de
versão — que é justamente o valor sobre o qual a trava otimista decide.

Efeito colateral bem-vindo: a trava da Fase 3 vira uma cláusula `where`, não código de servidor.
`update estado set ... where id = 1 and versao = <a carregada>`; uma linha afetada é aceite, zero é recusa.
A Fase 3 fica sendo cliente e mensagem de erro.

**3. Histórico em `estado_versoes`, escrito só pelo gatilho.**

O ancestral do merge de três vias mora numa tabela própria, alimentada pelo mesmo gatilho que arquiva a
versão substituída. O cliente tem policy de `select` e nenhuma de escrita. A versão corrente não é copiada
para lá: ela vive só em `estado`, e o ancestral que a Fase 4 busca nunca é a corrente — se fosse, não teria
havido recusa.

**Com `revoke` explícito, e não só com ausência de policy.** Este é o detalhe fino da fase, e a primeira
versão do script errava nele: ausência de policy no Postgres **filtra linha, não levanta erro**. Um delete
indevido em `estado` retornaria "0 linhas afetadas" — silêncio no lugar de recusa, que é exatamente o que a
invariante de persistência do projeto proíbe. Somam-se dois fatos: o Supabase concede `all` em `public`
para `anon` e `authenticated` por default privilege, então o `grant` do script não subtraía nada. O
`revoke delete on estado` e o `revoke insert, update, delete on estado_versoes` são o que transforma
tentativa indevida em erro visível. Os gatilhos seguem escrevendo porque são `SECURITY DEFINER` e rodam
como o dono das tabelas.

**4. Retenção de 100 versões, por contagem e não por prazo.**

### Raciocínio do número

O que precisa sobreviver é a versão que o **outro** dispositivo carregou e ainda não substituiu. Sob a D6
(sync ao abrir, ao sair e por botão), dois dispositivos produzem algo entre 10 e 20 versões por dia de uso
normal. 100 versões cobrem de cinco a dez dias — folga suficiente para o caso que realmente preocupa, que
é aba deixada aberta por dias sem sincronizar.

Prazo foi descartado como critério: "90 dias" (o número que a `DEC-0037` usava para o expurgo de tombstone,
já revogado) daria de 900 a 1.800 payloads retidos. A algumas centenas de KB cada, isso passa de 500 MB —
o teto do plano gratuito inteiro. Contagem limita o pior caso; prazo não limita nada.

Se o ancestral tiver sido expurgado, o comportamento já está definido e não é falha: degrada para a
recusa com backup da Fase 3 (`DEC-0039`, decisão de implementação 3).

### Alternativas avaliadas e descartadas

- **Função RPC `salvar_estado(payload, versao_esperada, usuario)` em vez de `update ... where`.** Seria
  necessária se a trava exigisse mais de um comando atômico. Não exige: o `update` condicional já é
  atômico, e a contagem de linhas afetadas já é a resposta. Uma RPC acrescentaria uma camada para
  transportar a mesma informação.
- **Guardar também a versão corrente em `estado_versoes`.** Simplificaria o raciocínio ("o histórico tem
  tudo") ao custo de duplicar o payload maior. Descartada por não existir consulta que precise disso.
- **Treze tabelas em vez de um `jsonb`.** Já descartada na D2 e mantida aqui pelo mesmo motivo: o servidor
  não faz nenhuma consulta analítica. `projectionService` e `saldoService` rodam no cliente.
- **Policy por e-mail (`auth.jwt() ->> 'email' = '...'`) em vez de allowlist.** Descartada por obrigar o
  endereço da conta a viver dentro do schema versionado em git.

### O que mudou

- `supabase/sql/0001-estado-e-rls.sql` (novo): schema, gatilhos, RLS e grants. Idempotente.
- `supabase/sql/0002-aceite.sql` (novo): roteiro de aceite bloco a bloco, com o resultado esperado de
  cada um, incluindo os três comandos que **devem** falhar.
- `supabase/README.md` (novo): passo a passo do painel, com a regra da senha em destaque.
- `.env.example` (novo): `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. `.env` e `.env.local` já estavam
  no `.gitignore`.
- **Nenhum arquivo de `src/` foi tocado.**

### Estado da fase

**O script está escrito; nada foi executado.** O projeto Supabase é criado na conta do usuário, com senha
que por decisão (D8) não passa por este repositório nem por variável de ambiente do Vercel. O aceite da
Fase 2 é a execução do `0002-aceite.sql` no painel, não a existência do arquivo.

### Reversibilidade

**Total hoje.** Não há projeto criado, não há dado gravado e o app não conhece o Supabase. Reverter é
apagar quatro arquivos. Depois de a base entrar em uso, mudar o formato de `payload` deixa de ser
reversível de graça — mas o formato de `payload` é o do backup, que já existe e não muda aqui.

### Nota de segurança

A `service_role key` do painel ignora RLS por construção. Ela não entra no repositório, não entra no
`.env.local` e não entra no Vercel. O único lugar em que ela existe é o painel do Supabase.
