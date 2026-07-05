# Changelog — Finanças PRO v0.3.23

Data: 2026-07-04

## Objetivo

Corrigir o comportamento do controle **Projetar recorrências** na aba **Projeções** e iniciar a revisão funcional conservadora de recorrências e lançamentos previstos, preservando LocalStorage e dados existentes.

## Corrigido

- Ajustado o filtro **Projetar recorrências previstas** para ter efeito real no cálculo da projeção.
- Ao desmarcar o filtro, lançamentos recorrentes ainda previstos deixam de compor a projeção analítica.
- Valores recorrentes já realizados permanecem considerados, pois já fazem parte do histórico financeiro do mês.

## Alterado

- Renomeado o texto do filtro para **Projetar recorrências previstas**, deixando mais claro o comportamento esperado.
- Incluída mensagem explicativa na tela de Projeções sobre o efeito do filtro.
- `projectionService.js` passou a diferenciar recorrências previstas de valores já realizados.
- Versão visual atualizada para `v0.3.23`.

## Regras preservadas

- Não há criação automática de novos lançamentos no LocalStorage.
- Não há alteração de dados existentes.
- Não há alteração no fechamento de faturas.
- Não há alteração em simulações.
- Não há alteração na regra de baixa total ou parcial.

## Impacto em LocalStorage

- Sem nova chave.
- Sem alteração de estrutura.
- Sem migração.
- Sem alteração no backup/restauração.

## Avaliação de reutilização e bibliotecas

### Reaproveitamento interno

- Reaproveitado `projectionService.js` criado nas versões anteriores.
- Reaproveitado o modelo atual de lançamentos recorrentes com `fixo`, `recorrenciaId` e `parcelaGrupo`.
- Reaproveitada a tela de Projeções da `v0.3.22`.

### Recursos React nativos

- Mantido `useMemo` para cálculo derivado.
- Mantido `useState` para filtros da tela.

### Bibliotecas avaliadas

- Nenhuma biblioteca externa foi adicionada.

### Código novo necessário

- Funções puras em `projectionService.js` para identificar recorrências e decidir se devem entrar no cálculo.

### Justificativa

O problema estava no fato de que o filtro removia apenas recorrências geradas dinamicamente pelo service, mas não removia lançamentos fixos/recorrentes já materializados como previstos no array de transações. A correção passa a tratar também esses registros.

## Testes recomendados

1. Abrir a aplicação e confirmar versão `v0.3.23`.
2. Abrir aba **Projeções**.
3. Confirmar que o filtro **Projetar recorrências previstas** aparece marcado por padrão.
4. Anotar totais de receitas/despesas/saídas com o filtro marcado.
5. Desmarcar o filtro.
6. Confirmar alteração nos totais e no gráfico quando houver recorrências previstas no período.
7. Confirmar que valores já pagos/recebidos permanecem no cálculo.
8. Recarregar a página e confirmar funcionamento.
9. Executar `npm run build`.
10. Executar `npm run preview`.
