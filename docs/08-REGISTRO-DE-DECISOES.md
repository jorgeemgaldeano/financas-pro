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
