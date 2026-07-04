# Manifesto do pacote — Finanças PRO v0.3.18

Gerado em: 2026-07-04

## Código

- `src/App.jsx` — versão principal `v0.3.18` para substituir no projeto.
- `App_v0_3_18.jsx` — cópia versionada da mesma versão.
- `src/services/financeRepository.js` — novo repository local de persistência.
- `src/hooks/useLocalStorage.js` — hook atualizado para usar o repository local.

## Documentação atualizada

- `09-CHANGELOG.md`
- `07-ROADMAP-E-BACKLOG.md`
- `08-REGISTRO-DE-DECISOES.md`
- `CHANGELOG-v0.3.17.4.md`
- `CHANGELOG-v0.3.18.md`
- `MANIFESTO-v0.3.17.4.md`
- `16-RETOMADA-2026-07-04-POS-v0.3.17.4.md`

## Escopo da v0.3.18

- Início da camada local de repository/storage.
- Manutenção do LocalStorage como persistência oficial.
- Preservação da assinatura de `useLS`, `lsGet` e `lsSave`.
- Sem alteração de regras financeiras.
- Sem migração de dados.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```

## Testes manuais mínimos

- Abrir aplicação sem tela branca.
- Confirmar versão visual `v0.3.18`.
- Criar lançamento e recarregar página.
- Criar simulação e recarregar página.
- Exportar backup.
- Confirmar dados preservados.
