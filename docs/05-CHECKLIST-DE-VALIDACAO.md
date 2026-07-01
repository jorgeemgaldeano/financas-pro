# Checklist de Validação — Finanças PRO

Use este checklist sempre que uma alteração for feita no aplicativo.

## 1. Validação básica de execução

- [ ] O projeto instala dependências com `npm install`.
- [ ] O projeto executa com `npm run dev`.
- [ ] O projeto compila com `npm run build`.
- [ ] A tela inicial carrega sem erro.
- [ ] O console do navegador não apresenta erro crítico.
- [ ] A aplicação continua funcionando após atualizar a página.

## 2. Validação de LocalStorage

- [ ] Dados antigos continuam carregando.
- [ ] Dados novos são salvos corretamente.
- [ ] Não houve perda de dados após recarregar.
- [ ] Chaves antigas continuam compatíveis ou foram migradas.
- [ ] Campos novos possuem valores padrão.
- [ ] Backup exportado contém os dados esperados.
- [ ] Backup importado restaura os dados corretamente.
- [ ] Importação inválida não apaga dados atuais.

## 3. Validação de navegação

- [ ] Dashboard abre.
- [ ] Lançamentos abre.
- [ ] Contas abre.
- [ ] Cartões abre.
- [ ] Metas abre, se aplicável.
- [ ] Pessoas abre, se aplicável.
- [ ] Projeções abre.
- [ ] Simulações abre.
- [ ] Importação abre.
- [ ] Parâmetros abre.

## 4. Validação de lançamentos

- [ ] Cadastrar receita.
- [ ] Editar receita.
- [ ] Excluir ou cancelar receita.
- [ ] Cadastrar despesa em conta.
- [ ] Editar despesa em conta.
- [ ] Cadastrar despesa em cartão.
- [ ] Despesa em cartão entra na fatura correta.
- [ ] Lançamento previsto é exibido corretamente.
- [ ] Baixa total altera status para pago/recebido.
- [ ] Baixa parcial altera status para parcial.
- [ ] Saldo pendente é recalculado.

## 5. Validação de contas

- [ ] Criar conta.
- [ ] Editar conta.
- [ ] Inativar conta, se aplicável.
- [ ] Informar saldo inicial mensal.
- [ ] Verificar saldo do mês.
- [ ] Verificar saldo após receita.
- [ ] Verificar saldo após despesa.
- [ ] Verificar saldo após pagamento de fatura.
- [ ] Verificar se cartão associado usa a conta correta.

## 6. Validação de cartões

- [ ] Criar cartão com conta associada obrigatória.
- [ ] Editar cartão.
- [ ] Verificar dia de fechamento.
- [ ] Verificar dia de vencimento.
- [ ] Cadastrar despesa no cartão.
- [ ] Cadastrar compra parcelada.
- [ ] Verificar parcelas nas faturas corretas.
- [ ] Criar ajuste positivo.
- [ ] Criar ajuste negativo.
- [ ] Verificar total da fatura com ajustes.
- [ ] Fechar fatura.
- [ ] Gerar pagamento previsto na conta associada.
- [ ] Baixar pagamento total.
- [ ] Baixar pagamento parcial.
- [ ] Conferir saldo pendente da fatura.

## 7. Validação de fatura

- [ ] Fatura aberta soma despesas do período.
- [ ] Ajustes impactam total final.
- [ ] Fatura fechada gera lançamento previsto.
- [ ] Lançamento previsto cai no mês subsequente.
- [ ] Lançamento previsto usa conta vinculada ao cartão.
- [ ] Pagamento não duplica despesas.
- [ ] Pagamento parcial mantém pendência.
- [ ] Pagamento total quita a fatura.

## 8. Validação de recorrências

- [ ] Criar receita repetitiva.
- [ ] Criar despesa repetitiva.
- [ ] Gerar lançamentos previstos.
- [ ] Não duplicar recorrência no mesmo mês.
- [ ] Baixar uma recorrência sem afetar indevidamente outras.
- [ ] Cancelar recorrência futura, se aplicável.

## 9. Validação de projeções

- [ ] Projeção considera receitas previstas.
- [ ] Projeção considera despesas previstas.
- [ ] Projeção considera faturas previstas.
- [ ] Projeção considera saldo inicial mensal.
- [ ] Projeção diferencia previsto e realizado.
- [ ] Alteração em lançamento reflete na projeção.

## 10. Validação de importação

- [ ] Importar CSV válido.
- [ ] Importar OFX válido.
- [ ] Importar QFX válido.
- [ ] Rejeitar arquivo inválido.
- [ ] Exibir prévia antes de salvar.
- [ ] Evitar duplicidade quando possível.
- [ ] Permitir classificar lançamentos importados.
- [ ] Importar extrato de cartão para o cartão selecionado.

## 11. Validação visual mínima

- [ ] Layout não quebrou em tela desktop.
- [ ] Botões principais continuam visíveis.
- [ ] Tabelas continuam legíveis.
- [ ] Modais continuam abrindo e fechando.
- [ ] Campos obrigatórios estão identificáveis.
- [ ] Mensagens de erro são claras.

## 12. Validação de regressão

Antes de considerar a alteração concluída, testar pelo menos:

- [ ] Criar conta.
- [ ] Criar cartão vinculado à conta.
- [ ] Criar despesa no cartão.
- [ ] Fechar fatura.
- [ ] Verificar geração de pagamento previsto.
- [ ] Baixar parcialmente pagamento da fatura.
- [ ] Baixar valor restante.
- [ ] Confirmar fatura paga.
- [ ] Confirmar débito na conta.
- [ ] Exportar backup.
- [ ] Recarregar página.
- [ ] Confirmar dados preservados.

## 13. Validação de melhorias recentes

### Importação bancária

- [ ] Importar extrato com transação "BB Rende Fácil".
- [ ] Confirmar que a transação foi ignorada.
- [ ] Confirmar que o item ignorado aparece no relatório de importação.
- [ ] Importar arquivo com duplicidade.
- [ ] Confirmar que duplicados são listados antes de salvar.
- [ ] Confirmar que cada lote recebe `importBatchId`.
- [ ] Desfazer lote importado.
- [ ] Confirmar que apenas lançamentos daquele lote foram removidos.
- [ ] Confirmar que lançamentos manuais permanecem.

### Autocategorização

- [ ] Acessar Parâmetros > Autocategorização.
- [ ] Confirmar que existem campos e botões de ação.
- [ ] Criar regra personalizada.
- [ ] Importar lançamento com palavra-chave correspondente.
- [ ] Confirmar que a categoria sugerida respeita a regra personalizada.
- [ ] Remover regra personalizada.
- [ ] Confirmar que a categorização volta a usar histórico ou regra padrão.

### Cartão e competência de fatura

- [ ] Criar despesa de cartão sem informar competência antes do fechamento.
- [ ] Confirmar entrada na fatura do próprio mês.
- [ ] Criar despesa de cartão sem informar competência após o fechamento.
- [ ] Confirmar entrada na fatura do mês seguinte.
- [ ] Criar despesa informando competência manual.
- [ ] Confirmar que a competência manual prevalece.
- [ ] Criar compra parcelada informando competência da primeira parcela.
- [ ] Confirmar que parcelas futuras avançam mês a mês.
- [ ] Fechar fatura manualmente.
- [ ] Criar lançamento que cairia na fatura fechada.
- [ ] Confirmar direcionamento para próxima fatura aberta.

### Exportação TXT de cartão

- [ ] Selecionar cartão e competência.
- [ ] Exportar despesas em TXT.
- [ ] Conferir cabeçalho, data, descrição, categoria, parcela e valor.
- [ ] Confirmar que a exportação não altera dados.

### Pessoas

- [ ] Acessar aba Pessoas.
- [ ] Conferir detalhamento acumulado por mês.
- [ ] Confirmar valores a receber, a pagar, pendente e saldo líquido.
- [ ] Expandir mês para gestão dos lançamentos.
- [ ] Marcar item como recebido/pago.
- [ ] Confirmar atualização dos totais.

### Simulações

- [ ] Criar simulação em cartão antes do fechamento.
- [ ] Confirmar competência impactada correta.
- [ ] Criar simulação em cartão após o fechamento.
- [ ] Confirmar competência seguinte.
- [ ] Criar simulação parcelada.
- [ ] Confirmar exibição de todas as parcelas informadas.
- [ ] Confirmar total real do mês competência.
- [ ] Confirmar impacto simulado e total projetado.
- [ ] Atualizar a página.
- [ ] Confirmar que simulações persistem.
- [ ] Refazer simulação.
- [ ] Confirmar recálculo com situação atualizada.
- [ ] Excluir simulação manualmente.


## 14. Validação da revisão de backup/restauração

### Execução técnica

- [ ] Substituir `src/App.jsx` pela versão `App_backup_restauracao_revisado.jsx`.
- [ ] Executar `npm install`, se necessário.
- [ ] Executar `npm run dev`.
- [ ] Executar `npm run build`.
- [ ] Executar `npm run preview`.
- [ ] Confirmar que a aplicação abre sem tela branca.
- [ ] Confirmar que o console do navegador não apresenta erro crítico.

### Exportação de backup

- [ ] Criar dados básicos: conta, cartão, lançamento e pessoa.
- [ ] Criar pelo menos uma simulação.
- [ ] Realizar pelo menos uma importação que gere `importBatchId`.
- [ ] Exportar backup.
- [ ] Confirmar que o JSON possui metadados do backup.
- [ ] Confirmar que o JSON possui `data.simulacoes`.
- [ ] Confirmar que o JSON possui `rawLocalStorage`.
- [ ] Confirmar que lançamentos importados mantêm `importBatchId`, `importSource` e `importedAt`, quando existentes.

### Restauração de backup

- [ ] Restaurar backup válido recém-exportado.
- [ ] Confirmar que contas foram restauradas.
- [ ] Confirmar que cartões foram restaurados.
- [ ] Confirmar que lançamentos foram restaurados.
- [ ] Confirmar que pessoas foram restauradas.
- [ ] Confirmar que simulações foram restauradas.
- [ ] Confirmar que regras de autocategorização foram restauradas ou inicializadas como lista vazia.
- [ ] Atualizar a página e confirmar que os dados continuam carregando.

### Proteção contra arquivo inválido

- [ ] Tentar restaurar arquivo JSON inválido.
- [ ] Confirmar que o sistema exibe erro.
- [ ] Confirmar que os dados atuais não foram apagados.
- [ ] Tentar restaurar JSON válido, mas incompatível.
- [ ] Confirmar que os dados atuais não foram apagados.

## 15. Validação de reutilização e bibliotecas

### Antes de desenvolver

- [ ] Verificar se já existe componente semelhante em outra tela.
- [ ] Verificar se já existe função utilitária semelhante.
- [ ] Verificar se já existe service ou regra de negócio equivalente.
- [ ] Verificar se React nativo resolve a necessidade.
- [ ] Avaliar biblioteca compatível apenas quando houver ganho claro.
- [ ] Justificar qualquer nova dependência.
- [ ] Confirmar que a alteração não mistura refatoração técnica com mudança funcional.

### Durante a implementação

- [ ] Não duplicar cálculo financeiro já existente.
- [ ] Não criar novo padrão visual se houver componente reutilizável.
- [ ] Não criar parser próprio complexo sem avaliar alternativa consolidada.
- [ ] Não adicionar biblioteca para caso simples resolvido por React nativo.
- [ ] Manter LocalStorage compatível.
- [ ] Manter backup/restauração compatíveis.

### Após a implementação

- [ ] Executar testes de regressão das telas afetadas.
- [ ] Verificar se imports novos estão corretos.
- [ ] Verificar se dependências foram adicionadas ao `package.json`, quando aplicável.
- [ ] Executar `npm install` quando houver nova dependência.
- [ ] Executar `npm run dev`.
- [ ] Executar `npm run build`.
- [ ] Confirmar ausência de erro crítico no console.
- [ ] Atualizar `08-REGISTRO-DE-DECISOES.md` quando a biblioteca virar padrão do projeto.


## 16. Validação da versão 0.3.2

### Identificação visual

- [ ] Confirmar exibição de `v0.3.2` na interface.

### Filtros em Lançamentos

- [ ] Filtrar por data inicial.
- [ ] Filtrar por data final.
- [ ] Filtrar por intervalo entre data inicial e data final.
- [ ] Filtrar por categoria principal.
- [ ] Filtrar por origem.
- [ ] Filtrar por tipo.
- [ ] Filtrar por status.
- [ ] Limpar filtros e confirmar retorno da lista padrão.

### Recategorização protegida

- [ ] Em **Lançamentos**, acionar **Editar**, alterar categoria e confirmar em **OK**.
- [ ] Confirmar que a categoria não muda sem acionar **Editar**.
- [ ] Em **Contas**, recategorizar lançamento e confirmar reflexo na aba **Lançamentos**.
- [ ] Em **Cartões**, recategorizar lançamento e confirmar reflexo na aba **Lançamentos**.
- [ ] Recarregar a aplicação e confirmar persistência das categorias alteradas.

### Despesas compartilhadas

- [ ] Confirmar ordenação crescente por mês de referência.
- [ ] Confirmar competência exibida no formato `mm/aaaa`.
- [ ] Baixar todas as pendências de um mês.
- [ ] Confirmar que o mês sai do controle ativo.
- [ ] Abrir **Ver Histórico** e confirmar exibição dos registros baixados.
- [ ] Recarregar a aplicação e confirmar manutenção do histórico.

### Backup e metas

- [ ] Criar ou ajustar limites/metas por categoria.
- [ ] Exportar backup.
- [ ] Restaurar o backup.
- [ ] Confirmar que os limites/metas por categoria foram recuperados.
- [ ] Recarregar a aplicação e confirmar persistência das metas restauradas.


## 15. Validação de importação de vales Pluxee

- [ ] Instalar dependência `pdfjs-dist`.
- [ ] Executar `npm run dev`.
- [ ] Acessar aba **Importar**.
- [ ] Selecionar tipo **Extrato de vale**.
- [ ] Informar o ano do extrato.
- [ ] Selecionar conta de vale destino.
- [ ] Importar PDF Pluxee válido.
- [ ] Confirmar que cargas aparecem como receitas.
- [ ] Confirmar que compras aparecem como despesas.
- [ ] Confirmar que a data usa o ano informado.
- [ ] Revisar categorias sugeridas pela autocategorização.
- [ ] Desmarcar um item e confirmar que ele não é salvo.
- [ ] Confirmar importação.
- [ ] Verificar lançamentos na conta de vale.
- [ ] Reimportar o mesmo arquivo e confirmar duplicidades.
- [ ] Desfazer o lote e confirmar que somente itens importados são removidos.
- [ ] Executar `npm run build`.
- [ ] Executar `npm run preview`.


## 15. Validação UX — campo de parcelas

- [ ] Abrir novo lançamento parcelado de cartão.
- [ ] Confirmar que o campo Parcelas inicia vazio.
- [ ] Digitar um número, apagar tudo e confirmar que o campo fica vazio.
- [ ] Tentar salvar com parcelamento ativo e parcelas vazio.
- [ ] Confirmar exibição do modal `Para prosseguir, preencha o campo Número de parcelas`.
- [ ] Informar parcelas válidas e salvar.
- [ ] Confirmar geração correta das parcelas.
- [ ] Repetir o teste em despesas compartilhadas parceladas.
- [ ] Repetir o teste em simulações.



## 15. Validação da importação de vales Pluxee — v0.3.5

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
- [ ] Confirmar após correção que `DISPONIBILIZACAO DE VALOR` entra como receita/crédito.
- [ ] Confirmar após correção que todos os demais movimentos entram como despesa/débito.
- [ ] Executar `npm run dev`.
- [ ] Executar `npm run build`.
- [ ] Executar `npm run preview`.


## 15. Resultado de validação local — v0.3.5 — 2026-06-29

### Execução local

- [x] `npm install` executado com sucesso.
- [x] `npm run dev` executado com sucesso.
- [x] `npm run build` executado com sucesso.
- [x] `npm run build` apresentou alerta não bloqueante de chunk acima de 500 kB após minificação.
- [x] `npm run preview` executado com sucesso.

### Observação técnica

O alerta de chunk acima de 500 kB não representa erro de compilação e não bloqueia a versão v0.3.5. O tratamento recomendado é modularização incremental e possível code splitting em etapa futura, sem alteração imediata de regra de negócio ou LocalStorage.

### Validação funcional ainda recomendada

- [ ] Confirmar que `DISPONIBILIZACAO DE VALOR` entra como receita/crédito na importação Pluxee.
- [ ] Confirmar que todos os demais movimentos Pluxee entram como despesa/débito.
- [ ] Reexecutar backup/restauração após importação de vale.
- [ ] Confirmar que desfazer lote remove somente lançamentos do lote importado.


## Registro de validação — 2026-06-29 — Passo 3 concluído

Conforme informado pelo usuário, os testes do passo 3 foram validados.

Itens considerados validados nesta etapa:

- [x] Filtros da aba **Lançamentos**.
- [x] Recategorização protegida nas abas **Lançamentos**, **Contas** e **Cartões**.
- [x] Backup/restauração com metas por categoria.
- [x] Histórico de despesas compartilhadas.

## Checklist específico — v0.3.6 — Refatoração RequiredFieldModal

- [ ] Executar `npm run dev`.
- [ ] Executar `npm run build`.
- [ ] Executar `npm run preview`.
- [ ] Confirmar exibição da versão `v0.3.6`.
- [ ] Tentar gravar lançamento sem campo obrigatório e confirmar modal.
- [ ] Tentar gravar despesa compartilhada sem campo obrigatório e confirmar modal.
- [ ] Confirmar destaque visual no campo obrigatório não preenchido.
- [ ] Confirmar ausência de erro crítico no console.
- [ ] Confirmar que dados antigos continuam carregando.
- [ ] Confirmar que não houve alteração no backup/restauração.


## 15. Validação v0.3.7 — Campos de data em padrão brasileiro

- [ ] Executar `npm run dev`.
- [ ] Executar `npm run build`.
- [ ] Executar `npm run preview`.
- [ ] Confirmar versão visual `v0.3.7`.
- [ ] Cadastrar lançamento comum usando data no padrão `dd/mm/aaaa`.
- [ ] Cadastrar compra parcelada usando data da primeira parcela no padrão `dd/mm/aaaa`.
- [ ] Criar simulação usando data no padrão `dd/mm/aaaa`.
- [ ] Usar filtros de data inicial e data final na aba Lançamentos.
- [ ] Cadastrar dívida em Pessoas com data de início no padrão `dd/mm/aaaa`.
- [ ] Registrar amortização/pagamento com data no padrão `dd/mm/aaaa`.
- [ ] Cadastrar despesa compartilhada com data no padrão `dd/mm/aaaa`.
- [ ] Recarregar a aplicação e confirmar que as datas permanecem corretas.
- [ ] Exportar backup e confirmar que as datas continuam no formato interno `YYYY-MM-DD`.
- [ ] Restaurar backup e confirmar exibição correta como `dd/mm/aaaa`.
- [ ] Confirmar que data inválida não é gravada indevidamente.
