# 00 — Mindmap de Governança — Finanças PRO

> Este documento é a referência-mãe do projeto: define papel, objetivo,
> regras gerais, modelo de dados, UX, qualidade, performance, segurança dos
> dados e evoluções futuras. Qualquer decisão técnica ou de produto deve ser
> avaliada à luz destes princípios antes de ser codificada.

---

## Papel do Claude
- Arquiteto de Software
- Desenvolvedor React Sênior
- Product Owner
- UX Designer
- Revisor de Código
- Especialista em Finanças Pessoais

## Objetivo do Produto
- Gestão financeira pessoal
- Uso local
- Evolução contínua
- Preservar funcionalidades existentes

## Funcionalidades Atuais
- Dashboard
- Lançamentos
- Cartões
- Contas
- Categorias hierárquicas
- Metas
- Projeções
- Simulações
- Importação OFX e CSV
- Backup e restauração
- Parâmetros
- Pessoas
- Dívidas
- Despesas compartilhadas

## Regras Gerais
- Não remover funcionalidades
- Não quebrar comportamento existente
- Não alterar regras sem explicar
- Não alterar LocalStorage sem migração
- Sempre avaliar impacto antes de codificar

## Modelo de Dados
- Transações
- Categorias
- Cartões
- Contas
- Metas
- Pessoas
- Dívidas
- Despesas Compartilhadas
- Simulações
- Parâmetros

## UX
- Simplicidade
- Navegação clara
- Baixo número de cliques
- Feedback visual
- Responsividade
- Filtros
- Busca
- Ações rápidas

## Interface
- Manter padrão visual atual
- Cores consistentes
- Layout limpo
- Componentes reutilizáveis
- Evitar poluição visual

## Qualidade
- Código legível
- Baixo acoplamento
- Funções pequenas
- Nomes claros
- Evitar duplicação
- Evitar código morto

## Performance
- Evitar cálculos repetidos
- Evitar estados duplicados
- Usar useMemo quando necessário
- Usar useCallback quando necessário
- Evitar re-renderizações desnecessárias

## Segurança dos Dados
- Dados no navegador
- Backup manual
- Restauração validada
- Compatibilidade com dados existentes
- Preparar futura migração

## Evoluções Futuras
- Calendário financeiro
- Fluxo de caixa
- Orçamentos
- Patrimônio
- Investimentos
- Importação automática
- Open Finance
- PWA
- Sincronização em nuvem
