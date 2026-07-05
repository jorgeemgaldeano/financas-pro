# Critérios de Aceite — Finanças PRO

Este arquivo deve ser atualizado conforme as funcionalidades forem implementadas.

## CA001 — Cadastrar cartão com conta vinculada

### Cenário 1 — Cadastro válido

Dado que o usuário acessa a tela de cartões  
E existe pelo menos uma conta ativa cadastrada  
Quando o usuário cadastra um novo cartão informando a conta associada  
Então o sistema deve salvar o cartão com o campo `accountId` preenchido  
E o cartão deve ficar disponível para uso em despesas de cartão.

### Cenário 2 — Conta não informada

Dado que o usuário acessa a tela de cartões  
Quando tenta cadastrar um cartão sem informar conta associada  
Então o sistema deve bloquear o cadastro  
E deve exibir mensagem informando que a conta associada é obrigatória.

## CA002 — Registrar despesa no cartão

Dado que existe um cartão cadastrado com conta associada  
Quando o usuário lança uma despesa no cartão  
Então a despesa deve ser vinculada ao cartão  
E não deve debitar diretamente a conta corrente  
E deve compor a fatura do cartão conforme mês de competência.

## CA003 — Criar ajuste de fatura

Dado que existe uma fatura de cartão  
Quando o usuário cria um ajuste positivo ou negativo com descrição  
Então o ajuste deve impactar o total da fatura  
E deve aparecer identificado como ajuste  
E não deve ser tratado como despesa comum.

## CA004 — Fechar fatura

Dado que existe uma fatura aberta com despesas e/ou ajustes  
Quando o usuário fecha a fatura  
Então o sistema deve calcular o valor final  
E deve gerar lançamento previsto de pagamento  
E o lançamento deve ser vinculado à conta associada ao cartão  
E o lançamento deve ficar no mês subsequente.

## CA005 — Baixar pagamento total da fatura

Dado que existe lançamento previsto de pagamento de fatura  
Quando o usuário baixa o valor total  
Então o lançamento deve ficar com status pago  
E a fatura deve ficar com status paga  
E o saldo da conta associada deve ser reduzido pelo valor pago.

## CA006 — Baixar pagamento parcial da fatura

Dado que existe lançamento previsto de pagamento de fatura  
Quando o usuário baixa apenas parte do valor  
Então o lançamento deve ficar com status parcial  
E a fatura deve ficar com status parcialmente paga  
E o saldo pendente deve ser recalculado  
E o saldo da conta associada deve ser reduzido apenas pelo valor pago.

## CA007 — Saldo inicial mensal

Dado que uma conta possui saldo inicial para determinado mês  
Quando o usuário visualiza o saldo do mês  
Então o sistema deve considerar o saldo inicial mensal  
E deve somar receitas realizadas  
E deve subtrair despesas realizadas  
E deve subtrair pagamentos de fatura realizados.

## CA008 — Lançamento recorrente previsto

Dado que existe uma receita ou despesa repetitiva  
Quando o sistema gera os lançamentos do mês  
Então deve criar lançamento previsto  
E não deve duplicar lançamento já existente para o mesmo mês e mesma recorrência.

## CA009 — Backup e restauração

Dado que o usuário possui dados cadastrados  
Quando exporta um backup  
Então o arquivo deve conter os dados necessários para restauração.

Dado que o usuário importa um backup válido  
Quando confirma a restauração  
Então o sistema deve substituir os dados atuais pelos dados do backup  
E deve preservar compatibilidade com a versão do backup.

## CA010 — Ignorar BB Rende Fácil na importação bancária

Dado que o usuário importa um extrato bancário  
E o arquivo contém transações com descrição BB Rende Fácil ou Rende Fácil  
Quando o sistema processa a importação  
Então essas transações não devem ser criadas como lançamentos financeiros  
E devem aparecer no relatório de importação como ignoradas por regra.

## CA011 — Relatório de importação

Dado que o usuário importa um arquivo válido  
Quando o processamento é concluído  
Então o sistema deve exibir relatório com importados, duplicados e ignorados  
E deve permitir ao usuário identificar o motivo dos itens não importados.

## CA012 — Desfazer lote importado

Dado que existe um lote importado com `importBatchId`  
Quando o usuário aciona a opção de desfazer lote  
Então o sistema deve remover apenas os lançamentos daquele lote  
E deve preservar lançamentos manuais ou de outros lotes.

## CA013 — Regras editáveis de autocategorização

Dado que o usuário acessa Parâmetros > Autocategorização  
Quando cadastra uma regra com tipo, categoria e palavras-chave  
Então o sistema deve salvar a regra  
E deve aplicá-la em novas importações quando houver correspondência da descrição.

## CA014 — Competência da fatura no cartão

Dado que o usuário lança uma despesa no cartão  
Quando informa manualmente a competência da fatura  
Então o lançamento deve compor a fatura da competência informada.

Dado que o usuário lança uma despesa no cartão sem informar competência  
Quando a data da compra é avaliada  
Então o sistema deve calcular a competência conforme dia de fechamento do cartão  
E deve direcionar para a próxima fatura aberta se a fatura calculada já estiver fechada.

## CA015 — Competência da primeira parcela

Dado que o usuário lança uma compra parcelada no cartão  
Quando informa a competência da fatura  
Então essa competência deve ser aplicada à primeira parcela  
E as parcelas seguintes devem avançar mês a mês.

## CA016 — Simulações persistidas e recalculáveis

Dado que o usuário cria uma simulação  
Quando atualiza a página  
Então a simulação deve continuar disponível.

Dado que existe uma simulação salva  
Quando o usuário aciona refazer simulação  
Então o sistema deve recalcular o impacto com a situação financeira atualizada.

## CA017 — Simulação por competência de fatura

Dado que o usuário simula uma compra no cartão  
Quando o sistema calcula o impacto  
Então deve considerar a competência da fatura afetada  
E deve exibir total real do mês, impacto simulado e total projetado.

## CA018 — Exportar despesas de cartão em TXT

Dado que o usuário acessa a aba Cartões  
E seleciona uma competência  
Quando aciona exportar TXT  
Então o sistema deve gerar arquivo TXT com as despesas do cartão naquela competência  
E a exportação não deve alterar dados salvos.

## CA019 — Detalhamento mensal por pessoa

Dado que uma pessoa possui despesas compartilhadas  
Quando o usuário acessa a aba Pessoas  
Então o sistema deve exibir resumo mensal acumulado  
E deve permitir gerir os lançamentos do mês selecionado.


## CA020 — Backup inclui simulações e metadados de importação

### Cenário 1 — Exportar backup com simulações

Dado que o usuário possui uma ou mais simulações cadastradas  
Quando exporta o backup  
Então o arquivo JSON deve conter as simulações  
E a restauração posterior deve recuperar essas simulações.

### Cenário 2 — Exportar backup com lançamentos importados

Dado que existem lançamentos criados por importação  
E esses lançamentos possuem `importBatchId`, `importSource` ou `importedAt`  
Quando o usuário exporta o backup  
Então esses metadados devem ser preservados no arquivo gerado.

### Cenário 3 — Restaurar backup válido

Dado que o usuário possui um backup válido do Finanças PRO  
Quando confirma a restauração  
Então o sistema deve restaurar dados financeiros, parâmetros, simulações e metadados de importação compatíveis  
E deve manter a aplicação funcional após atualizar a página.

### Cenário 4 — Restaurar backup inválido

Dado que o usuário seleciona um arquivo inválido ou incompatível  
Quando tenta restaurar o backup  
Então o sistema deve bloquear a restauração  
E os dados atuais não devem ser apagados ou substituídos.

---

## Critérios de aceite — v0.3.26.2 — Importação de cartão

### CT-CARTAO-IMPORT-001 — Compra à vista nova

Dado que importo uma compra não parcelada de cartão
E ela não existe no sistema
Quando confirmo a importação
Então o sistema deve criar o lançamento normalmente.

### CT-CARTAO-IMPORT-002 — Compra à vista duplicada

Dado que importo uma compra não parcelada já existente
Quando o sistema monta a prévia
Então a linha deve ser marcada como duplicada
E não deve ser importada novamente.

### CT-CARTAO-IMPORT-003 — Parcelamento novo em cartão vazio

Dado que não há lançamentos no cartão
E importo uma compra parcelada
Quando confirmo a importação
Então o sistema deve criar a parcela da competência atual
E deve criar as parcelas futuras conforme o total de parcelas.

### CT-CARTAO-IMPORT-004 — Parcelamento existente com parcela correta

Dado que existe um parcelamento no sistema
E importo uma fatura futura contendo uma parcela já criada
Quando o sistema monta a prévia
Então a linha deve ser marcada como já existente
E não deve ser importada novamente.

### CT-CARTAO-IMPORT-005 — Parcelamento existente com parcela ausente

Dado que existe o master lógico do parcelamento
Mas a parcela informada no arquivo não está no sistema
Quando o sistema monta a prévia
Então o sistema deve apontar divergência
E não deve importar automaticamente.

### CT-CARTAO-IMPORT-006 — Total de parcelas divergente

Dado que existe um parcelamento de 10 parcelas
Quando importo a mesma compra como 12 parcelas
Então o sistema deve apontar divergência de total de parcelas
E não deve importar automaticamente.

### CT-CARTAO-IMPORT-007 — Mesma loja, mesma data, valor diferente

Dado que existem duas compras parceladas no mesmo estabelecimento e na mesma data
E o valor da parcela possui diferença maior que R$ 0,10
Quando importo o arquivo
Então o sistema deve tratar como parcelamentos diferentes.

### CT-CARTAO-IMPORT-008 — Diferença de centavos tolerada

Dado que uma parcela existente tem valor R$ 100,00
Quando importo a mesma parcela com valor entre R$ 99,90 e R$ 100,10
Então o sistema deve considerar como mesmo parcelamento.

---

## Critérios de aceite v0.3.26.3

### CT-v0.3.26.3-001 — Parcelas futuras selecionadas na primeira carga

Dado que existe um cartão sem lançamentos
E uma fatura contém uma compra parcelada nova 1/N
Quando o usuário carrega o arquivo de importação
Então o sistema deve exibir a parcela atual e as parcelas futuras
E todas devem estar selecionadas para importação, salvo regra explícita de bloqueio.

### CT-v0.3.26.3-002 — Parcelas futuras não são duplicadas entre si

Dado que uma compra parcelada nova gera parcelas futuras na prévia
Quando o sistema valida duplicidade
Então não deve considerar as parcelas 2/N em diante como duplicadas apenas por terem mesma data de compra, descrição base e valor.

### CT-v0.3.26.3-003 — Reimportação futura continua bloqueada

Dado que o parcelamento já foi salvo
Quando uma fatura futura trouxer uma parcela já existente
Então o sistema deve marcar a linha como duplicada/parcela existente
E não deve importar novamente.

## CA0XX — Importar fatura subsequente com parcelas já existentes

### Cenário 1 — Parcela futura já criada

Dado que uma compra parcelada foi importada na competência inicial  
E o sistema criou as parcelas futuras  
Quando o usuário importa a fatura subsequente contendo uma dessas parcelas  
Então o sistema deve reconhecer a parcela já existente  
E deve marcar a linha como duplicada/existente  
E não deve importar novamente a parcela.

### Cenário 2 — Arquivo subsequente com data ou descrição diferente

Dado que uma parcela futura já existe no sistema  
E o arquivo da fatura subsequente apresenta data ou descrição parcialmente diferente  
Quando a parcela possuir mesma competência, mesmo número de parcela, mesmo total de parcelas, valor dentro de R$ 0,10 e descrição compatível  
Então o sistema deve considerar a parcela como já existente.

### Cenário 3 — Novo lançamento na fatura subsequente

Dado que a fatura subsequente contém lançamentos realmente novos  
Quando o sistema monta a prévia de importação  
Então os lançamentos novos devem permanecer selecionados para importação.


## CA030 — Tolerância de valor na importação de parcela de cartão

Dado que existe uma parcela de cartão no valor de R$ 116,24  
Quando o arquivo importado trouxer valor entre R$ 116,19 e R$ 116,29  
Então o sistema deve considerar o valor equivalente.

Dado que existe uma parcela de cartão no valor de R$ 116,24  
Quando o arquivo importado trouxer valor menor que R$ 116,19 ou maior que R$ 116,29  
Então o sistema não deve considerar automaticamente como a mesma parcela.

## CA031 — Divergência de parcela em fatura subsequente

Dado que existe no sistema a parcela 03/10 para uma competência  
Quando o arquivo importado informa a parcela 02/10 para o mesmo parcelamento e competência  
Então o sistema deve listar a divergência para análise manual  
E não deve importar automaticamente a linha divergente.

## CA032 — Correção manual da parcela atual e subsequentes

Dado que existe uma divergência de parcela corrigível  
Quando o usuário aciona a opção de corrigir parcela atual e subsequentes  
Então o sistema deve atualizar a parcela da competência atual  
E deve renumerar as parcelas futuras do mesmo `parcelaGrupo`  
E deve preservar o vínculo do parcelamento  
E deve solicitar confirmação antes de alterar lançamentos já gravados.

---

## CA — Divergência de parcela na importação de cartão

### Cenário 1 — Divergência listada sem alteração automática

Dado que existe no sistema a parcela 03/10 em determinada competência  
E o arquivo importado informa a parcela 02/10 para o mesmo parcelamento e competência  
Quando a prévia da importação é montada  
Então o sistema deve listar a divergência no painel de divergências  
E não deve alterar nenhum lançamento automaticamente  
E não deve importar a linha divergente automaticamente.

### Cenário 2 — Manter como está

Dado que existe uma divergência listada  
Quando o usuário escolhe manter como está  
Então nenhum lançamento deve ser alterado  
E a linha divergente deve continuar fora da importação.

### Cenário 3 — Alterar somente parcela atual

Dado que existe uma divergência em determinada competência  
Quando o usuário escolhe alterar somente a parcela atual  
Então apenas o lançamento daquela competência deve ser atualizado  
E as parcelas futuras do mesmo grupo devem permanecer sem alteração.

### Cenário 4 — Alterar atual e futuras

Dado que existe uma divergência em determinada competência  
Quando o usuário escolhe alterar a parcela atual e as futuras  
Então o lançamento da competência atual deve ser atualizado  
E as parcelas posteriores do mesmo grupo devem ser renumeradas  
E nenhuma nova parcela final deve ser criada automaticamente.

### Cenário 5 — Preservar cenários aprovados

Dado que os testes de primeira carga, reimportação, fatura subsequente sem divergência e tolerância de valor foram aprovados  
Quando a v0.3.26.6 for validada  
Então esses comportamentos devem permanecer funcionando.
