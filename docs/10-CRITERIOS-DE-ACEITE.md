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
