# Regras de Negócio — Finanças PRO

Este documento consolida as regras de negócio que devem nortear a evolução do aplicativo.

## RN001 — Persistência local

O sistema deve persistir os dados do usuário em LocalStorage.

### Critérios

- Os dados devem continuar disponíveis após recarregar a página.
- Alterações relevantes devem ser salvas automaticamente.
- A estrutura persistida deve possuir versionamento.
- Mudanças de estrutura devem ter migração.

## RN002 — Preservação dos dados existentes

Atualizações da aplicação não devem apagar, sobrescrever ou invalidar dados antigos sem migração.

### Critérios

- A aplicação deve reconhecer versões anteriores.
- A aplicação deve preencher campos novos com valores padrão seguros.
- A aplicação deve evitar quebra quando dados antigos não tiverem atributos novos.

## RN003 — Controle mensal

A aplicação deve organizar as informações financeiras por mês de competência.

### Critérios

- Receitas e despesas devem ser filtráveis por mês.
- Faturas devem ser apuradas por mês.
- Saldos iniciais devem ser mensais.
- Projeções devem respeitar o mês selecionado.

## RN004 — Saldo inicial mensal por conta

Cada conta deve possuir saldo inicial mensal.

### Critérios

- Ao iniciar um mês, o sistema deve considerar o saldo inicial daquele mês.
- O saldo inicial pode ser informado manualmente ou calculado por regra definida.
- O saldo final do mês deve considerar saldo inicial, receitas, despesas, transferências e pagamentos.
- Ajustes manuais devem ser rastreáveis.

## RN005 — Lançamentos de receita

Receitas representam entrada financeira.

### Critérios

- Receita pode estar prevista, recebida parcialmente ou recebida integralmente.
- Receita deve poder ser vinculada a uma conta.
- Receita repetitiva deve poder gerar lançamentos previstos.
- Receita baixada deve impactar o saldo realizado.

## RN006 — Lançamentos de despesa

Despesas representam saída financeira.

### Critérios

- Despesa pode estar prevista, paga parcialmente ou paga integralmente.
- Despesa em conta corrente deve impactar a conta associada.
- Despesa em cartão deve impactar a fatura do cartão, não diretamente a conta corrente.
- Despesa repetitiva deve poder gerar lançamentos previstos.

## RN007 — Diferença entre previsto e realizado

O sistema deve diferenciar valores previstos de valores efetivamente pagos ou recebidos.

### Critérios

- Lançamentos previstos não devem ser confundidos com realizados.
- A baixa total altera o status para pago/recebido.
- A baixa parcial mantém saldo pendente.
- Relatórios devem deixar claro se exibem previsto, realizado ou ambos.

## RN008 — Baixa total

A baixa total confirma integralmente o pagamento ou recebimento de um lançamento previsto.

### Critérios

- O valor pago deve ser igual ao valor previsto ou ao saldo pendente.
- O status deve ser atualizado para pago ou recebido.
- O saldo da conta deve ser impactado conforme o tipo do lançamento.

## RN009 — Baixa parcial

A baixa parcial confirma parte do pagamento ou recebimento de um lançamento previsto.

### Critérios

- O valor baixado deve ser maior que zero.
- O valor baixado não deve exceder o saldo pendente.
- O lançamento deve permanecer com status parcial.
- O saldo pendente deve ser recalculado.

## RN010 — Cartão vinculado a conta

Cada cartão de crédito deve ser vinculado a uma conta corrente específica no momento do cadastro.

### Critérios

- O cadastro do cartão deve exigir a seleção de uma conta associada.
- A conta associada será usada para lançamento do pagamento da fatura.
- A despesa individual do cartão não precisa ser vinculada à conta corrente.
- Alteração da conta associada deve ter impacto controlado nas faturas futuras.

## RN011 — Despesa de cartão

Despesa realizada no cartão deve compor a fatura do cartão.

### Critérios

- A despesa deve ser vinculada ao cartão.
- A despesa deve ter data, valor, categoria e descrição.
- A despesa deve entrar na fatura conforme regra de fechamento/vencimento.
- A despesa não deve reduzir diretamente o saldo da conta corrente no momento do cadastro.

## RN012 — Fechamento da fatura

A fatura do cartão deve poder ser fechada para consolidar o valor a pagar.

### Critérios

- A fatura deve consolidar despesas, parcelas e ajustes.
- Após fechamento, deve ser gerado lançamento previsto de pagamento da fatura.
- O lançamento previsto deve ser vinculado à conta associada ao cartão.
- O mês do pagamento deve ser o mês subsequente, conforme regra definida.
- Fatura fechada não deve ser alterada sem registro de ajuste ou reabertura controlada.

## RN013 — Pagamento da fatura

O pagamento da fatura deve ser tratado como lançamento previsto passível de baixa total ou parcial.

### Critérios

- O pagamento deve debitar a conta corrente associada ao cartão.
- Pagamento total quita a fatura.
- Pagamento parcial mantém saldo pendente.
- O sistema deve controlar valor pago e valor restante.
- O pagamento não deve duplicar despesas já lançadas no cartão.

## RN014 — Ajuste de cartão de crédito

O sistema deve permitir transação de ajuste no cartão de crédito.

### Critérios

- Ajuste pode aumentar ou reduzir o valor da fatura.
- Ajuste deve ser vinculado a cartão e mês de competência.
- Ajuste deve ser identificado como ajuste, não como despesa comum.
- Ajuste deve afetar o valor final da fatura.
- Ajuste deve possuir descrição obrigatória.
- Ajuste deve ser rastreável.

## RN015 — Parcelamento

Compras parceladas devem gerar parcelas futuras.

### Critérios

- Cada parcela deve possuir valor, número e vencimento/competência.
- A soma das parcelas deve fechar com o valor total da compra.
- Parcelas devem entrar nas faturas corretas.
- Alterações em compra parcelada devem preservar consistência.

## RN016 — Importação de extratos

Importações devem passar por conferência antes de persistir definitivamente.

### Critérios

- O usuário deve selecionar a origem da importação.
- O sistema deve validar formato e campos mínimos.
- O usuário deve revisar lançamentos importados.
- O sistema deve evitar duplicidades quando possível.
- Lançamentos importados devem preservar origem, data e descrição.

## RN017 — Backup

O sistema deve permitir exportar backup dos dados.

### Critérios

- Backup deve conter versão da estrutura.
- Backup deve conter data de geração.
- Backup deve conter todos os dados necessários para restauração.
- Backup não deve depender de conexão com internet.

## RN018 — Restauração

O sistema deve permitir restaurar dados de backup.

### Critérios

- Antes de substituir dados atuais, deve haver confirmação.
- O sistema deve validar versão do backup.
- Backups antigos devem passar por migração, quando necessário.
- Falha na restauração não deve apagar os dados atuais.

## RN019 — Categorias hierárquicas

O sistema deve permitir categorias e subcategorias.

### Critérios

- Cada lançamento pode ser associado a categoria e subcategoria.
- Categorias inativas não devem aparecer como novas opções padrão.
- Relatórios devem conseguir agrupar por categoria principal e subcategoria.

## RN020 — Exclusão lógica quando aplicável

Quando uma exclusão puder impactar histórico financeiro, deve-se preferir inativação ou exclusão lógica.

### Critérios

- Contas com lançamentos não devem ser removidas sem controle.
- Cartões com faturas não devem ser removidos sem controle.
- Categorias utilizadas devem poder ser inativadas.
- Lançamentos podem ser cancelados ou removidos conforme regra definida.

## RN021 — Consistência dos cálculos

Os cálculos financeiros devem ser centralizados sempre que possível.

### Critérios

- Evitar cálculo duplicado em várias telas.
- Dashboard, projeções e relatórios devem usar as mesmas funções base.
- Mudanças de regra devem atualizar todos os pontos consumidores.
- Valores monetários devem ser tratados com cuidado para evitar erro de arredondamento.

## RN022 — Importação deve ignorar movimentações automáticas BB Rende Fácil

Transações identificadas como **BB Rende Fácil** ou **Rende Fácil** devem ser desprezadas na importação bancária.

### Critérios

- A regra deve valer para extratos bancários importados em OFX, QFX, CSV e TXT, quando a descrição permitir identificação.
- As transações ignoradas devem aparecer no relatório de importação como itens desprezados por regra.
- O sistema não deve criar lançamento financeiro para essas movimentações.
- A finalidade é evitar duplicidade causada por movimentações automáticas entre conta corrente e poupança associada.

## RN023 — Relatório e rastreabilidade de importação

Toda importação deve gerar informações mínimas de rastreabilidade.

### Critérios

- Cada lote importado deve possuir identificador único.
- O relatório deve informar lançamentos importados, duplicados e ignorados.
- O usuário deve conseguir revisar itens desprezados ou duplicados.
- O sistema deve permitir desfazer um lote importado sem remover lançamentos manuais.

## RN024 — Regras editáveis de autocategorização

O usuário deve poder cadastrar regras personalizadas para autocategorização de lançamentos importados.

### Critérios

- A regra deve conter tipo financeiro, categoria sugerida e palavras-chave.
- As regras personalizadas devem ter prioridade sobre histórico e regras automáticas padrão.
- O sistema deve permitir adicionar e remover regras.
- Regras muito genéricas devem ser tratadas como risco de categorização indevida.

## RN025 — Competência da fatura no lançamento de cartão

Lançamentos de cartão de crédito devem permitir informar a competência da fatura impactada.

### Critérios

- O campo de competência da fatura deve ser opcional.
- Quando informado, deve prevalecer sobre a competência calculada automaticamente.
- Em compras parceladas, a competência informada representa a primeira parcela.
- As demais parcelas devem avançar mês a mês a partir da primeira competência.
- Quando não informado, o sistema deve calcular a competência conforme data da compra, dia de fechamento do cartão e fatura aberta.
- Se a fatura calculada já estiver fechada manualmente, o lançamento deve ser direcionado à próxima fatura aberta.

## RN026 — Simulações de compra no cartão

Simulações devem demonstrar o impacto por competência de fatura.

### Critérios

- A simulação deve considerar o número de parcelas informado.
- A simulação deve calcular a competência afetada pela regra de fechamento do cartão.
- A visão deve exibir o total real do mês competência, o impacto simulado e o total projetado.
- A simulação deve ser persistida.
- O usuário deve poder refazer a simulação com a situação atualizada.
- A exclusão da simulação deve ser manual ou decorrente de limpeza explícita dos dados do sistema.

## RN027 — Exportação TXT de despesas de cartão

O sistema deve permitir exportar despesas de cartão de crédito em formato TXT.

### Critérios

- A exportação deve respeitar o cartão e a competência selecionada.
- O arquivo deve conter dados suficientes para conferência: competência, cartão, data, descrição, categoria, parcela e valor.
- A exportação não deve alterar dados persistidos.

## RN028 — Detalhamento mensal por pessoa

A aba Pessoas deve apresentar detalhamento mensal acumulado por pessoa para despesas compartilhadas.

### Critérios

- O sistema deve consolidar valores por mês de competência e por pessoa.
- A visão deve permitir identificar valores a receber, a pagar, pendentes e saldo líquido.
- O usuário deve conseguir gerir os lançamentos do mês exibido.


## RN029 — Backup deve incluir simulações e metadados de importação

O backup do sistema deve preservar todos os dados necessários para restauração completa, incluindo estruturas adicionadas recentemente.

### Critérios

- O backup deve incluir simulações persistidas.
- O backup deve preservar metadados de importação existentes nos lançamentos, como `importBatchId`, `importSource` e `importedAt`.
- O backup deve incluir parâmetros, inclusive regras editáveis de autocategorização.
- A restauração deve validar a estrutura antes de sobrescrever dados atuais.
- Backup inválido ou incompatível não deve apagar dados atuais.
- Backups antigos sem simulações devem continuar funcionando com lista vazia como fallback.
- A restauração deve manter compatibilidade com as chaves atuais do LocalStorage.

---

## Atualização v0.3.26.2 — Importação de cartão: master lógico de parcelamento

### RN-CARTAO-IMPORT-001 — Compra à vista

Quando a linha importada de cartão de crédito não representar parcelamento, o sistema deve realizar a carga normalmente, observando as regras já existentes de duplicidade, validação de cartão, competência, fatura fechada e confirmação pelo usuário.

### RN-CARTAO-IMPORT-002 — Master lógico do parcelamento

Quando a linha importada representar compra parcelada, o sistema deve identificar o master lógico por:

```txt
cartão + descrição base normalizada + data da compra + valor da parcela com tolerância de R$ 0,10
```

A competência da fatura não deve ser usada como chave principal do parcelamento. Ela serve para posicionar cada parcela no mês correto.

### RN-CARTAO-IMPORT-003 — Tolerância de valor

Na comparação do valor da parcela, o sistema deve considerar equivalentes valores com diferença de até R$ 0,10 para mais ou para menos.

Exemplo:

```txt
Valor importado: R$ 100,00
Equivalentes: R$ 99,90 até R$ 100,10
Não equivalentes: R$ 99,89 ou R$ 100,11
```

### RN-CARTAO-IMPORT-004 — Parcelamento já existente

Se o master lógico já existir, o sistema deve validar se a parcela e o total de parcelas informados no arquivo correspondem ao que já existe no sistema.

Se a parcela já existir, não deve importar novamente.

Se o master existir, mas a parcela não existir, o sistema deve apontar divergência e não importar automaticamente.

Se o total de parcelas divergir, o sistema deve apontar divergência e não importar automaticamente.

### RN-CARTAO-IMPORT-005 — Parcelamento novo

Se o master lógico não existir, o sistema deve criar o parcelamento, incluindo a parcela da competência atual e as parcelas futuras/subsequentes conforme o total de parcelas informado.

### RN-CARTAO-IMPORT-006 — Compras semelhantes no mesmo local e data

O sistema deve permitir compras diferentes realizadas no mesmo estabelecimento, na mesma data e com o mesmo número de parcela, desde que o valor da parcela seja diferente acima da tolerância de R$ 0,10.

---

## Atualização v0.3.26.3 — Duplicidade entre parcelas futuras geradas

Na importação de cartão, compras parceladas não devem ser comparadas pela mesma chave de compras à vista quando a prévia contém parcelas futuras geradas automaticamente.

### Regra

- Compra à vista: validar duplicidade por cartão, data, descrição e valor.
- Compra parcelada: validar duplicidade por master lógico, número da parcela e total de parcelas.

### Justificativa

Todas as parcelas futuras de uma compra parcelada compartilham a mesma data da compra, descrição base e valor. Usar esses campos isoladamente faz as parcelas 2/N em diante serem marcadas como duplicadas indevidamente.

## Atualização RN016/RN015 — v0.3.26.4 — Fatura subsequente de cartão

Quando uma compra parcelada já tiver sido criada em carga anterior, a importação de fatura subsequente deve reconhecer as parcelas futuras já existentes.

A regra principal do master lógico continua sendo:

```txt
cartão + descrição base normalizada + data da compra + valor da parcela com tolerância de R$ 0,10
```

Como alguns emissores podem alterar data ou descrição entre faturas, a validação complementar de fatura subsequente passa a ser:

```txt
cartão + competência + número da parcela + total de parcelas + valor aproximado + descrição compatível
```

Critérios:

- Se a parcela da competência já existir, a linha importada deve ser marcada como existente/duplicada.
- Se houver diferença de valor maior que R$ 0,10, não deve ser considerada a mesma parcela.
- Se a descrição não for compatível, não deve ser considerada a mesma parcela automaticamente.
- Se o lançamento for realmente novo, deve continuar selecionado para importação.
- Não há alteração estrutural de LocalStorage.


## Atualização RN015/RN016 — v0.3.26.5 — Divergência de parcelas na importação de cartão

Compras parceladas importadas de cartão devem considerar tolerância de valor de R$ 0,05 para mais ou para menos.

Quando um parcelamento já existir e o arquivo trouxer parcela divergente da prevista para a competência, o sistema deve:

- listar a divergência para análise manual;
- não importar automaticamente a linha divergente;
- permitir correção manual da parcela atual e das subsequentes do mesmo grupo;
- preservar o `parcelaGrupo`;
- atualizar apenas campos já existentes dos lançamentos, sem nova chave de LocalStorage.

---

## Atualização v0.3.26.6 — Divergência de parcela na importação de cartão

Quando a importação de cartão identificar que um parcelamento já existe, mas a parcela informada no arquivo diverge da parcela gravada no sistema para a mesma competência, o sistema deve tratar o caso como divergência de parcelamento.

### Regra

- A linha divergente não deve ser importada automaticamente.
- O sistema não deve criar nova parcela final automaticamente.
- O sistema deve listar a divergência para análise manual.
- O usuário deve visualizar quais parcelas podem ser impactadas.
- O usuário pode escolher uma das ações:
  1. manter como está;
  2. alterar somente a parcela da competência atual;
  3. alterar a parcela atual e as subsequentes.

### LocalStorage

Sem nova chave obrigatória. Alterações confirmadas pelo usuário atualizam apenas campos já existentes ou opcionais nos lançamentos do cartão.

---

## RN030 — Classificação manual de créditos na importação de fatura de cartão

Créditos identificados na importação de fatura de cartão (`tipo:"receita"`, ex.: `TRNTYPE=CREDIT` em OFX) devem ser classificados manualmente pelo usuário antes de serem importados.

### Critérios

- A linha de crédito deve ficar bloqueada para seleção até o usuário escolher uma das classificações: pagamento da fatura anterior, crédito de reparcelamento de compra à vista, ou estorno de compra.
- Pagamento da fatura anterior: o valor deve ser desprezado na fatura atual (não gera lançamento), mas deve aparecer no relatório da importação para conferência.
- Crédito de reparcelamento de compra à vista ou estorno: o usuário deve informar a competência de destino, e o valor deve entrar como crédito (redução) na fatura dessa competência, não na competência do lote de importação.
- O sistema não deve permitir salvar um crédito de reparcelamento/estorno em competência cuja fatura já esteja fechada, sem antes reabrir a fatura (mesma regra de RN012 para lançamentos novos).
- A ausência de classificação não deve resultar em importação automática do crédito na competência do lote (regra anterior a esta era considerada incorreta).
- Ao classificar a linha (e informar a competência de destino, quando exigida), ela deve ser marcada automaticamente para importação — o usuário não deve precisar marcá-la manualmente depois de classificá-la (bug corrigido na v0.3.30.1: a linha ficava desbloqueada, mas permanecia desmarcada).
