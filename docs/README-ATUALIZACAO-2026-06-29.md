# Pacote de atualização documental — Finanças PRO — 2026-06-29

Este pacote consolida o encerramento da rodada com a versão `0.3.2`.

## Arquivo de código mais recente

- `App.jsx` — cópia da versão `App_ajustes_v0_3_2.jsx` para uso direto em `src/App.jsx`.
- `App_ajustes_v0_3_2.jsx` — cópia versionada da mesma entrega.

## Arquivos Markdown atualizados

- `00-ENCERRAMENTO-RODADA-2026-06-27.md`
- `01-CONTEXTO-DO-SOFTWARE.md`
- `02-REGRAS-DE-NEGOCIO.md`
- `03-ARQUITETURA-E-MODULARIZACAO.md`
- `04-MODELO-DE-DADOS-E-LOCALSTORAGE.md`
- `05-CHECKLIST-DE-VALIDACAO.md`
- `06-PROMPTS-PADRAO.md`
- `07-ROADMAP-E-BACKLOG.md`
- `08-REGISTRO-DE-DECISOES.md`
- `09-CHANGELOG.md`
- `10-CRITERIOS-DE-ACEITE.md`

## Resumo da versão 0.3.2

- Exibição visual da versão.
- Modal e destaque para campos obrigatórios.
- Accordion em Contas e Cartões.
- Filtros em Lançamentos.
- Recategorização protegida em Lançamentos, Contas e Cartões.
- Histórico de despesas compartilhadas quitadas.
- Correção da restauração de metas/limites por categoria.

## Validação atualizada

Conforme validação informada pelo usuário em 2026-06-29:

```bash
npm run dev     # concluído
npm run build   # concluído
npm run preview # concluído após ajuste local
```

Próximo foco: executar os testes manuais funcionais da versão `0.3.2`, especialmente filtros, recategorização protegida, backup/restauração com metas por categoria e histórico de despesas compartilhadas.


## Complemento — versão 0.3.3

A versão `0.3.3` adiciona importação de extratos de vales Pluxee em PDF/TXT.

### Dependência obrigatória

Antes de executar a versão, instalar:

```bash
npm install pdfjs-dist
```

### Validação recomendada

```bash
npm run dev
npm run build
npm run preview
```

Na aba **Importar**, selecionar **Extrato de vale**, informar o ano do extrato, selecionar a conta de vale e carregar o PDF Pluxee.


## Atualização complementar — v0.3.4

- Ajustado comportamento dos campos de número de parcelas.
- O campo não recebe mais valor padrão visual automático.
- O usuário pode limpar o campo completamente antes de informar o número correto.
- A gravação valida o número de parcelas apenas quando necessário.
- Não houve impacto em LocalStorage.

Validação recomendada:

```bash
npm run dev
npm run build
npm run preview
```



## Atualização complementar — v0.3.5

Correção da importação de extratos Pluxee de vales.

### Regra corrigida

- `DISPONIBILIZACAO DE VALOR` deve ser importado como receita/crédito.
- Todos os demais movimentos do extrato Pluxee devem ser importados como despesa/débito.

### Validação já informada pelo usuário

- Acesso à aba Importar.
- Seleção de Extrato de vale / Pluxee.
- Informação do ano do extrato.
- Seleção da conta de vale.
- Importação do PDF.
- Conferência da prévia.
- Salvamento da importação.
- Verificação dos lançamentos na conta de vale.
- Teste de duplicidade por reimportação.
- Desfazer lote importado.

### Validação local concluída após correção

Conforme informado pelo usuário em 2026-06-29, a validação técnica local da v0.3.5 foi concluída:

```bash
npm install     # aprovado
npm run dev     # aprovado
npm run build   # aprovado com alerta não bloqueante de chunk > 500 kB
npm run preview # aprovado
```

Observação: o alerta de chunk acima de 500 kB não impede a publicação/uso da versão. Ele deve ser tratado futuramente com modularização incremental e possível carregamento sob demanda, principalmente para a área de importação/PDF.

### Validação funcional ainda recomendada

- Confirmar em novo teste que `DISPONIBILIZACAO DE VALOR` entra como receita/crédito.
- Confirmar em novo teste que todos os demais movimentos Pluxee entram como despesa/débito.


## Atualização complementar — v0.3.6

Refatoração técnica incremental após validação do passo 3.

### Testes do passo 3

Conforme informado pelo usuário, os testes pendentes do passo 3 foram validados. Considerar concluída a validação funcional de:

- filtros da aba **Lançamentos**;
- recategorização protegida nas abas **Lançamentos**, **Contas** e **Cartões**;
- backup/restauração com metas por categoria;
- histórico de despesas compartilhadas.

### Refatoração aplicada no passo 4

- Criado `src/components/ui/RequiredFieldModal.jsx`.
- Movidos para o novo arquivo o modal de campo obrigatório e os helpers `requiredFieldInfo` e `highlightIfRequired`.
- `src/App.jsx` passou a importar esses itens.

### Impacto

- Sem alteração de regra de negócio.
- Sem alteração de LocalStorage.
- Sem alteração intencional de comportamento visual ou funcional.

### Validação recomendada

```bash
npm run dev
npm run build
npm run preview
```

Validar pelo menos um fluxo que dispare modal de campo obrigatório.


## Atualização complementar — v0.3.7

A versão `0.3.7` dá continuidade à refatoração incremental e padroniza os campos de data para o padrão brasileiro.

### Refatoração realizada

- Criado `src/components/ui/DateInput.jsx`.
- Substituídos os campos editáveis de data por `DateInput`.
- Mantida a extração anterior de `RequiredFieldModal`.

### Regra de data preservada

- O usuário digita e visualiza datas como `dd/mm/aaaa`.
- O sistema continua salvando datas internamente como `YYYY-MM-DD`.
- Não houve alteração em LocalStorage.
- Não houve migração de dados.

### Validação recomendada

```bash
npm run dev
npm run build
npm run preview
```

Validar manualmente:

- Cadastro de lançamento com data única.
- Cadastro de compra parcelada com data da primeira parcela.
- Simulação com data da primeira compra.
- Filtros por data inicial e data final na aba Lançamentos.
- Pessoas: dívida, amortização e despesa compartilhada com data.
- Recarregar a página e confirmar que datas persistidas continuam corretas.
