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
