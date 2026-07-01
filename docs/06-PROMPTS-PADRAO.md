# Prompts Padrão — Finanças PRO

Use estes prompts para orientar melhor as conversas dentro do projeto.

## 1. Analisar versão atual

```txt
Atue como Arquiteto React Sênior e Engenheiro de Requisitos.

Analise a versão atual do aplicativo Finanças PRO em React + Vite com LocalStorage.

Objetivo:
Identificar riscos, inconsistências, oportunidades de modularização e pontos de melhoria sem alterar o código ainda.

Avalie:
1. Estrutura geral.
2. Uso de estado React.
3. Persistência em LocalStorage.
4. Regras de negócio financeiras.
5. Cálculos de saldo.
6. Cartões e faturas.
7. Contas e saldos mensais.
8. Lançamentos previstos e baixas.
9. Importação e backup.
10. Componentes que podem ser extraídos com baixo risco.

Responda com:
1. Diagnóstico geral.
2. Problemas encontrados.
3. Riscos.
4. Sugestão de fases.
5. Primeira etapa recomendada.
6. Arquivos que seriam afetados.
Não altere código ainda.
```

## 2. Refatorar de forma incremental

```txt
Atue como Arquiteto React Sênior.

Refatore a aplicação Finanças PRO de forma incremental e segura.

Regras obrigatórias:
1. Não reescreva tudo.
2. Não altere regras de negócio sem explicar.
3. Não altere LocalStorage sem migração.
4. Não remova funcionalidades.
5. Cada etapa deve manter a aplicação funcionando.
6. Forneça código completo dos arquivos afetados.

Objetivo desta etapa:
[DESCREVER A ETAPA, EX: extrair constantes de LocalStorage para constants/storageKeys.js]

Responda com:
1. Objetivo.
2. Arquivos criados.
3. Arquivos alterados.
4. Impactos.
5. Código completo.
6. Checklist de teste.
```

## 3. Validar inconsistências após alteração

```txt
Atue como Revisor Técnico React e QA funcional.

Valide a versão atualizada do Finanças PRO após os ajustes realizados.

Verifique:
1. Erros de sintaxe.
2. Imports quebrados.
3. Inconsistências de estado.
4. Incompatibilidade com LocalStorage.
5. Regras financeiras quebradas.
6. Cálculos de saldo.
7. Cartões, faturas, ajustes e pagamentos.
8. Lançamentos previstos e baixas.
9. Backup e restauração.
10. Possíveis regressões.

Responda com:
1. Lista de inconsistências encontradas.
2. Gravidade de cada ponto.
3. Correção proposta.
4. Arquivos impactados.
5. Checklist de reteste.
```

## 4. Corrigir inconsistências

```txt
Corrija as inconsistências apontadas na análise anterior.

Regras:
1. Corrija apenas os pontos listados.
2. Não mude regra de negócio sem explicar.
3. Não altere LocalStorage sem migração.
4. Mantenha a aplicação funcionando.
5. Forneça código completo dos arquivos alterados.

Inclua:
1. Resumo das correções.
2. Arquivos alterados.
3. Código completo.
4. Checklist de validação.
```

## 5. Criar funcionalidade de cartão vinculado à conta

```txt
Implemente a vinculação obrigatória de cada cartão de crédito a uma conta específica no cadastro do cartão.

Regras:
1. Todo cartão deve possuir `accountId`.
2. A conta associada será usada no pagamento da fatura.
3. Despesas individuais do cartão não precisam ter conta corrente.
4. Dados antigos devem ser migrados ou tratados com valor padrão seguro.
5. Não quebrar cartões já cadastrados.

Entregue:
1. Modelo de dados atualizado.
2. Migração, se necessária.
3. Ajustes no formulário de cartão.
4. Ajustes no cálculo/fechamento da fatura.
5. Código completo dos arquivos alterados.
6. Checklist de teste.
```

## 6. Criar ajuste manual de fatura

```txt
Implemente transação de ajuste no cartão de crédito para permitir correção manual do valor da fatura.

Regras:
1. O ajuste deve ser vinculado a cartão e mês/fatura.
2. O ajuste pode ser positivo ou negativo.
3. O ajuste deve impactar o total da fatura.
4. O ajuste deve ter descrição obrigatória.
5. O ajuste não deve ser tratado como despesa comum.
6. O ajuste deve ser rastreável.

Entregue:
1. Modelo de dados.
2. Formulário ou ação de ajuste.
3. Atualização do cálculo da fatura.
4. Exibição do ajuste na fatura.
5. Código completo.
6. Testes manuais.
```

## 7. Criar fechamento e pagamento de fatura

```txt
Implemente ou revise a regra de fechamento de fatura do cartão.

Regras:
1. A fatura deve consolidar despesas e ajustes.
2. Ao fechar a fatura, gerar lançamento previsto de pagamento.
3. O lançamento previsto deve debitar a conta associada ao cartão.
4. O pagamento deve ocorrer no mês subsequente.
5. A baixa do pagamento pode ser total ou parcial.
6. Pagamento parcial deve manter saldo pendente.
7. Não duplicar despesas do cartão na conta corrente.

Entregue:
1. Regra de negócio detalhada.
2. Modelo de dados.
3. Funções de cálculo.
4. Alterações na UI.
5. Código completo.
6. Checklist de teste.
```

## 8. Criar lançamentos recorrentes previstos

```txt
Implemente ou revise lançamentos recorrentes previstos para receitas, despesas e pagamento de fatura.

Regras:
1. Receita repetitiva gera lançamento previsto.
2. Despesa repetitiva gera lançamento previsto.
3. Pagamento de fatura gera lançamento previsto.
4. Usuário pode dar baixa total ou parcial.
5. Sistema deve evitar duplicidade no mesmo mês.
6. Status deve diferenciar previsto, parcial e pago.

Entregue:
1. Modelo de recorrência.
2. Geração mensal.
3. Baixa total/parcial.
4. Tratamento de duplicidade.
5. Código completo.
6. Testes manuais.
```

## 9. Preparar projeto para rodar local

```txt
Tenho apenas o arquivo principal JSX do aplicativo Finanças PRO.

Crie a estrutura completa de projeto React + Vite para rodar localmente.

Entregue:
1. Estrutura de pastas.
2. package.json.
3. index.html.
4. src/main.jsx.
5. src/App.jsx.
6. Instruções para rodar via CMD e VS Code.
7. Scripts npm install, npm run dev, npm run build e npm run preview.
```

## 10. Gerar pacote zip local

```txt
Gere um arquivo ZIP completo do projeto Finanças PRO para rodar localmente.

Regras:
1. O ZIP deve conter a estrutura completa.
2. Deve ser possível descompactar e rodar com npm install e npm run dev.
3. Não deixe arquivos faltando.
4. Inclua README com instruções.
5. Inclua checklist de validação local.
```

## 11. Implementar competência de fatura no cartão

```txt
Implemente ou revise a regra de competência da fatura em lançamentos de cartão de crédito.

Regras:
1. O usuário pode informar manualmente a competência da fatura.
2. O campo é opcional.
3. Se informado, prevalece sobre cálculo automático.
4. Em compras parceladas, a competência informada representa a primeira parcela.
5. Parcelas futuras devem avançar mês a mês.
6. Se não informado, calcular conforme data da compra e dia de fechamento do cartão.
7. Se a fatura calculada já estiver fechada manualmente, direcionar para a próxima fatura aberta.
8. Não alterar dados antigos sem migração.

Entregue:
1. Regra de negócio detalhada.
2. Impacto em LocalStorage.
3. Código completo do arquivo alterado.
4. Checklist de testes.
```

## 12. Revisar importação bancária

```txt
Revise a importação bancária do Finanças PRO.

Objetivos:
1. Ignorar BB Rende Fácil e Rende Fácil.
2. Gerar relatório de importação.
3. Listar duplicados e ignorados.
4. Criar identificador de lote importado.
5. Permitir desfazer lote.
6. Preservar lançamentos manuais.

Entregue:
1. Regras aplicadas.
2. Impactos em LocalStorage.
3. Código completo.
4. Checklist de validação.
```

## 13. Criar regras editáveis de autocategorização

```txt
Implemente regras editáveis de autocategorização.

Regras:
1. O usuário pode cadastrar palavras-chave.
2. Cada regra deve apontar para tipo financeiro e categoria.
3. Regras personalizadas têm prioridade sobre histórico e regras padrão.
4. Deve ser possível remover regras.
5. Dados antigos sem regras devem continuar funcionando.

Entregue:
1. Modelo de dados.
2. Interface.
3. Ordem de prioridade da categorização.
4. Código completo.
5. Checklist de testes.
```

## 14. Corrigir simulações de cartão

```txt
Revise as simulações de compra no cartão.

Regras:
1. Exibir impacto em todas as parcelas informadas.
2. Calcular competência conforme fechamento da fatura.
3. Mostrar total real do mês competência.
4. Mostrar impacto simulado.
5. Mostrar total projetado.
6. Persistir simulações.
7. Permitir refazer com situação atualizada.
8. Permitir exclusão manual.

Entregue:
1. Causa provável da inconsistência.
2. Correção aplicada.
3. Impacto em LocalStorage.
4. Código completo.
5. Checklist de testes.
```


## 15. Validar backup/restauração revisado

```txt
Atue como Revisor Técnico React e QA funcional.

Valide a versão `App_backup_restauracao_revisado.jsx` do Finanças PRO.

Objetivo:
Confirmar que a revisão de backup/restauração preserva dados existentes, simulações e metadados de importação, sem alterar regras financeiras.

Verifique:
1. Se a aplicação executa com `npm run dev`.
2. Se a aplicação compila com `npm run build`.
3. Se o backup exportado contém simulações.
4. Se o backup exportado preserva `importBatchId`, `importSource` e `importedAt` nos lançamentos importados.
5. Se `params.autoCategoryRules` é preservado ou inicializado como lista vazia.
6. Se backup antigo sem simulações continua restaurando.
7. Se backup inválido não apaga os dados atuais.
8. Se não houve regressão em Dashboard, Lançamentos, Contas, Cartões, Pessoas, Simulações, Importação e Parâmetros.

Responda com:
1. Resultado geral.
2. Itens aprovados.
3. Itens reprovados.
4. Evidências observadas.
5. Riscos remanescentes.
6. Próxima recomendação.
```
