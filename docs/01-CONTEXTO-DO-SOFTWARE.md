# Contexto do Software — Finanças PRO

## Visão geral

O **Finanças PRO** é um aplicativo de controle financeiro pessoal desenvolvido em **React + Vite**, com dados persistidos localmente no navegador por meio de **LocalStorage**.

O sistema tem como objetivo permitir o controle de receitas, despesas, contas, cartões, metas, projeções, simulações, importações de extrato e acompanhamento financeiro mensal.

## Premissas atuais

- A aplicação roda localmente no navegador.
- Os dados são armazenados em LocalStorage.
- Não há backend neste momento.
- A aplicação deve poder ser executada localmente via Vite.
- O projeto pode futuramente ser publicado no Vercel para teste.
- A evolução deve preservar dados já salvos pelo usuário.
- A aplicação atual pode estar concentrada em um grande `App.jsx`.

## Funcionalidades existentes ou previstas

### Dashboard

O dashboard deve apresentar visão consolidada do mês, incluindo:

- Receitas.
- Despesas.
- Saldo.
- Despesas por categoria.
- Despesas por conta.
- Despesas por cartão.
- Indicadores de evolução.
- Alertas relevantes.

### Lançamentos

A tela de lançamentos deve permitir cadastro, edição, exclusão e baixa de receitas e despesas.

Tipos esperados:

- Receita.
- Despesa.
- Despesa em conta corrente.
- Despesa em cartão.
- Transferência.
- Ajuste.
- Pagamento de fatura.
- Lançamento previsto.
- Lançamento parcial.
- Lançamento quitado.

### Contas

O sistema deve permitir controlar contas correntes, contas digitais ou carteiras.

Cada conta pode conter:

- Nome.
- Tipo.
- Saldo inicial mensal.
- Lançamentos vinculados.
- Saldo previsto.
- Saldo realizado.
- Histórico de movimentações.

### Cartões

O sistema deve permitir cadastro e controle de cartões de crédito.

Cada cartão deve conter:

- Nome.
- Banco/instituição.
- Limite, quando aplicável.
- Dia de fechamento.
- Dia de vencimento.
- Conta corrente associada.
- Faturas por mês.
- Despesas vinculadas.
- Ajustes de fatura.
- Pagamentos previstos.
- Baixas totais ou parciais.

### Categorias

As categorias devem permitir classificação de receitas e despesas.

O modelo deve suportar:

- Categoria principal.
- Subcategoria.
- Tipo financeiro.
- Status ativa/inativa.
- Uso em relatórios e filtros.

### Pessoas

A aplicação pode controlar pessoas relacionadas a:

- Despesas compartilhadas.
- Dívidas de terceiros.
- Valores a receber.
- Valores a pagar.
- Rateios.

### Importação

A aplicação pode importar arquivos financeiros, respeitando validações antes de persistir dados.

Formatos esperados:

- CSV.
- OFX.
- QFX.
- TXT.

Possíveis origens:

- Cartão de crédito.
- Conta corrente.
- Outros extratos bancários.

### Backup e restauração

O sistema deve permitir:

- Exportar backup JSON.
- Importar backup JSON.
- Restaurar dados.
- Confirmar substituição dos dados atuais.
- Validar versão do backup.
- Preservar compatibilidade sempre que possível.

## Cuidados principais

O sistema lida com dados financeiros pessoais. Mesmo sendo local, deve priorizar:

- Clareza.
- Consistência.
- Confiabilidade.
- Evitar perda de dados.
- Evitar duplicidade de lançamentos.
- Evitar cálculos divergentes.
- Evitar baixa indevida.
- Evitar mistura entre previsto e realizado.

## Conceitos centrais

### Mês de competência

O mês de competência é a referência principal para apuração de receitas, despesas, faturas e saldos.

### Saldo inicial mensal

Cada conta deve poder possuir saldo inicial por mês.

Ao iniciar um novo mês, o saldo inicial deve refletir a lógica definida pelo sistema:

- Pode ser informado manualmente.
- Pode ser carregado a partir do saldo final do mês anterior.
- Deve haver regra clara para evitar inconsistência.

### Lançamento previsto

É um lançamento planejado, ainda não efetivado.

Exemplos:

- Salário futuro.
- Aluguel.
- Conta recorrente.
- Parcela.
- Pagamento da fatura do cartão.

### Baixa

É a confirmação de que um lançamento previsto foi pago ou recebido.

A baixa pode ser:

- Total.
- Parcial.

### Fatura

É a consolidação das despesas e ajustes de um cartão em determinado mês.

A fatura pode possuir:

- Valor previsto.
- Valor ajustado.
- Valor fechado.
- Valor pago.
- Valor pendente.
- Status.

## Estados sugeridos

### Estado de lançamento

- `previsto`
- `parcial`
- `pago`
- `cancelado`

### Estado de fatura

- `aberta`
- `fechada`
- `parcialmente_paga`
- `paga`
- `cancelada`

### Tipo de lançamento

- `receita`
- `despesa`
- `transferencia`
- `ajuste_cartao`
- `pagamento_fatura`
- `saldo_inicial`

## Diretriz de evolução

Toda nova funcionalidade deve ser documentada antes ou junto com o código, preferencialmente atualizando:

- Regras de negócio.
- Modelo de dados.
- Checklist de testes.
- Roteiro de validação.
- Registro de decisão técnica.

## Atualização 2026-06-27 — Evoluções recentes implementadas

Durante a evolução da versão mais recente do `App.jsx`, foram incorporadas novas capacidades relevantes ao Finanças PRO:

### Importação bancária

- A importação de extratos bancários passou a desprezar automaticamente transações identificadas como **BB Rende Fácil** ou **Rende Fácil**, por se tratarem de movimentações automáticas entre conta corrente e poupança associada.
- A importação passou a gerar relatório de resultado, informando lançamentos importados, duplicados e ignorados por regra.
- Cada lote importado passou a receber um identificador para permitir desfazer a importação posteriormente.

### Autocategorização

- O sistema passou a permitir regras editáveis de autocategorização.
- As regras personalizadas possuem prioridade sobre histórico, regras automáticas padrão e fallback para "Outros".
- A categorização automática foi aprimorada para considerar normalização de texto, palavras-chave ampliadas e histórico de classificações anteriores.

### Cartão de crédito

- O lançamento de cartão de crédito passou a permitir informar manualmente a **competência da fatura**.
- Quando houver parcelamento, a competência informada será considerada como a competência da primeira parcela.
- Quando o usuário não informar competência, o sistema calculará a fatura impactada com base na data da compra, no dia de fechamento do cartão e na situação da fatura manualmente fechada.
- Despesas de cartão podem ser exportadas em formato TXT por competência.

### Pessoas e despesas compartilhadas

- A aba Pessoas passou a exibir detalhamento mensal acumulado por pessoa para despesas compartilhadas.
- A visão mensal permite acompanhar valores a receber, a pagar, pendências e saldo líquido por pessoa.

### Simulações

- As simulações passaram a ser persistidas.
- A simulação deve exibir impacto em todas as parcelas informadas pelo usuário.
- A simulação deve considerar a competência da fatura do cartão afetada, respeitando a data de fechamento.
- As simulações devem ser excluídas apenas manualmente pelo usuário ou em rotina explícita de limpeza dos dados do sistema.
- Deve existir opção para refazer a simulação com base na situação financeira atualizada.

### Contas

- A aba Contas passou a possuir botão **Nova Conta**.
- A manutenção de contas em Parâmetros deve ser preservada.


## Atualização 2026-06-27 — Revisão de backup/restauração

Foi gerada a versão `App_backup_restauracao_revisado.jsx`, derivada da versão validada enviada pelo usuário.

A revisão teve como objetivo proteger melhor os dados persistidos localmente, especialmente após a entrada de novas estruturas como simulações, regras de autocategorização e metadados de importação.

### Pontos reforçados

- Backup passa a considerar simulações persistidas.
- Backup passa a preservar melhor metadados de importação presentes nos lançamentos.
- Restauração passa a validar estrutura antes de sobrescrever dados locais.
- Backups antigos com ausência de simulações devem continuar funcionando.
- A solução foi mantida no `App.jsx`, sem extração modular nesta etapa.

### Próxima validação obrigatória

Antes de novas funcionalidades, a versão revisada deve ser executada localmente com:

```bash
npm run dev
npm run build
npm run preview
```

Também deve ser realizado teste manual de exportação e restauração de backup com simulações e lote importado.
