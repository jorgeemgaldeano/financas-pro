# Changelog — Finanças PRO v0.3.18

Data: 2026-07-04

## Objetivo

Iniciar a opção B: criação de uma camada local de repository/storage para preparar o Finanças PRO para futura troca de persistência, mantendo LocalStorage como mecanismo oficial nesta etapa.

## Adicionado

- Criado `src/services/financeRepository.js` com operações básicas sobre LocalStorage:
  - `get`;
  - `set`;
  - `remove`;
  - `exists`;
  - `snapshot`;
  - `clearByPrefix`.

## Alterado

- `src/hooks/useLocalStorage.js` passou a delegar leitura e gravação para `localFinanceRepository`.
- Mantidas as funções públicas já usadas pela aplicação:
  - `useLS`;
  - `lsGet`;
  - `lsSave`.
- Versão visual atualizada para `v0.3.18`.

## Regras preservadas

- LocalStorage continua sendo a persistência oficial.
- As chaves existentes continuam usando o prefixo atual.
- A assinatura de `useLS` permanece compatível com o `App.jsx` atual.
- Nenhuma regra financeira foi alterada.

## Impacto em LocalStorage

- Sem alteração de chaves.
- Sem alteração de formato persistido.
- Sem migração.
- A alteração cria apenas uma camada intermediária para acesso às mesmas chaves existentes.

## Avaliação de reutilização e bibliotecas

### Reaproveitamento interno

- Reaproveitado `LS_PREFIX` de `src/constants/storageKeys.js`.
- Reaproveitado o contrato existente de `useLS`, `lsGet` e `lsSave`.

### Recursos React nativos

- Mantido uso de `useState` e `useCallback`.

### Bibliotecas avaliadas

- Nenhuma biblioteca externa foi adicionada.

### Código novo necessário

- `src/services/financeRepository.js`.
- Ajuste conservador de `src/hooks/useLocalStorage.js`.

### Justificativa

A camada repository reduz acoplamento direto entre hooks/componentes e LocalStorage, preparando futura migração para backend/API sem alterar comportamento agora.

## Testes recomendados

1. Executar `npm run dev`.
2. Confirmar abertura sem tela branca.
3. Confirmar versão visual `v0.3.18`.
4. Criar lançamento e recarregar a página.
5. Criar simulação e recarregar a página.
6. Editar parâmetros e recarregar a página.
7. Exportar backup.
8. Executar `npm run build`.
9. Executar `npm run preview`.
